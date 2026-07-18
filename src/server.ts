import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

async function start(): Promise<void> {
  await prisma.$connect();
  console.log('Connected to PostgreSQL.');

  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}.`);
  });
}

start().catch(async (error: unknown) => {
  console.error('Failed to start the server.', error);
  await prisma.$disconnect();
  process.exit(1);
});
