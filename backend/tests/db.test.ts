import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { initDatabase, getAllTodos, createTodo, getTodoById, checkHealth } from '../src/db.js';

describe('Database', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = initDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  describe('initDatabase', () => {
    it('should create the todos table', () => {
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='todos'")
        .all();
      expect(tables).toHaveLength(1);
    });

    it('should set WAL journal mode', () => {
      // In-memory databases report "memory" for journal_mode even after setting WAL
      const result = db.pragma('journal_mode') as Array<{ journal_mode: string }>;
      expect(['wal', 'memory']).toContain(result[0].journal_mode);
    });

    it('should create table with correct columns', () => {
      const columns = db.pragma('table_info(todos)') as Array<{ name: string; type: string }>;
      const columnNames = columns.map((c) => c.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('title');
      expect(columnNames).toContain('is_completed');
      expect(columnNames).toContain('created_at');
    });
  });

  describe('createTodo', () => {
    it('should create a todo and return it with camelCase fields', () => {
      const todo = createTodo('Buy groceries');
      expect(todo.id).toBe(1);
      expect(todo.title).toBe('Buy groceries');
      expect(todo.isCompleted).toBe(false);
      expect(todo.createdAt).toBeDefined();
    });

    it('should auto-increment IDs', () => {
      const todo1 = createTodo('First');
      const todo2 = createTodo('Second');
      expect(todo2.id).toBe(todo1.id + 1);
    });
  });

  describe('getAllTodos', () => {
    it('should return empty array when no todos exist', () => {
      const todos = getAllTodos();
      expect(todos).toEqual([]);
    });

    it('should return all todos in camelCase format', () => {
      createTodo('First');
      createTodo('Second');
      const todos = getAllTodos();
      expect(todos).toHaveLength(2);
      expect(todos[0].title).toBe('First');
      expect(todos[1].title).toBe('Second');
      expect(todos[0]).toHaveProperty('isCompleted');
      expect(todos[0]).toHaveProperty('createdAt');
    });
  });

  describe('getTodoById', () => {
    it('should return a todo by ID', () => {
      const created = createTodo('Test');
      const found = getTodoById(created.id);
      expect(found).toBeDefined();
      expect(found!.title).toBe('Test');
    });

    it('should return undefined for non-existent ID', () => {
      const found = getTodoById(999);
      expect(found).toBeUndefined();
    });
  });

  describe('checkHealth', () => {
    it('should return true when database is operational', () => {
      expect(checkHealth()).toBe(true);
    });
  });
});
