import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildServer } from '../src/server.js';
import type { FastifyInstance } from 'fastify';

// Override DATABASE_PATH to use in-memory for tests
process.env['DATABASE_PATH'] = ':memory:';

describe('Todo Routes', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    // Reset the database module by using a fresh server for each test
    process.env['DATABASE_PATH'] = ':memory:';
    app = await buildServer();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/health', () => {
    it('should return 200 with status ok', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/health',
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: 'ok' });
    });
  });

  describe('POST /api/todos', () => {
    it('should create a todo and return 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { title: 'Buy groceries' },
      });
      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.id).toBe(1);
      expect(body.title).toBe('Buy groceries');
      expect(body.isCompleted).toBe(false);
      expect(body.createdAt).toBeDefined();
    });

    it('should return 400 for empty title', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { title: '' },
      });
      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.statusCode).toBe(400);
      expect(body.message).toBeDefined();
    });

    it('should return 400 for missing title', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: {},
      });
      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for title exceeding 500 characters', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { title: 'a'.repeat(501) },
      });
      expect(response.statusCode).toBe(400);
    });

    it('should coerce non-string title', async () => {
      // Fastify coerces numbers to strings by default
      const response = await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { title: 123 },
      });
      expect(response.statusCode).toBe(201);
      expect(response.json().title).toBe('123');
    });
  });

  describe('GET /api/todos', () => {
    it('should return empty array when no todos exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/todos',
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });

    it('should return all todos', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { title: 'First' },
      });
      await app.inject({
        method: 'POST',
        url: '/api/todos',
        payload: { title: 'Second' },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/todos',
      });
      expect(response.statusCode).toBe(200);
      const todos = response.json();
      expect(todos).toHaveLength(2);
      expect(todos[0].title).toBe('First');
      expect(todos[1].title).toBe('Second');
    });
  });

  describe('Security headers', () => {
    it('should include CSP headers from @fastify/helmet', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/health',
      });
      expect(response.headers['content-security-policy']).toBeDefined();
    });
  });
});
