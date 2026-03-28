import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AdminUserSeeder } from './seeders/admin-user.seeder';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private readonly adminUserSeeder: AdminUserSeeder) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.adminUserSeeder.run();
  }
}
