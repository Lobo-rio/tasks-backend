import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "../domain/task.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    return await this.taskRepository.save(task);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Task>> {
    const {
      search,
      page = 1,
      limit = 10,
      status,
      priority,
      userId,
      squadId,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.taskRepository
      .createQueryBuilder("task")
      .leftJoinAndSelect("task.user", "user")
      .leftJoinAndSelect("task.squad", "squad")
      .skip(skip)
      .take(limit)
      .orderBy("task.createdAt", "DESC");

    if (status) queryBuilder.andWhere("task.status = :status", { status });
    if (priority)
      queryBuilder.andWhere("task.priority = :priority", { priority });
    if (userId) queryBuilder.andWhere("task.user_id = :userId", { userId });
    if (squadId) queryBuilder.andWhere("task.squad_id = :squadId", { squadId });

    if (startDate)
      queryBuilder.andWhere("task.due_date >= :startDate", { startDate });
    if (endDate)
      queryBuilder.andWhere("task.due_date <= :endDate", { endDate });

    if (search) {
      queryBuilder.andWhere(
        "(task.title LIKE :search OR task.description LIKE :search)",
        { search: `%${search}%` }
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ["user", "squad"],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }
}
