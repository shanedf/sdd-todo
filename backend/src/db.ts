import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

export interface TodoRow {
  id: number;
  title: string;
  is_completed: number;
  created_at: string;
}

export interface Todo {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt: string;
}

function mapTodoRow(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    isCompleted: row.is_completed === 1,
    createdAt: row.created_at,
  };
}

let db: Database.Database;

export function initDatabase(dbPath?: string): Database.Database {
  const resolvedPath = dbPath ?? process.env['DATABASE_PATH'] ?? './data/todos.db';

  // Ensure directory exists for file-based databases
  if (resolvedPath !== ':memory:') {
    const dir = path.dirname(resolvedPath);
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function getAllTodos(): Todo[] {
  const rows = getDatabase().prepare('SELECT * FROM todos ORDER BY id ASC').all() as TodoRow[];
  return rows.map(mapTodoRow);
}

export function getTodoById(id: number): Todo | undefined {
  const row = getDatabase().prepare('SELECT * FROM todos WHERE id = ?').get(id) as TodoRow | undefined;
  return row ? mapTodoRow(row) : undefined;
}

export function createTodo(title: string): Todo {
  const stmt = getDatabase().prepare('INSERT INTO todos (title) VALUES (?)');
  const result = stmt.run(title);
  const todo = getTodoById(Number(result.lastInsertRowid));
  if (!todo) {
    throw new Error('Failed to retrieve created todo');
  }
  return todo;
}

export function checkHealth(): boolean {
  try {
    getDatabase().prepare('SELECT 1').get();
    return true;
  } catch {
    return false;
  }
}
