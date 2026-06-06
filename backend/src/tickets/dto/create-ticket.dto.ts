import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { TicketPriority } from '../ticket.entity';

export class CreateTicketDto {
  @ApiProperty({ example: 'Fix login bug' })
  @IsString()
  @MinLength(2)
  title!: string;

  @ApiPropertyOptional({ example: 'Users cannot log in with SSO' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TicketPriority, example: TicketPriority.MEDIUM })
  @IsEnum(TicketPriority)
  priority!: TicketPriority;

  @ApiProperty({ example: 'uuid-project' })
  @IsUUID('4')
  projectId!: string;

  @ApiPropertyOptional({ example: ['uuid-1', 'uuid-2'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  assigneeIds?: string[];
}
