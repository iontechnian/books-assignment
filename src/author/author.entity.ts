import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Book } from '../book/book.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Author {
  @ApiProperty({ description: 'The unique identifier of the author', example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The first name of the author', example: 'John' })
  @Column()
  firstName: string;

  @ApiProperty({ description: 'The last name of the author', example: 'Doe' })
  @Column()
  lastName: string;

  @ApiProperty({ description: 'The date when the author was created', type: Date })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'The date when the author was last updated', type: Date })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'The books written by this author', type: () => [Book] })
  @OneToMany(() => Book, book => book.author)
  books: Book[];
} 