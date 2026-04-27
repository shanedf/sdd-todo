import type { FastifyInstance } from 'fastify';
import { getAllTodos, createTodo, checkHealth, updateTodo, deleteTodo, deleteCompletedTodos } from '../db.js';
import { createTodoSchema, getTodosSchema, healthSchema, updateTodoSchema, deleteTodoSchema, deleteCompletedTodosSchema } from '../schemas/todo-schemas.js';

interface CreateTodoBody {
  title: string;
}

interface UpdateTodoBody {
  isCompleted: boolean;
}

interface TodoParams {
  id: number;
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

  fastify.patch<{ Params: TodoParams; Body: UpdateTodoBody }>(
    '/api/todos/:id',
    { schema: updateTodoSchema },
    async (request, reply) => {
      const { id } = request.params;
      const { isCompleted } = request.body;
      const todo = updateTodo(id, isCompleted);
      if (!todo) {
        return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Todo not found' });
      }
      return reply.status(200).send(todo);
    },
  );

  fastify.delete('/api/todos/completed', { schema: deleteCompletedTodosSchema }, async (_request, reply) => {
    const deleted = deleteCompletedTodos();
    return reply.status(200).send({ deleted });
  });

  fastify.delete<{ Params: TodoParams }>(
    '/api/todos/:id',
    { schema: deleteTodoSchema },
    async (request, reply) => {
      const { id } = request.params;
      const deleted = deleteTodo(id);
      if (!deleted) {
        return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Todo not found' });
      }
      return reply.status(204).send();
    },
  );
}
