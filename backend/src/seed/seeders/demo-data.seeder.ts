import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { Role, User } from '../../users/user.entity';
import { Project } from '../../projects/project.entity';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../../tickets/ticket.entity';

@Injectable()
export class DemoDataSeeder {
  private readonly logger = new Logger(DemoDataSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly config: ConfigService,
  ) {}

  private assertNotProduction(): boolean {
    const nodeEnv = this.config.get<string>('NODE_ENV', 'development');
    if (nodeEnv === 'production') {
      this.logger.warn('Seed blocked in production');
      return false;
    }
    return true;
  }

  async runFromCli(options: {
    users?: number;
    projects?: number;
    tickets?: number;
  }): Promise<void> {
    await this.seed(options);
  }

  private async seed(options: {
    users?: number;
    projects?: number;
    tickets?: number;
  }): Promise<void> {
    if (!this.assertNotProduction()) {
      return;
    }

    const userCount = options.users ?? 25;
    const projectCount = options.projects ?? 5;
    const ticketCount = options.tickets ?? 150;

    const existingDemo = await this.projectRepository.findOne({
      where: { name: 'Demo Project 1' },
    });

    if (existingDemo) {
      this.logger.log('Demo data already existing, skip seeding');
      return;
    }

    if (existingDemo) {
      this.logger.log('Deleting demo data...');
      await this.ticketRepository.delete({});
      await this.projectRepository.delete({});
      await this.userRepository.delete({});
    }

    this.logger.log('Seeding demo data...');

    const users = await this.seedUsers(userCount);
    const projects = await this.seedProjects(users, projectCount);
    await this.seedTickets(users, projects, ticketCount);

    this.logger.log(
      `Seed completed: ${users.length} users, ${projects.length} projects, ${ticketCount} tickets`,
    );
  }

  private async seedUsers(count: number): Promise<User[]> {
    const passwordHash = await bcrypt.hash('demo1234', 12);
    const roles = [Role.ADMIN, Role.MANAGER, Role.DEV];

    const usedEmails = new Set<string>();

    const usersData = Array.from({ length: count }).map((_, i) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;

      let email: string;
      do {
        // Random suffix to lessen duplicate email probability
        const suffix = faker.string.alphanumeric(5).toLowerCase();
        email = `${firstName}.${lastName}.${suffix}@demo.local`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9.@]/g, '');
      } while (usedEmails.has(email));
      usedEmails.add(email);

      return this.userRepository.create({
        email,
        fullName,
        passwordHash,
        // 3 admins, then managers and devs
        role: i < 3 ? Role.ADMIN : faker.helpers.arrayElement(roles.slice(1)),
        isActive: faker.datatype.boolean(0.9),
      });
    });

    return this.userRepository.save(usersData);
  }

  private async seedProjects(users: User[], count: number): Promise<Project[]> {
    const projectsData = Array.from({ length: count }).map((_, i) => {
      const createdBy = faker.helpers.arrayElement(users);
      const members = faker.helpers.arrayElements(
        users,
        faker.number.int({ min: 3, max: 8 }),
      );

      return this.projectRepository.create({
        name: `Demo Project ${i + 1}`,
        description: faker.company.catchPhrase(),
        isActive: faker.datatype.boolean(0.85),
        createdBy,
        members,
      });
    });

    return this.projectRepository.save(projectsData);
  }

  private async seedTickets(
    users: User[],
    projects: Project[],
    count: number,
  ): Promise<void> {
    const statuses = Object.values(TicketStatus);
    const priorities = Object.values(TicketPriority);

    const ticketsData = Array.from({ length: count }).map(() => {
      const project = faker.helpers.arrayElement(projects);

      const assignees = faker.helpers.arrayElements(
        project.members,
        faker.number.int({ min: 0, max: Math.min(3, project.members.length) }),
      );

      return this.ticketRepository.create({
        title: faker.hacker.phrase(),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(statuses),
        priority: faker.helpers.arrayElement(priorities),
        project,
        createdBy: faker.helpers.arrayElement(users),
        assignees,
      });
    });

    // batch save
    await this.ticketRepository.save(ticketsData, { chunk: 25 });
  }
}
