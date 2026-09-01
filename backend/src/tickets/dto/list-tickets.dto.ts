import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { TicketPriority, TicketStatus } from '../ticket.entity';

export class ListTicketsDto {
  @ApiPropertyOptional({
    description: 'Filter by title (case-insensitive, partial match)',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ enum: TicketPriority })
  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @ApiPropertyOptional({
    description: 'Filter by project name (case-insensitive, partial match)',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  projectName?: string;

  @ApiPropertyOptional({
    description:
      'Filter by assignment to the requesting user. true: only tickets assigned to them; ' +
      'false: only tickets NOT assigned to them; omitted: no filtering by assignment. ' +
      'Mainly useful for admin and manager, who otherwise see all tickets in their scope — ' +
      'devs already see only their assigned tickets, so true is redundant and false returns an empty list for them.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value as boolean;
  })
  @IsBoolean()
  assignedToMe?: boolean;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}
