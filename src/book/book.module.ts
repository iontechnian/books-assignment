import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { Book } from './book.entity';
import { Author } from '../author/author.entity';
import { AuthorModule } from '../author/author.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Author]),
    AuthorModule,
  ],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {} 