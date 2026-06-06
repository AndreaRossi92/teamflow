import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'inProgress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('tickets')
export class Ticket {
  @ApiProperty({ example: 'uuid...' })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ example: 'Fix login bug' })
  @Column()
  title!: string;

  @ApiProperty({ example: 'Users cannot log in with SSO', nullable: true })
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.OPEN })
  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status!: TicketStatus;

  @ApiProperty({ enum: TicketPriority, example: TicketPriority.MEDIUM })
  @Column({ type: 'enum', enum: TicketPriority })
  priority!: TicketPriority;

  @ApiProperty({ example: 'uuid...' })
  @Column()
  projectId!: string;

  @ManyToOne(() => Project, { nullable: false, eager: false })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @ApiProperty({ example: 'uuid...' })
  @Column()
  createdById!: string;

  @ManyToOne(() => User, { nullable: false, eager: false })
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @ApiProperty({ type: () => [User] })
  @ManyToMany(() => User, { eager: false })
  @JoinTable({
    name: 'ticket_assignees',
    joinColumn: { name: 'ticketId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  assignees!: User[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt!: Date;
}
