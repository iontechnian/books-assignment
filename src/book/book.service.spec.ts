import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BookService } from './book.service';
import { Book } from './book.entity';
import { Author } from '../author/author.entity';
import { CreateBookDto, UpdateBookDto } from './book.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T extends ObjectLiteral>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('BookService', () => {
  let service: BookService;
  let bookRepository: MockRepository<Book>;
  let authorRepository: MockRepository<Author>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getRepositoryToken(Book),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Author),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    bookRepository = module.get<MockRepository<Book>>(getRepositoryToken(Book));
    authorRepository = module.get<MockRepository<Author>>(getRepositoryToken(Author));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a paginated response with default pagination parameters', async () => {
      const books = [
        { id: '1', title: 'Test Book 1', author: { id: '1', firstName: 'John', lastName: 'Doe' }, pageCount: 100, releaseDate: new Date() },
        { id: '2', title: 'Test Book 2', author: { id: '2', firstName: 'Jane', lastName: 'Smith' }, pageCount: 200, releaseDate: new Date() },
      ];
      const total = 2;
      bookRepository.findAndCount!.mockResolvedValue([books, total]);

      const result = await service.findAll();
      expect(result).toEqual({
        items: books,
        meta: {
          total,
          page: 0,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(bookRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['author'],
        skip: 0,
        take: 10,
      });
    });

    it('should return a paginated response with custom pagination parameters', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 3 };
      const books = [
        { id: '4', title: 'Test Book 4', author: { id: '1', firstName: 'John', lastName: 'Doe' }, pageCount: 180, releaseDate: new Date() },
        { id: '5', title: 'Test Book 5', author: { id: '2', firstName: 'Jane', lastName: 'Smith' }, pageCount: 220, releaseDate: new Date() },
      ];
      const total = 8;
      bookRepository.findAndCount!.mockResolvedValue([books, total]);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        items: books,
        meta: {
          total,
          page: paginationDto.page,
          limit: paginationDto.limit,
          totalPages: Math.ceil(total / paginationDto.limit!),
        },
      });
      expect(bookRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['author'],
        skip: paginationDto.page! * paginationDto.limit!,
        take: paginationDto.limit,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single book', async () => {
      const bookId = '1';
      const expectedBook = { id: bookId, title: 'Test Book', author: { id: '1', firstName: 'John', lastName: 'Doe' }, pageCount: 100, releaseDate: new Date() };
      bookRepository.findOne!.mockResolvedValue(expectedBook);

      const result = await service.findOne(bookId);
      expect(result).toEqual(expectedBook);
      expect(bookRepository.findOne).toHaveBeenCalledWith({
        where: { id: bookId },
        relations: ['author'],
      });
    });

    it('should throw NotFoundException when book is not found', async () => {
      const bookId = '999';
      bookRepository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(bookId)).rejects.toThrow(NotFoundException);
      expect(bookRepository.findOne).toHaveBeenCalledWith({
        where: { id: bookId },
        relations: ['author'],
      });
    });
  });

  describe('create', () => {
    it('should successfully create a book', async () => {
      const authorId = '1';
      const author = { id: authorId, firstName: 'John', lastName: 'Doe' };
      const releaseDate = new Date();
      
      const createBookDto: CreateBookDto = {
        title: 'New Book',
        authorId,
        pageCount: 300,
        releaseDate,
      };
      
      const newBook = {
        id: '1',
        title: createBookDto.title,
        pageCount: createBookDto.pageCount,
        releaseDate: createBookDto.releaseDate,
        author,
      };
      
      authorRepository.findOneBy!.mockResolvedValue(author);
      bookRepository.create!.mockReturnValue(newBook);
      bookRepository.save!.mockResolvedValue(newBook);

      const result = await service.create(createBookDto);
      expect(result).toEqual(newBook);
      expect(authorRepository.findOneBy).toHaveBeenCalledWith({ id: authorId });
      expect(bookRepository.create).toHaveBeenCalledWith({
        title: createBookDto.title,
        pageCount: createBookDto.pageCount,
        releaseDate: createBookDto.releaseDate,
        author,
      });
      expect(bookRepository.save).toHaveBeenCalledWith(newBook);
    });

    it('should throw NotFoundException when author is not found', async () => {
      const authorId = '999';
      const createBookDto: CreateBookDto = {
        title: 'New Book',
        authorId,
        pageCount: 300,
        releaseDate: new Date(),
      };
      
      authorRepository.findOneBy!.mockResolvedValue(null);

      await expect(service.create(createBookDto)).rejects.toThrow(NotFoundException);
      expect(authorRepository.findOneBy).toHaveBeenCalledWith({ id: authorId });
    });
  });

  describe('update', () => {
    it('should update a book successfully with no author change', async () => {
      const bookId = '1';
      const author = { id: '1', firstName: 'John', lastName: 'Doe' };
      const existingBook = { 
        id: bookId, 
        title: 'Old Title', 
        author, 
        pageCount: 100,
        releaseDate: new Date('2023-01-01')
      };
      
      const updateBookDto: UpdateBookDto = { 
        title: 'New Title',
        pageCount: 200,
      };
      
      const updatedBook = { 
        ...existingBook, 
        ...updateBookDto 
      };
      
      bookRepository.findOne!.mockResolvedValue(existingBook);
      bookRepository.save!.mockResolvedValue(updatedBook);

      const result = await service.update(bookId, updateBookDto);
      expect(result).toEqual(updatedBook);
      expect(bookRepository.findOne).toHaveBeenCalledWith({
        where: { id: bookId },
        relations: ['author'],
      });
      expect(bookRepository.save).toHaveBeenCalledWith({
        ...existingBook,
        ...updateBookDto,
      });
      expect(authorRepository.findOneBy).not.toHaveBeenCalled();
    });

    it('should update a book with author change', async () => {
      const bookId = '1';
      const oldAuthor = { id: '1', firstName: 'John', lastName: 'Doe' };
      const newAuthorId = '2';
      const newAuthor = { id: newAuthorId, firstName: 'Jane', lastName: 'Smith' };
      
      const existingBook = { 
        id: bookId, 
        title: 'Book Title', 
        author: oldAuthor,
        pageCount: 100,
        releaseDate: new Date('2023-01-01')
      };
      
      const updateBookDto: UpdateBookDto = { 
        authorId: newAuthorId
      };
      
      const updatedBook = { 
        ...existingBook,
        author: newAuthor
      };
      
      bookRepository.findOne!.mockResolvedValue(existingBook);
      authorRepository.findOneBy!.mockResolvedValue(newAuthor);
      bookRepository.save!.mockResolvedValue(updatedBook);

      const result = await service.update(bookId, updateBookDto);
      expect(result).toEqual(updatedBook);
      expect(bookRepository.findOne).toHaveBeenCalledWith({
        where: { id: bookId },
        relations: ['author'],
      });
      expect(authorRepository.findOneBy).toHaveBeenCalledWith({ id: newAuthorId });
      expect(bookRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when book is not found', async () => {
      const bookId = '999';
      const updateBookDto: UpdateBookDto = { title: 'New Title' };
      
      bookRepository.findOne!.mockResolvedValue(null);

      await expect(service.update(bookId, updateBookDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when new author is not found', async () => {
      const bookId = '1';
      const newAuthorId = '999';
      const existingBook = { 
        id: bookId, 
        title: 'Book Title', 
        author: { id: '1', firstName: 'John', lastName: 'Doe' },
        pageCount: 100,
        releaseDate: new Date('2023-01-01')
      };
      
      const updateBookDto: UpdateBookDto = { 
        authorId: newAuthorId
      };
      
      bookRepository.findOne!.mockResolvedValue(existingBook);
      authorRepository.findOneBy!.mockResolvedValue(null);

      await expect(service.update(bookId, updateBookDto)).rejects.toThrow(NotFoundException);
      expect(authorRepository.findOneBy).toHaveBeenCalledWith({ id: newAuthorId });
    });
  });

  describe('remove', () => {
    it('should remove a book successfully', async () => {
      const bookId = '1';
      const existingBook = { 
        id: bookId, 
        title: 'Book to Remove', 
        author: { id: '1', firstName: 'John', lastName: 'Doe' },
        pageCount: 100,
        releaseDate: new Date()
      };
      
      bookRepository.findOne!.mockResolvedValue(existingBook);
      bookRepository.remove!.mockResolvedValue(undefined);

      await service.remove(bookId);
      expect(bookRepository.findOne).toHaveBeenCalledWith({
        where: { id: bookId },
        relations: ['author'],
      });
      expect(bookRepository.remove).toHaveBeenCalledWith(existingBook);
    });

    it('should throw NotFoundException when removing a non-existent book', async () => {
      const bookId = '999';
      
      bookRepository.findOne!.mockResolvedValue(null);

      await expect(service.remove(bookId)).rejects.toThrow(NotFoundException);
    });
  });
}); 