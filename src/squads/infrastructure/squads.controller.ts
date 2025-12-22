import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { SquadsService } from "../application/squads.service";
import { CreateSquadDto } from "../application/dto/create-squad.dto";
import { UpdateSquadDto } from "../application/dto/update-squad.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";

@Controller("squads")
export class SquadsController {
  constructor(private readonly squadsService: SquadsService) {}

  @Post()
  create(@Body() createSquadDto: CreateSquadDto) {
    return this.squadsService.create(createSquadDto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.squadsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.squadsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateSquadDto: UpdateSquadDto) {
    return this.squadsService.update(id, updateSquadDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.squadsService.remove(id);
  }
}
