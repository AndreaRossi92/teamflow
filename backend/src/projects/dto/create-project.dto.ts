import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'TeamFlow v2' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'Main product rewrite', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
