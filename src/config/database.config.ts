import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { env } from './env.config';

export const databaseConfig: TypeOrmModuleOptions = {
  type: env.database.type as any,
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.database,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: env.database.synchronize,
}; 