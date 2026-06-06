import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignTicketUsersDto {
  @ApiProperty({ example: ['uuid-1', 'uuid-2'], type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds!: string[];
}
