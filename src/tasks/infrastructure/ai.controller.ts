import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { diskStorage } from "multer";
import { extname } from "path";
import * as fs from "fs";
import { TasksService } from "../application/tasks.service";

@Controller("tasks/ai")
export class AiController {
  private genAI: GoogleGenerativeAI;
  private fileManager: GoogleAIFileManager;

  constructor(private readonly tasksService: TasksService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.fileManager = new GoogleAIFileManager(apiKey);
    }
  }

  @Post("analyze-video")
  @UseInterceptors(
    FileInterceptor("video", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    })
  )
  async analyzeVideo(@UploadedFile() file: Express.Multer.File) {
    if (!this.genAI) {
      throw new HttpException(
        "GEMINI_API_KEY not configured",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    try {
      // 1. Upload to Gemini
      console.log("Uploading file to Gemini...", file.path);
      const uploadResponse = await this.fileManager.uploadFile(file.path, {
        mimeType: file.mimetype,
        displayName: file.originalname,
      });

      console.log(
        `Uploaded file, uri: ${uploadResponse.file.uri}, state: ${uploadResponse.file.state}`
      );

      // 2. Wait for processing (for videos it's usually active, but good practice to check)
      let fileState = await this.fileManager.getFile(uploadResponse.file.name);
      while (fileState.state === "PROCESSING") {
        console.log("Processing video...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        fileState = await this.fileManager.getFile(uploadResponse.file.name);
      }

      if (fileState.state === "FAILED") {
        throw new Error("Video processing failed.");
      }

      // 3. Generate Content
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        },
        {
          text: 'Analyze this video and extract the most important points as a JSON list of tasks. Return ONLY valid JSON in the format: [{"title": "...", "description": "...", "priority": "medium", "status": "todo"}]. Do not add markdown code blocks.',
        },
      ]);

      const responseText = result.response.text();
      console.log("Gemini Response:", responseText);

      // Clean up local file because we don't need it anymore
      fs.unlinkSync(file.path);

      // Attempt to parse JSON
      try {
        const cleanJson = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse JSON", e);
        return { raw: responseText };
      }
    } catch (error) {
      console.error("Error analyzing video:", error);
      // Clean up local file in case of error
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new HttpException(
        "Failed to analyze video: " + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("search")
  async aiSearch(@Query("query") query: string) {
    if (!this.genAI) {
      throw new HttpException(
        "GEMINI_API_KEY not configured",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    try {
      // Fetch all tasks (simplified approach for "Database Interpretation")
      // Ideally we would search using embedding or SQL generation, but for this scale
      // feeding Context to LLM is effective and fits "Interpret Database" request.
      const allTasks = await this.tasksService.findAll({ limit: 100 }); // Analyzing last 100 tasks contexts
      const tasksContext = JSON.stringify(
        allTasks.data.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
        }))
      );

      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `
            You are an AI assistant analyzing a database of tasks.
            User Query: "${query}"
            
            Tasks Database:
            ${tasksContext}
            
            Return a list of Task IDs that are relevant to the user query.
            If the query is asking to count or summarize, provide the summary.
            But primarily, I want you to filter the tasks.
            Return ONLY a JSON object: { "relevantTaskIds": ["id1", "id2"], "summary": "optional summary if asked" }
            `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      try {
        const cleanJson = text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(cleanJson);

        if (parsed.relevantTaskIds && parsed.relevantTaskIds.length > 0) {
          const filteredTasks = allTasks.data.filter((t) =>
            parsed.relevantTaskIds.includes(t.id)
          );
          return { tasks: filteredTasks, summary: parsed.summary };
        }
        return {
          tasks: [],
          summary: parsed.summary || "No relevant tasks found.",
        };
      } catch (e) {
        console.error("AI Search Parse Error", e);
        return { error: "Failed to interpret search result", raw: text };
      }
    } catch (error) {
      console.error("Error in AI Search:", error);
      throw new HttpException(
        "AI Search failed: " + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
