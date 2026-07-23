import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ClearDataSeeder {
  private readonly logger = new Logger(ClearDataSeeder.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
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

  async clearAll(): Promise<void> {
    if (!this.assertNotProduction()) {
      return;
    }

    this.logger.warn('DB clearing...');

    await this.dataSource.query(
      `TRUNCATE TABLE "ticket_assignees", "project_members", "tickets", "projects", "users" RESTART IDENTITY CASCADE`,
    );

    this.logger.log('DB cleared. Restart to recreate admin');
  }
}
