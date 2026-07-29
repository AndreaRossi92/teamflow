import { ApiProperty } from '@nestjs/swagger';

export class TicketCountsByStatusDto {
  @ApiProperty({ example: 5, description: 'Open tickets' })
  open!: number;

  @ApiProperty({ example: 3, description: 'In-progress tickets' })
  inProgress!: number;

  @ApiProperty({ example: 2, description: 'Resolved tickets' })
  resolved!: number;

  @ApiProperty({ example: 8, description: 'Closed tickets' })
  closed!: number;
}

export class ProjectTicketStatusDto {
  @ApiProperty({ example: 'project-uuid' })
  projectId!: string;

  @ApiProperty({ example: 'TeamFlow v2' })
  projectName!: string;

  @ApiProperty({ type: TicketCountsByStatusDto })
  tickets!: TicketCountsByStatusDto;
}
