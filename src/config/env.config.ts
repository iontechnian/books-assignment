// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config();

export const env = {
  database: {
    type: process.env.DB_TYPE || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'books_user',
    password: process.env.DB_PASSWORD || 'books_password',
    database: process.env.DB_DATABASE || 'books_db',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  }
}; 