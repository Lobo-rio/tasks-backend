import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Squad } from "./domain/squad.entity";
import { SquadsService } from "./application/squads.service";
import { SquadsController } from "./infrastructure/squads.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Squad])],
  controllers: [SquadsController],
  providers: [SquadsService],
  exports: [SquadsService],
})
export class SquadsModule {}
