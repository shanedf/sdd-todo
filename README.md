# sdd-todo

A full-stack TodoMVC-style application built with React + Vite (frontend) and Fastify + SQLite (backend). Designed as an SDD (Specification-Driven Development) reference project with comprehensive test coverage and one-command Docker deployment.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** Fastify, better-sqlite3, TypeScript
- **Database:** SQLite (WAL mode)
- **Testing:** Vitest (unit/integration), Playwright (E2E)
- **Deployment:** Docker, Docker Compose

## Quick Start (Docker)

```bash
docker compose up
```

The app is available at **http://localhost:3000**. That's it — no other setup required.

Data persists across restarts via a Docker volume. To stop:

```bash
docker compose down
```

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Install & Run

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (separate terminal)
cd frontend && npm install && npm run dev
```

The frontend dev server proxies API requests to the backend on port 3000.

## Testing

```bash
# Backend unit/integration tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test

# Coverage reports
cd backend && npm run test:coverage
cd frontend && npm run test:coverage

# E2E tests (requires app running on localhost:3000)
cd e2e && npm install && npx playwright install --with-deps && npm test
```

## Project Structure

```
├── backend/          # Fastify API + SQLite + static file serving
│   └── src/
├── frontend/         # React + Vite SPA
│   └── src/
├── e2e/              # Playwright end-to-end tests
├── Dockerfile        # Multi-stage build (frontend → backend → runtime)
├── docker-compose.yml
└── _bmad-output/     # SDD planning & implementation artifacts
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/todos` | List all todos |
| POST | `/api/todos` | Create a todo |
| PATCH | `/api/todos/:id` | Toggle/update a todo |
| DELETE | `/api/todos/:id` | Delete a todo |
| DELETE | `/api/todos/completed` | Clear completed todos |
| GET | `/api/health` | Health check |
