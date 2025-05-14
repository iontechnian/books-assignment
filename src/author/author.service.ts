import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from './author.entity';
import { CreateAuthorDto, UpdateAuthorDto } from './author.dto';

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async findAll(): Promise<Author[]> {
    return this.authorRepository.find({ relations: ['books'] });
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