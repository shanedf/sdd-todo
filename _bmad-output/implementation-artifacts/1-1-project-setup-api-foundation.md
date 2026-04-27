# Story 1.1: Project Setup & API Foundation

Status: done

## Story

As an **API consumer**,
I want a working REST API for creating and retrieving todos,
so that I can manage todos programmatically.

## Acceptance Criteria (BDD)

1. **Given** a fresh project checkout, **When** I run the dev startup commands, **Then** the Vite React frontend serves on its dev port and the Fastify backend serves on port 3000.

2. **Given** the backend is running, **When** the server starts, **Then** SQLite database is initialized with `CREATE TABLE IF NOT EXISTS todos` (columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `title TEXT NOT NULL`, `is_completed INTEGER DEFAULT 0`, `created_at TEXT DEFAULT CURRENT_TIMESTAMP`) and WAL pragma is set.

3. **Given** the database is initialized, **When** I send `POST /api/todos` with `{ "title": "Buy groceries" }`, **Then** I receive 201 with the created todo as `{ id, title, isCompleted: false, createdAt }` (camelCase JSON).

4. **Given** a todo exists, **When** I send `GET /api/todos`, **Then** I receive 200 with an array of all todos in camelCase format.

5. **Given** I send `POST /api/todos` with empty title or missing title, **When** the server validates via Fastify JSON Schema, **Then** I receive 400 with `{ statusCode: 400, error: "Bad Request", message: "..." }`.

6. **Given** I send `POST /api/todos` with title exceeding 500 characters, **When** the server validates, **Then** I receive 400 with a descriptive error.

7. **Given** any request to the API, **When** the response is sent, **Then** `@fastify/helmet` CSP and security headers are present.

8. **Given** the backend is running, **When** I send `GET /api/health`, **Then** I receive 200 confirming the database is operational (`SELECT 1`).

## Requirements Covered

- **FRs:** FR8, FR20, FR21, FR24, FR25, FR26
- **ARs:** AR1, AR2, AR3, AR4, AR8, AR9
- **NFRs addressed:** NFR2 (<200ms API), NFR7 (input sanitization), NFR8 (SQL injection protection), NFR9 (CSP headers), NFR10 (malformed input rejection)

## Tasks / Subtasks

- [x] **Task 1: Initialize project structure** (AC: #1)
  - [x] 1.1: Run `npm create vite@latest frontend -- --template react-ts` in project root
  - [x] 1.2: Create `backend/` directory with manual Fastify setup
  - [x] 1.3: `cd backend && npm init -y`
  - [x] 1.4: Install runtime deps: `npm install fastify better-sqlite3 @fastify/static @fastify/helmet`
  - [x] 1.5: Install dev deps: `npm install -D typescript @types/node @types/better-sqlite3 tsx vitest`
  - [x] 1.6: Create `backend/tsconfig.json` with strict mode, target ES2022, module NodeNext
  - [x] 1.7: Create `frontend/` Vite dev config (already from template)
  - [x] 1.8: Add dev scripts to `backend/package.json`: `"dev": "tsx watch src/server.ts"`, `"build": "tsc"`
  - [x] 1.9: Create `e2e/` directory skeleton with `package.json` and `playwright.config.ts` placeholder

- [x] **Task 2: Database initialization** (AC: #2)
  - [x] 2.1: Create `backend/src/db.ts`
  - [x] 2.2: Initialize `better-sqlite3` with `DATABASE_PATH` env var (default: `./data/todos.db`)
  - [x] 2.3: Run `db.pragma('journal_mode = WAL')` at init
  - [x] 2.4: Run `CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, is_completed INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP)`
  - [x] 2.5: Export query functions: `getAllTodos()`, `createTodo(title)`, `getTodoById(id)`
  - [x] 2.6: Implement `snake_case` → `camelCase` field mapping in query result mapper

- [x] **Task 3: Fastify server setup** (AC: #1, #7)
  - [x] 3.1: Create `backend/src/server.ts`
  - [x] 3.2: Initialize Fastify with logger enabled (Pino)
  - [x] 3.3: Register `@fastify/helmet` plugin (provides CSP headers)
  - [x] 3.4: Register `@fastify/static` plugin pointing to `../frontend/dist` (conditionally if dir exists)
  - [x] 3.5: Import and register todo routes
  - [x] 3.6: Add global `setErrorHandler` for consistent `{ statusCode, error, message }` format
  - [x] 3.7: Start server on `API_PORT` env var (default: 3000), bind to `0.0.0.0`

- [x] **Task 4: JSON Schema definitions** (AC: #3, #5, #6)
  - [x] 4.1: Create `backend/src/schemas/todo-schemas.ts`
  - [x] 4.2: Define `createTodoSchema` — body: `{ title: { type: "string", minLength: 1, maxLength: 500 } }`, required: `["title"]`
  - [x] 4.3: Define response schemas for Todo object and Todo array

- [x] **Task 5: API route handlers** (AC: #3, #4, #5, #6, #8)
  - [x] 5.1: Create `backend/src/routes/todo-routes.ts`
  - [x] 5.2: `POST /api/todos` — validate with JSON Schema, call `createTodo()`, return 201
  - [x] 5.3: `GET /api/todos` — call `getAllTodos()`, return 200 with array
  - [x] 5.4: `GET /api/health` — run `SELECT 1`, return 200 or 503

- [x] **Task 6: Frontend API layer stub** (AC: #1)
  - [x] 6.1: Create `frontend/src/api/todo-api.ts` with fetch wrappers for `getTodos()` and `createTodo(title)`
  - [x] 6.2: Create `frontend/src/types/todo.ts` with `Todo` interface: `{ id: number; title: string; isCompleted: boolean; createdAt: string }`
  - [x] 6.3: Base URL: relative `/api` path (same-origin, no CORS needed)

- [x] **Task 7: Backend tests** (AC: all)
  - [x] 7.1: Create `backend/tests/db.test.ts` — test schema creation, WAL pragma, createTodo, getAllTodos
  - [x] 7.2: Create `backend/tests/todo-routes.test.ts` — test POST/GET endpoints, validation errors, health check
  - [x] 7.3: Configure Vitest in `backend/vitest.config.ts`

## Dev Notes

### Architecture Compliance (MUST FOLLOW)

- **Language:** TypeScript strict mode on both frontend and backend
- **Backend framework:** Fastify v5.x — NOT Express, NOT Koa
- **Database driver:** `better-sqlite3` v12.x — synchronous API, NOT `sql.js`, NOT `knex`, NOT any ORM
- **Static serving:** `@fastify/static` — NOT express.static, NOT nginx
- **Security:** `@fastify/helmet` — NOT custom CSP headers
- **Naming conventions:**
  - DB columns: `snake_case` (`is_completed`, `created_at`)
  - JSON API responses: `camelCase` (`isCompleted`, `createdAt`)
  - TS files (backend): `kebab-case` (`todo-routes.ts`, `db.ts`)
  - React components: `PascalCase` (`TodoList.tsx`)
  - CSS classes: `kebab-case` (`.todo-item`)
- **DB→API mapping:** Done in route handler query result mapper. ONE location. Not middleware.
- **Validation:** Fastify built-in JSON Schema on route definitions. NO manual `if` checks.
- **Error response format:** Fastify default `{ statusCode, error, message }` — do NOT create custom error wrapper.
- **Logging:** Fastify's built-in Pino logger — `request.log` or `fastify.log`. NO `console.log`.

### Anti-Patterns (FORBIDDEN)

- `any` type in TypeScript (use `unknown` if needed)
- `dangerouslySetInnerHTML`
- Direct SQLite queries outside `backend/src/db.ts`
- CSS-in-JS, styled-components, or inline styles
- `console.log` for logging
- ORM or query builder (direct `better-sqlite3` only)
- Manual input validation `if` checks (use JSON Schema)

### Project Structure (Story 1.1 creates these files)

```
sdd-todo/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── todo-api.ts          # Fetch wrappers
│   │   ├── types/
│   │   │   └── todo.ts              # Todo interface
│   │   ├── App.tsx                  # (Vite template default, modified later)
│   │   └── main.tsx                 # (Vite template default)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── server.ts                # Fastify init, plugin registration, start
│   │   ├── db.ts                    # SQLite init, schema, queries
│   │   ├── routes/
│   │   │   └── todo-routes.ts       # POST/GET /api/todos, GET /api/health
│   │   └── schemas/
│   │       └── todo-schemas.ts      # JSON Schema definitions
│   ├── tests/
│   │   ├── db.test.ts
│   │   └── todo-routes.test.ts
│   ├── package.json
│   └── tsconfig.json
├── e2e/
│   ├── package.json                 # (placeholder)
│   └── playwright.config.ts         # (placeholder)
├── .gitignore
└── README.md
```

### API Contract (this story implements POST, GET, health)

| Method | Endpoint | Request Body | Success Response | Error Responses |
|---|---|---|---|---|
| `POST` | `/api/todos` | `{ "title": "string" }` | 201: `{ id, title, isCompleted, createdAt }` | 400: validation error |
| `GET` | `/api/todos` | — | 200: `Todo[]` | — |
| `GET` | `/api/health` | — | 200: `{ status: "ok" }` | 503: DB unavailable |

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

- WAL pragma: `db.pragma('journal_mode = WAL')` — prevents corruption on container kill
- Dates stored as ISO 8601 TEXT in SQLite
- `is_completed` is INTEGER (0/1) — mapped to boolean `isCompleted` in API response

### Field Mapping Pattern

```typescript
function mapTodoRow(row: { id: number; title: string; is_completed: number; created_at: string }): Todo {
  return {
    id: row.id,
    title: row.title,
    isCompleted: row.is_completed === 1,
    createdAt: row.created_at,
  };
}
```

### Testing Approach

- **Framework:** Vitest
- **Backend DB tests:** Use in-memory SQLite (`:memory:`) for fast, isolated tests
- **Backend route tests:** Use `fastify.inject()` for integration testing (no real HTTP)
- **Coverage:** Configure for future ≥70% combined target
- **Test file locations:** `backend/tests/` (co-located by convention from architecture)

### References

- [Source: architecture.md — Starter Template Evaluation]
- [Source: architecture.md — Core Architectural Decisions / Data Architecture]
- [Source: architecture.md — Core Architectural Decisions / API & Communication Patterns]
- [Source: architecture.md — Implementation Patterns & Consistency Rules]
- [Source: architecture.md — Project Structure & Boundaries]
- [Source: prd.md — Functional Requirements / API (FR20-FR26)]
- [Source: epics.md — Story 1.1: Project Setup & API Foundation]

## Dev Agent Record

### Agent Model Used

(to be filled by dev agent)

### Completion Notes List

(to be filled after implementation)

### Change Log

| Change | Date | Reason |
|---|---|---|
| Story created | 2026-04-27 | Initial creation from epics.md Story 1.1 |
