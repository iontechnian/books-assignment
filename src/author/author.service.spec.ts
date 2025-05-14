import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AuthorService } from './author.service';
import { Author } from './author.entity';
import { CreateAuthorDto, UpdateAuthorDto } from './author.dto';
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

describe('AuthorService', () => {
  let service: AuthorService;
  let authorRepository: MockRepository<Author>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorService,
        {
          provide: getRepositoryToken(Author),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<AuthorService>(AuthorService);
    authorRepository = module.get<MockRepository<Author>>(getRepositoryToken(Author));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a paginated response with default pagination parameters', async () => {
      const authors = [
        { id: '1', firstName: 'John', lastName: 'Doe', books: [] },
        { id: '2', firstName: 'Jane', lastName: 'Smith', books: [] },
      ];
      const total = 2;
      authorRepository.findAndCount!.mockResolvedValue([authors, total]);

      const result = await service.findAll();
      expect(result).toEqual({
        items: authors,
        meta: {
          total,
          page: 0,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(authorRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['books'],
        skip: 0,
        take: 10,
      });
    });

    it('should return a paginated response with custom pagination parameters', async () => {
      const paginationDto: PaginationDto = { page: 2, limit: 5 };
      const authors = [
        { id: '5', firstName: 'Mark', lastName: 'Johnson', books: [] },
        { id: '6', firstName: 'Sarah', lastName: 'Williams', books: [] },
      ];
      const total = 12;
      authorRepository.findAndCount!.mockResolvedValue([authors, total]);

      const result = await service.findAll(paginationDto);
      expect(result).toEqual({
        items: authors,
        meta: {
          total,
          page: paginationDto.page,
          limit: paginationDto.limit,
          totalPages: 3,
        },
      });
      expect(authorRepository.findAndCount).toHaveBeenCalledWith({
        relations: ['books'],
        skip: paginationDto.page! * paginationDto.limit!,
        take: paginationDto.limit,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single author', async () => {
      const authorId = '1';
      const expectedAuthor = { id: authorId, firstName: 'John', lastName: 'Doe', books: [] };
      authorRepository.findOne!.mockResolvedValue(expectedAuthor);

      const result = await service.findOne(authorId);
      expect(result).toEqual(expectedAuthor);
      expect(authorRepository.findOne).toHaveBeenCalledWith({
        where: { id: authorId },
        relations: ['books'],
      });
    });

    it('should throw NotFoundException when author is not found', async () => {
      const authorId = '999';
      authorRepository.findOne!.mockResolvedValue(null);

      await expect(service.findOne(authorId)).rejects.toThrow(NotFoundException);
      expect(authorRepository.findOne).toHaveBeenCalledWith({
        where: { id: authorId },
        relations: ['books'],
      });
    });
  });

  describe('create', () => {
    it('should successfully create an author', async () => {
      const createAuthorDto: CreateAuthorDto = {
        firstName: 'John',
        lastName: 'Doe',
      };
      const newAuthor = { id: '1', ...createAuthorDto, books: [] };
      
      authorRepository.create!.mockReturnValue(newAuthor);
      authorRepository.save!.mockResolvedValue(newAuthor);

      const result = await service.create(createAuthorDto);
      expect(result).toEqual(newAuthor);
      expect(authorRepository.create).toHaveBeenCalledWith(createAuthorDto);
      expect(authorRepository.save).toHaveBeenCalledWith(newAuthor);
    });
  });

  describe('update', () => {
    it('should update an author successfully', async () => {
      const authorId = '1';
      const existingAuthor = { id: authorId, firstName: 'John', lastName: 'Doe', books: [] };
      const updateAuthorDto: UpdateAuthorDto = { firstName: 'Jane' };
      const updatedAuthor = { ...existingAuthor, ...updateAuthorDto };
      
      authorRepository.findOne!.mockResolvedValue(existingAuthor);
      authorRepository.save!.mockResolvedValue(updatedAuthor);

      const result = await service.update(authorId, updateAuthorDto);
      expect(result).toEqual(updatedAuthor);
      expect(authorRepository.findOne).toHaveBeenCalledWith({
        where: { id: authorId },
        relations: ['books'],
      });
      expect(authorRepository.save).toHaveBeenCalledWith({
        ...existingAuthor,
        ...updateAuthorDto,
      });
    });

    it('should throw NotFoundException when updating a non-existent author', async () => {
      const authorId = '999';
      const updateAuthorDto: UpdateAuthorDto = { firstName: 'Jane' };
      
      authorRepository.findOne!.mockResolvedValue(null);

      await expect(service.update(authorId, updateAuthorDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an author successfully', async () => {
      const authorId = '1';
      const existingAuthor = { id: authorId, firstName: 'John', lastName: 'Doe', books: [] };
      
      authorRepository.findOne!.mockResolvedValue(existingAuthor);
      authorRepository.remove!.mockResolvedValue(undefined);

      await service.remove(authorId);
      expect(authorRepository.findOne).toHaveBeenCalledWith({
        where: { id: authorId },
        relations: ['books'],
      });
      expect(authorRepository.remove).toHaveBeenCalledWith(existingAuthor);
    });

    it('should throw NotFoundException when removing a non-existent author', async () => {
      const authorId = '999';
      
      authorRepository.findOne!.mockResolvedValue(null);

      await expect(service.remove(authorId)).rejects.toThrow(NotFoundException);
    });
  });
}); 