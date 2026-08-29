import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.entity';
import { TicketPriority, TicketStatus } from '../../tickets/ticket.entity';

export class TicketPriorityCountsDto {
  @ApiProperty({ example: 1, description: 'Tickets with priority "high"' })
  high!: number;

  @ApiProperty({ example: 2, description: 'Tickets with priority "medium"' })
  medium!: number;

  @ApiProperty({ example: 5, description: 'Tickets with priority "low"' })
  low!: number;
}

export class TicketBreakdownDto {
  @ApiProperty({ type: () => TicketPriorityCountsDto })
  open!: TicketPriorityCountsDto;

  @ApiProperty({ type: () => TicketPriorityCountsDto })
  inProgress!: TicketPriorityCountsDto;

  @ApiProperty({ type: () => TicketPriorityCountsDto })
  resolved!: TicketPriorityCountsDto;

  @ApiProperty({ type: () => TicketPriorityCountsDto })
  closed!: TicketPriorityCountsDto;
}

export class UserDashboardDto extends User {
  @ApiProperty({
    type: () => TicketBreakdownDto,
    description: 'Tickets per status, each broken down by priority',
  })
  ticketBreakdown!: TicketBreakdownDto;
}

/** All statuses × priorities defaulted to 0 — used so every user reports a complete shape even with zero tickets. */
export function emptyTicketBreakdown(): Record<
  TicketStatus,
  Record<TicketPriority, number>
> {
  return {
    [TicketStatus.OPEN]: emptyTicketPriorityCounts(),
    [TicketStatus.IN_PROGRESS]: emptyTicketPriorityCounts(),
    [TicketStatus.RESOLVED]: emptyTicketPriorityCounts(),
    [TicketStatus.CLOSED]: emptyTicketPriorityCounts(),
  };
}

/** All priorities defaulted to 0 — used so every user reports a complete shape even with zero tickets. */
export function emptyTicketPriorityCounts(): Record<TicketPriority, number> {
  return {
    [TicketPriority.LOW]: 0,
    [TicketPriority.MEDIUM]: 0,
    [TicketPriority.HIGH]: 0,
  };
}
