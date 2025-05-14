import { DataSource } from 'typeorm';
import { Author } from '../author/author.entity';
import { Book } from '../book/book.entity';
import { env } from '../config/env.config';

async function seed() {
  console.log('Starting database seeding...');

  const dataSource = new DataSource({
    type: env.database.type as any,
    host: env.database.host,
    port: env.database.port,
    username: env.database.username,
    password: env.database.password,
    database: env.database.database,
    entities: [Author, Book],
    synchronize: env.database.synchronize,
  });

  await dataSource.initialize();

  // Clear existing data
  await dataSource.getRepository(Book).createQueryBuilder().delete().execute();
  await dataSource.getRepository(Author).createQueryBuilder().delete().execute();

  console.log('Creating authors...');
  const authorsData = [
    { firstName: 'George R.R.', lastName: 'Martin' },
    { firstName: 'Jane', lastName: 'Austen' },
    { firstName: 'Stephen', lastName: 'King' },
    { firstName: 'Agatha', lastName: 'Christie' }
  ];

  const authors: Author[] = [];

  for (const authorData of authorsData) {
    const author = new Author();
    author.firstName = authorData.firstName;
    author.lastName = authorData.lastName;
    await dataSource.getRepository(Author).save(author);
    authors.push(author);
  }

  console.log('Creating books...');
  const booksData = [
    { title: 'A Game of Thrones', authorIndex: 0, pageCount: 694, releaseDate: new Date('1996-08-01') },
    { title: 'A Clash of Kings', authorIndex: 0, pageCount: 768, releaseDate: new Date('1998-11-16') },
    { title: 'Pride and Prejudice', authorIndex: 1, pageCount: 432, releaseDate: new Date('1813-01-28') },
    { title: 'The Shining', authorIndex: 2, pageCount: 447, releaseDate: new Date('1977-01-28') },
    { title: 'It', authorIndex: 2, pageCount: 1138, releaseDate: new Date('1986-09-15') },
    { title: 'Murder on the Orient Express', authorIndex: 3, pageCount: 256, releaseDate: new Date('1934-01-01') },
    { title: 'And Then There Were None', authorIndex: 3, pageCount: 272, releaseDate: new Date('1939-11-06') }
  ];

  for (const bookData of booksData) {
    const book = new Book();
    book.title = bookData.title;
    book.author = authors[bookData.authorIndex];
    book.pageCount = bookData.pageCount;
    book.releaseDate = bookData.releaseDate;
    await dataSource.getRepository(Book).save(book);
  }

  console.log('Database seeding completed successfully!');
  await dataSource.destroy();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error while seeding database:', error);
    process.exit(1);
  }); 