import type { FastifyInstance } from 'fastify';
import { getAllTodos, createTodo, checkHealth } from '../db.js';
import { createTodoSchema, getTodosSchema, healthSchema } from '../schemas/todo-schemas.js';

interface CreateTodoBody {
  title: string;
}

export async function todoRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/todos', { schema: getTodosSchema }, async (_request, reply) => {
    const todos = getAllTodos();
    return reply.status(200).send(todos);
  });

  fastify.post<{ Body: CreateTodoBody }>(
    '/api/todos',
    { schema: createTodoSchema },
    async (request, reply) => {
      const { title } = request.body;
      const todo = createTodo(title);
      return reply.status(201).send(todo);
    },
  );

  fastify.get('/api/health', { schema: healthSchema }, async (_request, reply) => {
    const healthy = checkHealth();
    if (healthy) {
      return reply.status(200).send({ status: 'ok' });
    }
    return reply.code(503).send({ statusCode: 503, error: 'Service Unavailable', message: 'Database is not operational' });
  });
}
