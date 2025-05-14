import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Author } from '../author/author.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Book {
  @ApiProperty({ description: 'The unique identifier of the book', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The title of the book', example: 'The Great Gatsby' })
  @Column()
  title: string;

  @ApiProperty({ description: 'The author of the book', type: () => Author })
  @ManyToOne(() => Author, author => author.books)
  author: Author;

  @ApiProperty({ description: 'The number of pages in the book', example: 300 })
  @Column()
  pageCount: number;

  @ApiProperty({ description: 'The date when the book was created in the system', type: Date })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the book was last updated in the system', type: Date })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'The date when the book was released', type: Date, example: '2023-01-01' })
  @Column()
  releaseDate: Date;
} 