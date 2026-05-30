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
        entities: [User, RefreshToken, Project],
        synchronize: true,
      }),
    }),
    AiModule,
    UsersModule,
    AuthModule,
    SeedModule,
    ProjectsModule,
  ],
})
export class AppModule {}
