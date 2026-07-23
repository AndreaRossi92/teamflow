import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { DemoDataSeeder } from '../seeders/demo-data.seeder';

interface CliOptions {
  users?: number;
  projects?: number;
  tickets?: number;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--users':
        options.users = Number(argv[++i]);
        break;
      case '--projects':
        options.projects = Number(argv[++i]);
        break;
      case '--tickets':
        options.tickets = Number(argv[++i]);
        break;
      default:
        // ignore not valid args
        break;
    }
  }

  return options;
}

async function bootstrap(): Promise<void> {
  const logger = new Logger('SeedDemoScript');
  const options = parseArgs(process.argv.slice(2));

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const seeder = app.get(DemoDataSeeder);
    await seeder.runFromCli(options);
  } catch (err) {
    logger.error('Demo seed failed', err instanceof Error ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap();
