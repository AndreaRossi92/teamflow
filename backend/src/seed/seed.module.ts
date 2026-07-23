import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { AdminUserSeeder } from './seeders/admin-user.seeder';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Ticket } from '../tickets/ticket.entity';
import { DemoDataSeeder } from './seeders/demo-data.seeder';
import { ClearDataSeeder } from './seeders/clear-data.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Ticket])],
  providers: [SeedService, AdminUserSeeder, DemoDataSeeder, ClearDataSeeder],
})
export class SeedModule {}
