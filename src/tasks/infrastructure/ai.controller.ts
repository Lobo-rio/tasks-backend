import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
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
  private readonly logger = new Logger(AiController.name);

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
        "Chave de API GEMINI não configurada",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    try {
      this.logger.debug(`Enviando arquivo para Gemini: ${file.path}`);
      const uploadResponse = await this.fileManager.uploadFile(file.path, {
        mimeType: file.mimetype,
        displayName: file.originalname,
      });

      this.logger.log(
        `Arquivo enviado, uri: ${uploadResponse.file.uri}, estado: ${uploadResponse.file.state}`
      );

      let fileState = await this.fileManager.getFile(uploadResponse.file.name);
      while (fileState.state === "PROCESSING") {
        this.logger.debug("Processando vídeo...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        fileState = await this.fileManager.getFile(uploadResponse.file.name);
      }

      if (fileState.state === "FAILED") {
        throw new Error("Falha no processamento do vídeo.");
      }

      const model = this.genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
      });
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        },
        {
          text: 'Analyze this video and extract the most important points as a JSON list of tasks. Return ONLY valid JSON in the format: [{"title": "...", "description": "...", "priority": "medium", "status": "todo"}]. Do not add markdown code blocks. The response must be in Brazilian Portuguese.',
        },
      ]);

      const responseText = result.response.text();
      this.logger.debug(`Resposta do Gemini: ${responseText}`);

      fs.unlinkSync(file.path);

      try {
        const cleanJson = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        return JSON.parse(cleanJson);
      } catch (e) {
        this.logger.error(
          `Falha ao fazer parse do JSON: ${e.message}`,
          e.stack
        );
        return { raw: responseText };
      }
    } catch (error) {
      this.logger.error(
        `Erro ao analisar vídeo: ${error.message}`,
        error.stack
      );
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new HttpException(
        "Falha ao analisar o vídeo: " + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("search")
  async aiSearch(@Query("query") query: string) {
    if (!this.genAI) {
      throw new HttpException(
        "Chave de API GEMINI não configurada",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    try {
      const allTasks = await this.tasksService.findAll({ limit: 100 }); // Analyzing last 100 tasks contexts
      const tasksContext = JSON.stringify(
        allTasks.data.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
        }))
      );

      const model = this.genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
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
          summary: parsed.summary || "Nenhuma tarefa relevante encontrada.",
        };
      } catch (e) {
        this.logger.error(
          `Erro ao fazer parse da busca IA: ${e.message}`,
          e.stack
        );
        return { error: "Falha ao interpretar resultado da busca", raw: text };
      }
    } catch (error) {
      this.logger.error(`Erro na Busca IA: ${error.message}`, error.stack);
      throw new HttpException(
        "Falha na busca IA: " + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
