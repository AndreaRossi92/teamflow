import * as readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { ClearDataSeeder } from '../seeders/clear-data.seeder';

async function askConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const answer = await rl.question(
      'All DB tables will be dropped. Continue? (y/N): ',
    );
    return ['y', 'yes'].includes(answer.trim().toLowerCase());
  } finally {
    rl.close();
  }
}

async function bootstrap(): Promise<void> {
  const logger = new Logger('ClearDbScript');

  const confirmed = await askConfirmation();

  if (!confirmed) {
    logger.log('Canceled');
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const cleaner = app.get(ClearDataSeeder);
    await cleaner.clearAll();
  } catch (err) {
    logger.error('DB clearing failed', err instanceof Error ? err.stack : err);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

bootstrap().catch(console.error);
