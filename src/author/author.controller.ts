import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, ParseUUIDPipe, Query } from '@nestjs/common';
import { AuthorService } from './author.service';
import { Author } from './author.entity';
import { CreateAuthorDto, UpdateAuthorDto } from './author.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationResponse } from '../common/interfaces/pagination-response.interface';

@ApiTags('authors')
@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @ApiOperation({ summary: 'Get all authors with pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns paginated authors.', 
    schema: {
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/Author' }
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
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginationResponse<Author>> {
    return this.authorService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get author by ID' })
  @ApiParam({ name: 'id', description: 'Author ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Returns a single author.', type: Author })
  @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
  @ApiResponse({ status: 404, description: 'Author not found.' })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Author> {
    return this.authorService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new author' })
  @ApiResponse({ status: 201, description: 'Author successfully created.', type: Author })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Post()
  async create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorService.create(createAuthorDto);
  }

  @ApiOperation({ summary: 'Update author' })
  @ApiParam({ name: 'id', description: 'Author ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Author successfully updated.', type: Author })
  @ApiResponse({ status: 400, description: 'Invalid UUID format or invalid input.' })
  @ApiResponse({ status: 404, description: 'Author not found.' })
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    return this.authorService.update(id, updateAuthorDto);
  }

  @ApiOperation({ summary: 'Delete author' })
  @ApiParam({ name: 'id', description: 'Author ID', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Author successfully deleted.' })
  @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
  @ApiResponse({ status: 404, description: 'Author not found.' })
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.authorService.remove(id);
  }
} 