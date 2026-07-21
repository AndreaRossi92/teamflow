import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from './ai/ai.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { RefreshToken } from './auth/refresh-token.entity';
import { ProjectsModule } from './projects/project.module';
import { Project } from './projects/project.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { Ticket } from './tickets/ticket.entity';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'teamflow'),
        password: config.get<string>('DB_PASSWORD', 'teamflow'),
        database: config.get<string>('DB_NAME', 'teamflow'),
        entities: [User, RefreshToken, Project, Ticket],
        synchronize: true,
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 10_000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 60_000,
        limit: 5,
      },
      {
        name: 'long',
        ttl: 3_600_000,
        limit: 15,
      },
    ]),
    AiModule,
    UsersModule,
    AuthModule,
    SeedModule,
    ProjectsModule,
    TicketsModule,
  ],
})
export class AppModule {}
