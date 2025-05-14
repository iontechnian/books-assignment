import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, ParseUUIDPipe, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './book.entity';
import { CreateBookDto, UpdateBookDto } from './book.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/interfaces/pagination-response.interface';

@ApiTags('books')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiOperation({ summary: 'Get all books with pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated books.', 
    schema: {
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Book' }
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (0-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @Get()
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginationResponse<Book>> {
    return this.bookService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get book by ID' })
  @ApiParam({ name: 'id', description: 'Book ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns a single book.', type: Book })
  @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Book> {
    return this.bookService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new book' })
  @ApiResponse({ status: 201, description: 'Book successfully created.', type: Book })
  @ApiResponse({ status: 400, description: 'Invalid input or invalid author ID.' })
  @ApiResponse({ status: 404, description: 'Author not found.' })
  @Post()
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.bookService.create(createBookDto);
  }

  @ApiOperation({ summary: 'Update book' })
  @ApiParam({ name: 'id', description: 'Book ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Book successfully updated.', type: Book })
  @ApiResponse({ status: 400, description: 'Invalid UUID format or invalid input.' })
  @ApiResponse({ status: 404, description: 'Book or author not found.' })
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return this.bookService.update(id, updateBookDto);
  }

  @ApiOperation({ summary: 'Delete book' })
  @ApiParam({ name: 'id', description: 'Book ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Book successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.bookService.remove(id);
  }
} 