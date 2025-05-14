import { IsString, IsNumber, IsDate, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({ description: 'The title of the book' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'The UUID of the author', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  authorId: string;

  @ApiProperty({ description: 'The number of pages in the book', example: 300 })
  @IsNumber()
  @Type(() => Number)
  pageCount: number;

  @ApiProperty({ description: 'The release date of the book' })
  @IsDate()
  @Type(() => Date)
  releaseDate: Date;
}

export class UpdateBookDto {
  @ApiPropertyOptional({ description: 'The title of the book' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'The UUID of the author', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({ description: 'The number of pages in the book', example: 300 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageCount?: number;

  @ApiPropertyOptional({ description: 'The release date of the book' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  releaseDate?: Date;
} 