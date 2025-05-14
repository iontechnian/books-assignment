import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './book.entity';
import { Author } from '../author/author.entity';
import { CreateBookDto, UpdateBookDto } from './book.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/interfaces/pagination-response.interface';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private authorRepository: Repository<Author>,
  ) {}

  async findAll(paginationDto?: PaginationDto): Promise<PaginationResponse<Book>> {
    const { page = 0, limit = 10 } = paginationDto || {};
    
    const [items, total] = await this.bookRepository.findAndCount({
      relations: ['author'],
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

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOne({ 
      where: { id },
      relations: ['author']
    });
    
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    
    return book;
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const { authorId, ...bookDetails } = createBookDto;
    
    // Find the author
    const author = await this.authorRepository.findOneBy({ id: authorId });
    if (!author) {
      throw new NotFoundException(`Author with ID ${authorId} not found`);
    }
    
    // Create the book
    const book = this.bookRepository.create({
      ...bookDetails,
      author,
    });
    
    return this.bookRepository.save(book);
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    
    // If authorId is provided, find the author
    if (updateBookDto.authorId) {
      const author = await this.authorRepository.findOneBy({ id: updateBookDto.authorId });
      if (!author) {
        throw new NotFoundException(`Author with ID ${updateBookDto.authorId} not found`);
      }
      book.author = author;
      
      // Remove authorId from the DTO to prevent errors when spreading
      const { authorId, ...bookDetails } = updateBookDto;
      Object.assign(book, bookDetails);
    } else {
      // Update other properties
      Object.assign(book, updateBookDto);
    }
    
    return this.bookRepository.save(book);
  }

  async remove(id: string): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
  }
} 