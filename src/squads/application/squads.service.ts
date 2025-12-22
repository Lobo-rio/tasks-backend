import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like } from "typeorm";
import { Squad } from "../domain/squad.entity";
import { CreateSquadDto } from "./dto/create-squad.dto";
import { UpdateSquadDto } from "./dto/update-squad.dto";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { PaginatedResult } from "../../common/interfaces/paginated-result.interface";

@Injectable()
export class SquadsService {
  constructor(
    @InjectRepository(Squad)
    private readonly squadRepository: Repository<Squad>
  ) {}

  async create(createSquadDto: CreateSquadDto): Promise<Squad> {
    const squad = this.squadRepository.create(createSquadDto);
    return await this.squadRepository.save(squad);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Squad>> {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const whereConditions = search
      ? [{ name: Like(`%${search}%`) }, { description: Like(`%${search}%`) }]
      : {};

    const [data, total] = await this.squadRepository.findAndCount({
      where: whereConditions,
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

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

  async findOne(id: string): Promise<Squad> {
    const squad = await this.squadRepository.findOne({ where: { id } });

    if (!squad) {
      throw new NotFoundException(`Squad with ID ${id} not found`);
    }

    return squad;
  }

  async update(id: string, updateSquadDto: UpdateSquadDto): Promise<Squad> {
    const squad = await this.findOne(id);
    Object.assign(squad, updateSquadDto);
    return await this.squadRepository.save(squad);
  }

  async remove(id: string): Promise<void> {
    const squad = await this.findOne(id);
    await this.squadRepository.remove(squad);
  }
}
