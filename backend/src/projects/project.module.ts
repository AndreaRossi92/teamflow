import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { Ticket } from '../tickets/ticket.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

@Module({
  // User and Ticket repositories are injected directly so we don't create a
  // circular dependency with UsersModule/TicketsModule; we only need the raw
  // TypeORM repos here (Ticket is used to build ticket-count aggregates for
  // the projects dashboard endpoint).
  imports: [TypeOrmModule.forFeature([Project, User, Ticket])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
