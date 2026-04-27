import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initDatabase } from './db.js';
import { todoRoutes } from './routes/todo-routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  // Initialize database
  initDatabase();

  // Register security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  });

  // Serve static frontend files in production (skip if directory doesn't exist)
  const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
  if (fs.existsSync(frontendDist)) {
    await fastify.register(fastifyStatic, {
      root: frontendDist,
      prefix: '/',
      wildcard: false,
    });
  }

  // Register API routes
  await fastify.register(todoRoutes);

  // Global error handler for consistent error format
  fastify.setErrorHandler((error: { statusCode?: number; name?: string; message?: string }, _request, reply) => {
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      statusCode,
      error: error.name || 'Internal Server Error',
      message: error.message || 'Unknown error',
    });
  });

  return fastify;
}

// Start server if run directly
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule) {
  start();
}

async function start() {
  const server = await buildServer();
  const port = Number(process.env['API_PORT'] ?? 3000);

  try {
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
