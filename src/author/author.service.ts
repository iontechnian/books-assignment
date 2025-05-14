import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './author.entity';
import { CreateAuthorDto, UpdateAuthorDto } from './author.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/interfaces/pagination-response.interface';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async findAll(paginationDto?: PaginationDto): Promise<PaginationResponse<Author>> {
    const { page = 0, limit = 10 } = paginationDto || {};
    
    const [items, total] = await this.authorRepository.findAndCount({
      relations: ['books'],
      skip: page * limit,
      take: limit,
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorRepository.findOne({ 
      where: { id },
      relations: ['books']
    });
    
    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }
    
    return author;
  }

  async create(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorRepository.create(createAuthorDto);
    return this.authorRepository.save(author);
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = await this.findOne(id);
    
    // Update the properties
    Object.assign(author, updateAuthorDto);
    
    return this.authorRepository.save(author);
  }

  async remove(id: string): Promise<void> {
    const author = await this.findOne(id);
    await this.authorRepository.remove(author);
  }
}