import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, ParseUUIDPipe } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './book.entity';
import { CreateBookDto, UpdateBookDto } from './book.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('books')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ status: 200, description: 'Returns all books.', type: [Book] })
  @Get()
  async findAll(): Promise<Book[]> {
    return this.bookService.findAll();
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