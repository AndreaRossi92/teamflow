import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role, User } from '../../users/user.entity';

@Injectable()
export class AdminUserSeeder {
  private readonly logger = new Logger(AdminUserSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async run(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL', 'admin@teamflow.com');
    const password = this.config.get<string>('ADMIN_PASSWORD', 'admin123');
    const fullName = this.config.get<string>('ADMIN_FULL_NAME', 'Admin');

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      this.logger.log('Admin user already exists, skipping seed');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = this.userRepository.create({
      email,
      passwordHash,
      role: Role.ADMIN,
      fullName,
      isActive: true,
    });

    await this.userRepository.save(admin);
    this.logger.log(`Admin user created: ${email}`);
  }
}
