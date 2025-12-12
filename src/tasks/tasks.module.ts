import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './domain/task.entity';
import { TasksService } from './application/tasks.service';
import { TasksController } from './infrastructure/tasks.controller';

import { AiController } from './infrastructure/ai.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Task])],
    controllers: [TasksController, AiController],
    providers: [TasksService],
    exports: [TasksService],
})
export class TasksModule { }
