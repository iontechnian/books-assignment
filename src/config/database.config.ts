import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'books_user',
  password: 'books_password',
  database: 'books_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true, // Set to false in production
}; 