import { ApiProperty } from '@nestjs/swagger';
import { Role, User } from '../user.entity';
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

export function emptyTicketPriorityCounts(): Record<TicketPriority, number> {
  return {
    [TicketPriority.LOW]: 0,
    [TicketPriority.MEDIUM]: 0,
    [TicketPriority.HIGH]: 0,
  };
}

export class RoleBreakdownDto {
  @ApiProperty({ enum: Role })
  role!: Role;

  @ApiProperty({ example: 12, description: 'Active users with this role' })
  active!: number;

  @ApiProperty({ example: 3, description: 'Inactive users with this role' })
  inactive!: number;
}

export function emptyRoleBreakdown(): Record<
  Role,
  { active: number; inactive: number }
> {
  return Object.values(Role).reduce(
    (acc, role) => {
      acc[role] = { active: 0, inactive: 0 };
      return acc;
    },
    {} as Record<Role, { active: number; inactive: number }>,
  );
}
