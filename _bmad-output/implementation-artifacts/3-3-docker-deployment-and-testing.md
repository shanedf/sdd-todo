# Story 3.3: Docker Deployment & Testing

Status: done

## Story

As a **developer**,
I want to run `docker-compose up` and have the complete app working, with ≥70% test coverage and ≥5 E2E tests,
So that the project meets all SDD quality gates.

## Acceptance Criteria (BDD)

1. **Given** a fresh clone of the repository, **When** I run `docker-compose up`, **Then** the app is accessible at `http://localhost:3000` with both frontend UI and API endpoints working, with zero manual setup.

2. **Given** the Dockerfile, **When** it builds, **Then** it uses multi-stage build: Stage 1 builds frontend (Vite), Stage 2 builds backend (tsc), Stage 3 is slim `node:20-alpine` runtime with both artifacts.

3. **Given** `docker-compose.yml` defines a volume, **When** I `docker-compose down` and `docker-compose up` again, **Then** all previously created todos are still present (persistent SQLite volume).

4. **Given** `docker-compose.yml` defines a healthcheck, **When** the container is running, **Then** `wget --spider -q http://localhost:3000/api/health` succeeds and Docker reports the container as healthy.

5. **Given** Vitest is configured for both frontend and backend, **When** I run the test suites, **Then** combined code coverage is ≥ 70%.

6. **Given** Playwright is configured, **When** I run the E2E test suite against the Docker Compose stack, **Then** at least 5 tests pass covering: add todo, toggle todo, delete todo, filter todos, clear completed.

7. **Given** the test infrastructure, **When** tests are executed, **Then** they run as a repeatable, CI-ready process (no manual intervention).

## Requirements Covered

- **FRs:** FR27 (zero-setup deployment), FR28 (persistent Docker volume)
- **ARs:** AR6 (multi-stage Dockerfile), AR7 (Docker Compose healthcheck), AR10 (Vitest coverage), AR11 (Playwright E2E)

## Tasks / Subtasks

- [ ] **Task 1: Create Dockerfile** (AC: #1, #2)
  - [ ] 1.1: Stage 1 `frontend-build` — `node:20-alpine`, install frontend deps, `npm run build` (Vite output in `frontend/dist/`)
  - [ ] 1.2: Stage 2 `backend-build` — `node:20-alpine`, install backend deps, `npm run build` (tsc output in `backend/dist/`)
  - [ ] 1.3: Stage 3 `runtime` — `node:20-alpine`, copy `backend/dist/`, `backend/node_modules/`, `frontend/dist/`, create `/app/data/` dir, expose port 3000, run `node backend/dist/server.js`

- [ ] **Task 2: Create docker-compose.yml** (AC: #1, #3, #4)
  - [ ] 2.1: Service `app` — builds from Dockerfile, maps port 3000:3000, volume `todo-data:/app/data`, env `DATABASE_PATH=/app/data/todos.db`, `API_PORT=3000`
  - [ ] 2.2: Healthcheck — `wget --spider -q http://localhost:3000/api/health`, interval 10s, timeout 5s, retries 3, start_period 10s
  - [ ] 2.3: Named volume `todo-data`

- [ ] **Task 3: Create .dockerignore** (AC: #2)
  - [ ] 3.1: Ignore node_modules, dist, data, .git, _bmad, _bmad-output, docs, e2e, .vscode, .agents, *.md (except Dockerfile)

- [ ] **Task 4: Write Playwright E2E tests** (AC: #6, #7)
  - [ ] 4.1: Install Playwright + @playwright/test as devDependencies in e2e/
  - [ ] 4.2: Test 1 — "add a todo": navigate to /, type + Enter, verify todo appears in list
  - [ ] 4.3: Test 2 — "toggle a todo": add a todo, click checkbox, verify completed state (strikethrough class)
  - [ ] 4.4: Test 3 — "delete a todo": add a todo, click × button, verify todo removed
  - [ ] 4.5: Test 4 — "filter todos": add 2 todos, complete one, click Active/Completed filters, verify correct display
  - [ ] 4.6: Test 5 — "clear completed": add 2 todos, complete one, click "Clear completed", verify only active remains

- [ ] **Task 5: Configure coverage reporting** (AC: #5)
  - [ ] 5.1: Add `@vitest/coverage-v8` to both frontend and backend devDependencies
  - [ ] 5.2: Configure vitest in frontend/vite.config.ts and backend vitest config to output coverage in a mergeable format
  - [ ] 5.3: Add root-level script to run both coverage reports

## Dev Notes

### Architecture Compliance (MUST FOLLOW)

- **Base image:** `node:20-alpine` (AR)
- **Container count:** 1 — Fastify serves both API and static frontend via `@fastify/static`
- **Env vars:** `DATABASE_PATH`, `API_PORT` — set in docker-compose.yml
- **Health endpoint:** `GET /api/health` runs `SELECT 1`, returns 503 on failure
- **No .env files** — Docker Compose environment block only

### Existing Code State

- **Server:** `backend/src/server.ts` listens on `0.0.0.0:${API_PORT ?? 3000}`, entry point: `node backend/dist/server.js`
- **Database:** `backend/src/db.ts` — `initDatabase()` uses `process.env['DATABASE_PATH'] ?? './data/todos.db'`, creates dir if needed, WAL mode enabled
- **Frontend build:** `frontend/` — Vite, output to `frontend/dist/`
- **Static serving:** `@fastify/static` serves from `path.join(__dirname, '..', '..', 'frontend', 'dist')` — in Docker this resolves to `/app/frontend/dist/`
- **E2E scaffold:** `e2e/` already has `package.json`, `playwright.config.ts` (baseURL: `http://localhost:3000`), empty `tests/` dir
- **Backend entry:** `"main": "dist/server.js"` in package.json, `"type": "module"`
- **Backend tsconfig:** outDir: `dist`, rootDir: `src`
- **85 unit/integration tests already passing** (49 frontend + 36 backend)

### Key Paths in Docker Container

```
/app/
├── backend/
│   ├── dist/          # tsc output (copied from Stage 2)
│   └── node_modules/  # production deps only
├── frontend/
│   └── dist/          # Vite output (copied from Stage 1)
└── data/
    └── todos.db       # SQLite, Docker volume mounted
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.3]
- [Source: _bmad-output/planning-artifacts/architecture.md — Infrastructure & Deployment, Testing Infrastructure]

### Review Findings

- [x] [Review][Patch] Missing `NODE_ENV=production` in Dockerfile runtime stage [Dockerfile:18] — FIXED
- [x] [Review][Patch] No non-root user in Dockerfile — container runs as root (security) [Dockerfile:18-34] — FIXED
- [x] [Review][Defer] E2E cleanup `beforeEach` lacks error handling on API responses [e2e/tests/todo.spec.ts:4-9] — deferred, pre-existing pattern

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes

### File List

### Debug Log References
