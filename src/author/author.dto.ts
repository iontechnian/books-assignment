import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({ description: 'The first name of the author' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'The last name of the author' })
  @IsString()
  lastName: string;
}

export class UpdateAuthorDto {
  @ApiPropertyOptional({ description: 'The first name of the author' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'The last name of the author' })
  @IsOptional()
  @IsString()
  lastName?: string;
} 