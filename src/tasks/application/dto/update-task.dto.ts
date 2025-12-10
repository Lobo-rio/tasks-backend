import {
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    IsDateString,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../../domain/task.entity';

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus;

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsUUID()
    userId?: string;

    @IsOptional()
    @IsUUID()
    squadId?: string;
}
