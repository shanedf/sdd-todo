---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md']
workflowType: 'architecture'
project_name: 'sdd-todo'
user_name: 'Shane'
date: '2026-04-27'
status: 'complete'
completedAt: '2026-04-27'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
28 FRs across 6 capability areas. The core is CRUD operations on a single Todo entity, exposed through both a web UI (FR1-FR19) and a REST API (FR20-FR26), with containerized deployment (FR27-FR28). Key FR complexity comes from optimistic UI updates, error recovery (undo completion, bulk clear), and dual-surface input validation.

**Non-Functional Requirements:**
- Performance: <100ms UI feedback (optimistic), <200ms API response, <1.5s FCP, <2s TTI
- Security: Server-side input sanitization, CSP headers, injection protection
- Accessibility: Zero critical WCAG 2.1 violations, keyboard navigation, semantic HTML
- Reliability: Data persists across container restarts, graceful network error handling
- Testing: ≥70% coverage, ≥5 Playwright E2E tests, CI-ready

**Scale & Complexity:**
- Primary domain: Full-stack web (SPA + REST API + database)
- Complexity level: Low
- Estimated architectural components: 3 (frontend SPA, backend API, database)

### Technical Constraints & Dependencies

- One developer, one day — framework selection must minimize setup and boilerplate
- Docker Compose deployment with persistent volumes is mandatory
- Framework choices must have proven Docker patterns, Playwright integration, and coverage tooling
- API-first design: backend contract defined before frontend implementation
- No authentication, no SSR, no real-time sync, no SEO

### Cross-Cutting Concerns Identified

- **Input validation:** Enforced on both frontend (UX) and backend (security). Must prevent empty submissions, handle long text, reject malformed API input.
- **Error handling:** Optimistic UI requires rollback strategy when API calls fail. Network errors must surface to user without data loss.
- **Containerization:** Application must run in Docker with zero manual setup. Database volume must persist across restarts.
- **Testing:** Coverage and E2E requirements must be scaffolded early — not bolted on after features.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web (SPA + REST API) based on project requirements. A single Fastify application serving both the API and the Vite-built frontend static files, deployed via Docker.

### Technology Stack Selected

- **Language:** TypeScript (both frontend and backend)
- **Frontend:** Vite + React (`react-ts` template)
- **Backend:** Fastify (v5.x) with manual TypeScript setup
- **Database:** SQLite via `better-sqlite3` (v12.x) — synchronous API, fast, zero-config
- **ORM/Query:** Direct `better-sqlite3` usage (no ORM needed for a single-entity model)

### Starter Options Considered

| Option | Description | Verdict |
|---|---|---|
| Vite `react-ts` + manual Fastify | Official Vite template + hand-rolled API | **Selected** — minimal, no unnecessary abstraction |
| Fastify CLI scaffold + Vite | `fastify-cli` generated backend | Rejected — adds CommonJS boilerplate, plugin indirection for 4 endpoints |
| Full-stack monorepo (T3, etc.) | Pre-built full-stack starters | Rejected — Next.js based, doesn't fit Vite + Fastify requirement |

### Selected Starter: Vite react-ts + Manual Fastify

**Rationale:** The API surface is 4 CRUD endpoints on 1 entity. A CLI scaffold or full-stack framework would add more ceremony than the entire application logic. Vite's official `react-ts` template gives us build tooling, HMR, and TypeScript out of the box. Fastify is lightweight enough to configure manually in under 20 lines.

**Initialization Commands:**

```bash
# Frontend
npm create vite@latest frontend -- --template react-ts

# Backend (manual setup)
mkdir backend && cd backend
npm init -y
npm install fastify better-sqlite3 @fastify/static @fastify/helmet
npm install -D typescript @types/node @types/better-sqlite3 tsx vitest
```

### Architectural Decisions Provided by Starter

- **Language & Runtime:** TypeScript with strict mode, Node.js 20+
- **Styling Solution:** None pre-selected — to be decided in architecture decisions (CSS Modules, Tailwind, or vanilla CSS)
- **Build Tooling:** Vite (Rolldown bundler) for frontend; `tsx` for backend dev, `tsc` for backend build
- **Testing Framework:** Vitest (frontend — Vite-native, shares config), Vitest (backend — same toolchain, consistent coverage reporting)
- **Code Organization:** Monorepo with `frontend/` and `backend/` directories, shared TypeScript config possible
- **Development Experience:** Vite HMR for frontend, `tsx watch` for backend hot-reload
- **Deployment:** Single container — Fastify serves API routes and static frontend files via `@fastify/static`. No nginx, no CORS.

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
Database access pattern, API contract, container architecture, frontend state management

**Important Decisions (Shape Architecture):**
Validation strategy, error handling, styling, testing infrastructure

**Deferred Decisions (Post-MVP):**
Rate limiting, monitoring/APM, caching, authentication

### Data Architecture

| Decision | Choice | Rationale |
|---|---|---|
| Database engine | SQLite via `better-sqlite3` v12.x | Synchronous API, zero-config, fastest Node.js SQLite driver |
| Access pattern | Direct `better-sqlite3` queries | One entity, ~5 queries total. ORM adds 15+ dependencies for negligible type-safety gain |
| Schema management | Inline `CREATE TABLE IF NOT EXISTS` at startup | Single table — migration files would add more infrastructure than the schema itself |
| WAL mode | **Required** — `db.pragma('journal_mode = WAL')` at init | Prevents corruption on container kill/crash with Docker volume mounts |
| Validation | Fastify built-in JSON Schema on route definitions | Zero dependencies, validates request body/params, doubles as implicit API documentation |
| Title constraint | `maxLength: 500` in JSON Schema | Prevents oversized payloads; Fastify's 1MB body limit is the outer defense |

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| Endpoints | `GET/POST /api/todos`, `PATCH/DELETE /api/todos/:id` | Standard REST. `/api` prefix separates from static assets |
| Response format | Raw entity/array for success; `{ statusCode, error, message }` for errors | Fastify defaults — no custom envelope wrapper (YAGNI) |
| Error handling | HTTP status codes: 400 (validation), 404 (not found), 500 (server) | `setErrorHandler` for consistent formatting |
| CORS | **Not needed** | Same-origin deployment — Fastify serves both API and static files |
| Filtering | **Client-side only** | `GET /api/todos` returns all todos. Frontend filters by all/active/completed in render. At todo-list scale, server-side filtering is unnecessary |

### Frontend Architecture

| Decision | Choice | Rationale |
|---|---|---|
| State management | React `useState` with helper functions | One array of todos — no library warranted. Action types in a reducer would add ceremony without complexity to justify it |
| Optimistic updates | Fire-and-forget, closure-based snapshots | Each mutation captures pre-mutation array via closure. Concurrent mutations independently rollback on failure. No operation queue |
| Styling | Single global `app.css` | ~50 lines of CSS for ~10 classes. CSS Modules solve name-collision problems that don't exist at this scale |
| Components | Flat: `TodoList`, `TodoItem`, `AddTodo` | One feature, one view. No nested folder hierarchy |
| Routing | None | Single-page, single-view application. No React Router |
| XSS protection | React's default JSX escaping | No `dangerouslySetInnerHTML` permitted. Server stores raw text; React handles output encoding |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| Container count | **1** (+ Docker volume for SQLite) | Fastify serves both API and static files via `@fastify/static`. Eliminates nginx container, Dockerfile, and CORS entirely |
| Base image | `node:20-alpine` | Small, LTS, proven Docker pattern |
| Build strategy | Multi-stage Dockerfile | Stage 1: build frontend (Vite). Stage 2: build backend (tsc). Stage 3: slim runtime with both artifacts |
| Frontend serving | `@fastify/static` | Serves Vite build output. No SPA fallback needed (no client-side routing) |
| Env configuration | Docker Compose environment variables | `DATABASE_PATH`, `API_PORT`. No `.env` file complexity |
| Logging | Fastify's built-in Pino | Structured JSON logging, zero config, production-ready by default |
| Health check | `GET /api/health` executes `SELECT 1` | Returns 503 on database failure. Docker Compose `healthcheck` directive uses `wget --spider -q http://localhost:3000/api/health` |
| Monitoring | Health endpoint only | No metrics, no APM. Deferred |

### Testing Infrastructure

| Decision | Choice | Rationale |
|---|---|---|
| Unit/Integration | Vitest (both frontend and backend) | Vite-native, shares config, unified coverage toolchain |
| E2E | Playwright (≥5 tests) | PRD hard requirement |
| Coverage target | ≥70% combined | Workspace Vitest config or `nyc merge` to produce single combined report |
| Coverage scope | Frontend components + backend route handlers | JSON Schema validation tested by framework (Fastify), not by us |

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffolding (Vite + Fastify init)
2. Database initialization with inline schema + WAL pragma
3. API routes with JSON Schema validation
4. Frontend components with global CSS
5. Optimistic update wiring with `useState`
6. Multi-stage Dockerfile
7. Docker Compose with healthcheck + volume
8. Vitest coverage configuration
9. Playwright E2E tests

**Cross-Component Dependencies:**
- JSON Schema definitions serve triple duty: API validation, error messages, implicit documentation
- Database init (schema + WAL) must complete before Fastify starts listening
- Frontend build output path must match `@fastify/static` configuration in Dockerfile
- Playwright tests need the full Docker Compose stack running
- Coverage merge strategy must be decided during scaffolding, not bolted on after

## Implementation Patterns & Consistency Rules

### Naming Conventions

| Area | Convention | Example |
|---|---|---|
| DB tables | `snake_case`, plural | `todos` |
| DB columns | `snake_case` | `created_at`, `is_completed` |
| API endpoints | `kebab-case`, plural nouns | `/api/todos`, `/api/todos/:id` |
| JSON fields | `camelCase` | `{ id, title, isCompleted, createdAt }` |
| TS files (backend) | `kebab-case` | `todo-routes.ts`, `db.ts` |
| React components | `PascalCase` files + exports | `TodoList.tsx`, `TodoItem.tsx` |
| Functions/variables | `camelCase` | `getTodos()`, `todoList` |
| Types/interfaces | `PascalCase`, no `I` prefix | `Todo`, `CreateTodoInput` |
| CSS classes | `kebab-case` | `.todo-item`, `.add-todo-form` |

**DB→API field mapping:** Backend translates `snake_case` columns to `camelCase` JSON in the route handler query result mapper. One location, not middleware.

### Structure Conventions

- All React components flat in `frontend/src/components/`
- All API routes in `backend/src/routes/`
- All JSON Schema definitions in `backend/src/schemas/`
- Database initialization and queries in `backend/src/db.ts`
- Frontend API fetch wrappers in `frontend/src/api/`
- Shared TypeScript types in `frontend/src/types/`
- Tests co-located: `frontend/tests/`, `backend/tests/`, `e2e/`

### Format Standards

**API Success Responses:**
- `GET /api/todos` → `Todo[]` (bare array)
- `GET /api/todos/:id` → `Todo` (bare object)
- `POST /api/todos` → `Todo` (201 Created)
- `PATCH /api/todos/:id` → `Todo` (200 OK)
- `DELETE /api/todos/:id` → 204 No Content

**API Error Responses:** Fastify default `{ statusCode, error, message }`

**Date format:** ISO 8601 strings in JSON (`"2026-04-27T14:30:00.000Z"`). Stored as TEXT in SQLite.

**Todo Entity:**
```typescript
interface Todo {
  id: number;
  title: string;
  isCompleted: boolean;
  createdAt: string; // ISO 8601
}
```

### Process Standards

**Error Handling:**
- Backend: Fastify `setErrorHandler` catches all, returns consistent `{ statusCode, error, message }`
- Frontend: `try/catch` in API functions → throw typed errors → component catches and rolls back optimistic state
- No global error boundary (single view, errors are local to mutations)

**Loading States:**
- `isLoading: boolean` in App component for initial fetch only
- Individual mutations don't show loading (optimistic = instant UI)

### Enforcement Rules

**All AI Agents MUST:**
- Use `camelCase` for JSON fields, `snake_case` for database columns
- Place all components flat in `frontend/src/components/`
- Use Fastify JSON Schema for ALL route validation (no manual `if` checks)
- Return bare entities on success, Fastify default format on error
- Map DB→API field names in the route handler, not in middleware

**Anti-Patterns (FORBIDDEN):**
- `any` type in TypeScript (use `unknown` if type is truly unknown)
- `dangerouslySetInnerHTML` anywhere
- Direct SQLite queries outside `backend/src/db.ts`
- CSS-in-JS, styled-components, or inline styles
- `console.log` for logging (use Fastify's `request.log` or `fastify.log`)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
sdd-todo/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddTodo.tsx          # FR1-FR4: Add todo form, input validation, submit
│   │   │   ├── TodoList.tsx         # FR5-FR8: List display, filtering (all/active/completed)
│   │   │   ├── TodoItem.tsx         # FR9-FR14: Toggle, delete, display, completion state
│   │   │   └── TodoFooter.tsx       # FR15-FR17: Item count, filter controls, clear completed
│   │   ├── api/
│   │   │   └── todo-api.ts          # Fetch wrappers for all API endpoints
│   │   ├── types/
│   │   │   └── todo.ts              # Todo interface, CreateTodoInput, API error types
│   │   ├── App.tsx                  # Root: state management, optimistic updates, orchestration
│   │   ├── App.css                  # All application styles (~50 lines)
│   │   └── main.tsx                 # React DOM entry point
│   ├── tests/
│   │   ├── App.test.tsx             # Integration: state management, optimistic updates
│   │   ├── AddTodo.test.tsx         # Unit: form validation, submit behavior
│   │   ├── TodoList.test.tsx        # Unit: filtering, rendering
│   │   ├── TodoItem.test.tsx        # Unit: toggle, delete, display
│   │   └── todo-api.test.ts         # Unit: fetch wrappers, error handling
│   ├── index.html                   # Vite entry HTML
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts               # Vitest config included here
├── backend/
│   ├── src/
│   │   ├── server.ts                # Fastify init, plugin registration, static serving, start
│   │   ├── db.ts                    # SQLite init, schema creation, WAL pragma, query functions
│   │   ├── routes/
│   │   │   └── todo-routes.ts       # FR20-FR26: All CRUD endpoints, JSON Schema validation
│   │   └── schemas/
│   │       └── todo-schemas.ts      # JSON Schema definitions for request/response validation
│   ├── tests/
│   │   ├── todo-routes.test.ts      # Integration: route handlers against test DB
│   │   └── db.test.ts               # Unit: schema creation, query functions
│   ├── package.json
│   └── tsconfig.json
├── e2e/
│   ├── tests/
│   │   ├── add-todo.spec.ts         # E2E: create todo flow
│   │   ├── toggle-todo.spec.ts      # E2E: mark complete/incomplete
│   │   ├── delete-todo.spec.ts      # E2E: remove todo
│   │   ├── filter-todos.spec.ts     # E2E: all/active/completed filtering
│   │   └── clear-completed.spec.ts  # E2E: bulk clear completed todos
│   ├── playwright.config.ts
│   └── package.json
├── Dockerfile                       # Multi-stage: build frontend → build backend → runtime
├── docker-compose.yml               # Single service + volume + healthcheck
├── .gitignore
└── README.md
```

### Architectural Boundaries

**API Boundary:** `/api/*` routes are the sole interface between frontend and backend. Frontend never imports backend code. Backend never imports frontend code. The `Todo` type definition lives in `frontend/src/types/todo.ts` — backend uses JSON Schema as its type contract.

**Data Boundary:** All SQLite access goes through `backend/src/db.ts`. Route handlers call exported functions (`getAllTodos()`, `createTodo()`, etc.) — never raw `db.prepare()` calls. This is the single file that touches `better-sqlite3`.

**Static Boundary:** In production (Docker), `@fastify/static` serves the built `frontend/dist/` directory. In development, Vite dev server runs independently on its own port; the backend runs on a separate port.

### Requirements to Structure Mapping

| FR Category | Primary Files | Test Files |
|---|---|---|
| FR1-FR4: Todo Creation | `AddTodo.tsx`, `todo-routes.ts`, `db.ts` | `AddTodo.test.tsx`, `todo-routes.test.ts` |
| FR5-FR8: Todo Listing/Filtering | `TodoList.tsx`, `App.tsx` | `TodoList.test.tsx`, `App.test.tsx` |
| FR9-FR14: Todo Operations | `TodoItem.tsx`, `todo-routes.ts`, `db.ts` | `TodoItem.test.tsx`, `todo-routes.test.ts` |
| FR15-FR17: Footer/Bulk Ops | `TodoFooter.tsx`, `todo-routes.ts` | `App.test.tsx`, `todo-routes.test.ts` |
| FR18-FR19: Error/Optimistic | `App.tsx`, `todo-api.ts` | `App.test.tsx`, `todo-api.test.ts` |
| FR20-FR26: REST API | `todo-routes.ts`, `todo-schemas.ts`, `db.ts` | `todo-routes.test.ts`, `db.test.ts` |
| FR27-FR28: Deployment | `Dockerfile`, `docker-compose.yml` | `e2e/tests/*.spec.ts` |

### Data Flow

```
User Input → React Component → useState (optimistic) → todo-api.ts → fetch()
    → Fastify Route → JSON Schema Validation → db.ts → SQLite
    ← Response ← Route Handler (snake→camel mapping) ← db.ts result
← Update state (confirm) or rollback (on error) ← todo-api.ts response
```

### Development vs Production

| Concern | Development | Production (Docker) |
|---|---|---|
| Frontend | `vite dev` on port 5173 | Built static files served by Fastify |
| Backend | `tsx watch src/server.ts` on port 3000 | `node dist/server.js` on port 3000 |
| Database | `./data/todos.db` (local file) | Docker volume mount at `DATABASE_PATH` |
| Static serving | Not used (separate Vite server) | `@fastify/static` serves `frontend/dist/` |

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All technology choices are mutually compatible. Vite + React + TypeScript is a standard combination. Fastify v5.x runs on Node 20 LTS. better-sqlite3 v12.x has prebuilt binaries for Node 20. `@fastify/static` and `@fastify/helmet` are maintained by the Fastify team. Vitest shares Vite's config natively. No version conflicts.

**Pattern Consistency:** Naming conventions (snake_case DB → camelCase JSON) consistently specified with a single mapping location. File naming aligns with ecosystems (PascalCase React, kebab-case backend). All patterns support the chosen stack.

**Structure Alignment:** Project tree matches every decision. Boundaries are physically enforced by directory structure. Single `db.ts` data boundary, `schemas/` for validation, flat components.

### Requirements Coverage ✅

**All 28 Functional Requirements** have explicit architectural support:
- FR1-FR19 (UI): Mapped to specific React components with test files
- FR20-FR26 (API): Covered by `todo-routes.ts` + `todo-schemas.ts` + Fastify JSON Schema validation
- FR27-FR28 (Deployment): Single-service Docker Compose + volume + healthcheck

**All Non-Functional Requirements** addressed:
- Performance: Optimistic updates (<100ms), SQLite sync queries (<200ms), Vite build optimization (FCP/TTI)
- Security: JSON Schema validation, `@fastify/helmet` (CSP + security headers), parameterized SQL queries, React JSX escaping
- Accessibility: Semantic HTML, keyboard navigation, ARIA attributes specified in component requirements
- Reliability: WAL mode, Docker volume persistence, optimistic rollback on failure
- Testing: Vitest (unified coverage), Playwright (5 E2E specs), merge strategy defined

### Implementation Readiness ✅

**Decision Completeness:** All critical decisions documented with versions. Implementation patterns comprehensive. Consistency rules clear and enforceable with concrete examples.

**Structure Completeness:** Every file and directory defined. All integration points specified. Component boundaries well-defined with FR-to-file mapping.

**Pattern Completeness:** All conflict points addressed (naming, structure, format, process). Enforcement rules and anti-patterns documented.

### Architecture Completeness Checklist

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped
- [x] Starter template evaluated and selected
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication and format patterns specified
- [x] Process patterns (error handling, loading, optimistic updates) documented
- [x] Complete directory structure with all files defined
- [x] Component boundaries established
- [x] Requirements mapped to specific files
- [x] Data flow documented
- [x] Dev vs production environments specified
- [x] All FRs architecturally supported
- [x] All NFRs architecturally supported
- [x] Zero validation gaps remaining

### Readiness Assessment

**Status:** READY FOR IMPLEMENTATION

**Confidence:** High — every requirement maps to a specific file, every decision has rationale, all agent conflict points are resolved.

**First Implementation Priority:** Project scaffolding — run Vite `react-ts` template, initialize Fastify backend, configure Vitest, create Dockerfile skeleton.
