---
status: 'complete'
completedAt: '2026-04-27'
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/ux-design-specification.md']
---

# sdd-todo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for sdd-todo, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: User can create a new todo by entering text and pressing Enter.
- FR2: User can view all active (incomplete) todos immediately upon opening the app.
- FR3: User can mark a todo as complete.
- FR4: User can mark a completed todo as incomplete (recover accidental completion).
- FR5: User can delete an individual todo.
- FR6: User can clear all completed todos in a single bulk action.
- FR7: User can access and view completed todos through a dedicated mechanism.
- FR8: Each todo stores a text description, completion status, and creation timestamp.
- FR9: Todo text is validated — empty submissions are prevented.
- FR10: Todo text handles long descriptions without breaking the UI.
- FR11: All todo data persists across browser refreshes and sessions.
- FR12: All todo data persists across container restarts.
- FR13: User is informed if a data write operation fails — no silent data loss.
- FR14: Active todos are visually distinguished from completed todos.
- FR15: The app displays a helpful empty state when no todos exist.
- FR16: The app displays appropriate feedback during error conditions.
- FR17: The app communicates network connectivity issues to the user.
- FR18: The app is fully usable across desktop and mobile viewports.
- FR19: All core actions (create, complete, delete) are accessible via keyboard navigation.
- FR20: API consumers can create a todo via POST request.
- FR21: API consumers can retrieve all todos via GET request.
- FR22: API consumers can update a todo (including completion status) via PATCH request.
- FR23: API consumers can delete a todo via DELETE request.
- FR24: API returns appropriate HTTP status codes for success and error conditions.
- FR25: API returns descriptive error messages for invalid requests (malformed JSON, missing fields, non-existent resources).
- FR26: API validates and sanitizes all input to prevent injection attacks.
- FR27: The complete application (frontend, API, database) starts via a single `docker-compose up` command with zero manual setup.
- FR28: Database storage uses a persistent volume that survives container lifecycle.

### NonFunctional Requirements

- NFR1: All UI interactions (create, complete, delete) provide feedback in under 100ms via optimistic updates.
- NFR2: API CRUD operations respond in under 200ms under normal conditions.
- NFR3: First Contentful Paint under 1.5 seconds.
- NFR4: Time to Interactive under 2 seconds.
- NFR5: Largest Contentful Paint under 2.5 seconds.
- NFR6: No loading spinners for standard CRUD operations.
- NFR7: All user input is sanitized server-side before storage to prevent XSS and injection attacks.
- NFR8: SQL injection protection on all database operations.
- NFR9: Content-Security-Policy headers served with the SPA.
- NFR10: API accepts only well-formed requests; malformed input is rejected with descriptive errors.
- NFR11: Zero critical WCAG 2.1 violations.
- NFR12: Semantic HTML with proper heading hierarchy, form labels, and button elements.
- NFR13: Full keyboard navigation for all core actions.
- NFR14: ARIA attributes where semantic HTML is insufficient.
- NFR15: Visible focus indicators for keyboard users.
- NFR16: Data persists across browser sessions and container restarts.
- NFR17: Failed write operations are communicated to the user — no silent data loss.
- NFR18: The app degrades gracefully during network issues (error state, not crash).
- NFR19: Minimum 70% code coverage across the codebase.
- NFR20: Minimum 5 passing Playwright end-to-end tests covering core user flows.
- NFR21: Tests run as part of a repeatable, CI-ready process.

### Additional Requirements

_From Architecture document:_

- AR1: Initialize project with Vite `react-ts` template for frontend and manual Fastify setup for backend (architecture starter template).
- AR2: Single container architecture — Fastify serves both API routes (`/api/*`) and static frontend files via `@fastify/static`.
- AR3: SQLite via `better-sqlite3` with inline `CREATE TABLE IF NOT EXISTS` schema at startup and WAL pragma.
- AR4: Fastify JSON Schema validation on all route definitions — no manual `if` checks.
- AR5: React `useState` for state management with closure-based optimistic update pattern.
- AR6: Multi-stage Dockerfile: build frontend (Vite) → build backend (tsc) → slim runtime.
- AR7: Docker Compose with healthcheck (`wget` against `GET /api/health` which runs `SELECT 1`).
- AR8: DB→API field mapping (`snake_case` → `camelCase`) in route handlers only.
- AR9: `@fastify/helmet` for CSP and security headers.
- AR10: Vitest for both frontend and backend testing with unified coverage reporting.
- AR11: Playwright for E2E tests running against Docker Compose stack.

### UX Design Requirements

- UX-DR1: Implement CSS custom properties (design tokens) for colors, typography, spacing, and effects as defined in the UX design system foundation.
- UX-DR2: Implement `AddTodo` component — `<form>` with `<input type="text">`, `autoFocus` on mount, Enter to submit, clear on submit, placeholder "What needs to be done?".
- UX-DR3: Implement `TodoItem` component — checkbox (60px left zone) + label + delete × button (40×40px, hover-only on desktop via `@media (hover: hover)`). Completed state: strike-through, `--color-completed` text.
- UX-DR4: Implement `TodoList` component — `<ul>` rendering filtered `TodoItem` children. Receives pre-filtered array from parent.
- UX-DR5: Implement `TodoFooter` component — item count ("{n} items left"), filter tabs (All/Active/Completed with `.filter--selected`), "Clear completed" button (visible only when ≥1 completed todo exists). Footer hidden when zero todos.
- UX-DR6: Implement empty state — title + input field + placeholder only. No footer, no welcome message.
- UX-DR7: Implement visual design — centered card (`max-width: 550px`), large thin "todos" title (`80px`, weight `100`), app shadow, `#ededed` borders between items.
- UX-DR8: Implement responsive strategy — mobile-first, full-width with `16px` padding below 550px, centered card above 550px. Delete buttons always visible on mobile, hover-only on desktop.
- UX-DR9: Implement accessibility — semantic HTML landmarks (`<main>`, `<form>`, `<ul>`, `<footer>`), `aria-label` on delete buttons ("Delete todo: {title}"), `role="navigation"` on filter list, keyboard-navigable tab order.
- UX-DR10: Implement error feedback — plain text message below input or above list, auto-dismisses after ~3 seconds. No toasts, no banners, no modals.
- UX-DR11: Footer text contrast — darken `#999` to `#777` or `#666` to meet WCAG AA 4.5:1 ratio at 14px.

### FR Coverage Map

- FR1: Epic 1 — Create todo via text + Enter
- FR2: Epic 1 — View active todos on app open
- FR3: Epic 2 — Mark todo as complete
- FR4: Epic 2 — Mark completed todo as incomplete
- FR5: Epic 2 — Delete individual todo
- FR6: Epic 2 — Bulk clear completed todos
- FR7: Epic 2 — View completed todos via filter
- FR8: Epic 1 — Todo stores title, completion status, creation timestamp
- FR9: Epic 1 — Empty submission prevented
- FR10: Epic 1 — Long text handled without breaking UI
- FR11: Epic 1 — Data persists across browser refreshes
- FR12: Epic 1 — Data persists across container restarts
- FR13: Epic 3 — User informed of write failures
- FR14: Epic 2 — Active vs completed visually distinguished
- FR15: Epic 1 — Empty state displayed when no todos
- FR16: Epic 3 — Error condition feedback
- FR17: Epic 3 — Network issue communication
- FR18: Epic 3 — Responsive desktop and mobile
- FR19: Epic 3 — Keyboard navigation for all core actions
- FR20: Epic 1 — POST /api/todos
- FR21: Epic 1 — GET /api/todos
- FR22: Epic 2 — PATCH /api/todos/:id
- FR23: Epic 2 — DELETE /api/todos/:id
- FR24: Epic 1 — Appropriate HTTP status codes
- FR25: Epic 1 — Descriptive error messages for invalid requests
- FR26: Epic 1 — Input validation and sanitization
- FR27: Epic 3 — docker-compose up zero-setup deployment
- FR28: Epic 3 — Persistent Docker volume

## Epic List

### Epic 1: Core Todo Experience

Users can open the app, create todos, and see them persisted across sessions. The "type → enter → done" loop works end-to-end with a polished visual design.

**FRs covered:** FR1, FR2, FR8, FR9, FR10, FR11, FR12, FR15, FR20, FR21, FR24, FR25, FR26
**ARs covered:** AR1, AR2, AR3, AR4, AR8, AR9
**UX-DRs covered:** UX-DR1, UX-DR2, UX-DR6, UX-DR7

### Epic 2: Complete Todo Management

Users can manage the full todo lifecycle — complete, uncomplete, delete, filter by status, and bulk-clear completed items. Every todo action is available.

**FRs covered:** FR3, FR4, FR5, FR6, FR7, FR14, FR22, FR23
**ARs covered:** AR5
**UX-DRs covered:** UX-DR3, UX-DR4, UX-DR5

### Epic 3: Production-Ready Deployment

The app is containerized with zero-setup deployment, handles errors gracefully, is fully accessible and responsive, and has comprehensive test coverage.

**FRs covered:** FR13, FR16, FR17, FR18, FR19, FR27, FR28
**ARs covered:** AR6, AR7, AR10, AR11
**UX-DRs covered:** UX-DR8, UX-DR9, UX-DR10, UX-DR11

## Epic 1: Core Todo Experience

Users can open the app, create todos, and see them persisted across sessions. The "type → enter → done" loop works end-to-end with a polished visual design.

### Story 1.1: Project Setup & API Foundation

As an **API consumer**,
I want a working REST API for creating and retrieving todos,
So that I can manage todos programmatically.

**Acceptance Criteria:**

**Given** a fresh project checkout
**When** I run the dev startup commands
**Then** the Vite React frontend serves on its dev port and the Fastify backend serves on port 3000

**Given** the backend is running
**When** the server starts
**Then** SQLite database is initialized with `CREATE TABLE IF NOT EXISTS todos` (columns: `id INTEGER PRIMARY KEY AUTOINCREMENT`, `title TEXT NOT NULL`, `is_completed INTEGER DEFAULT 0`, `created_at TEXT DEFAULT CURRENT_TIMESTAMP`) and WAL pragma is set

**Given** the database is initialized
**When** I send `POST /api/todos` with `{ "title": "Buy groceries" }`
**Then** I receive 201 with the created todo as `{ id, title, isCompleted: false, createdAt }` (camelCase JSON)

**Given** a todo exists
**When** I send `GET /api/todos`
**Then** I receive 200 with an array of all todos in camelCase format

**Given** I send `POST /api/todos` with empty title or missing title
**When** the server validates via Fastify JSON Schema
**Then** I receive 400 with `{ statusCode: 400, error: "Bad Request", message: "..." }`

**Given** I send `POST /api/todos` with title exceeding 500 characters
**When** the server validates
**Then** I receive 400 with a descriptive error

**Given** any request to the API
**When** the response is sent
**Then** `@fastify/helmet` CSP and security headers are present

**Given** the backend is running
**When** I send `GET /api/health`
**Then** I receive 200 confirming the database is operational (`SELECT 1`)

**Covers:** FR8, FR20, FR21, FR24, FR25, FR26 | AR1, AR2, AR3, AR4, AR8, AR9

### Story 1.2: Create & View Todos UI

As a **user**,
I want to open the app, create todos by typing and pressing Enter, and see them displayed and persisted,
So that I can quickly capture and review my tasks.

**Acceptance Criteria:**

**Given** I open the app for the first time
**When** the page loads
**Then** I see a centered card (`max-width: 550px`) with a large thin "todos" title, a text input with placeholder "What needs to be done?" that is auto-focused, and no footer

**Given** CSS custom properties are defined
**When** the app renders
**Then** design tokens for colors, typography, spacing, and effects match the UX design specification (`:root` variables)

**Given** I type "Buy groceries" in the input
**When** I press Enter
**Then** the todo appears in the list below the input, the input is cleared, focus remains on the input, and the todo is persisted via `POST /api/todos`

**Given** I press Enter with empty or whitespace-only input
**When** the form attempts to submit
**Then** nothing happens — no todo is created, no error is shown

**Given** I type a very long todo title (up to 500 characters)
**When** it renders in the list
**Then** the text wraps gracefully without breaking the layout

**Given** I have added several todos
**When** I refresh the browser
**Then** all todos are still displayed (fetched via `GET /api/todos`)

**Given** no todos exist
**When** the page loads
**Then** I see only the title and input field — no footer, no empty state message beyond the placeholder

**Covers:** FR1, FR2, FR9, FR10, FR11, FR12, FR15 | UX-DR1, UX-DR2, UX-DR6, UX-DR7

## Epic 2: Complete Todo Management

Users can manage the full todo lifecycle — complete, uncomplete, delete, filter by status, and bulk-clear completed items. Every todo action is available.

### Story 2.1: Toggle & Delete Todos

As a **user**,
I want to mark todos as complete or incomplete and delete individual todos,
So that I can manage my task progress and remove items I no longer need.

**Acceptance Criteria:**

**Given** a todo exists in the list
**When** I click its checkbox
**Then** it toggles to completed — strike-through text, `--color-completed` muted color, checked checkbox — and the change is persisted via `PATCH /api/todos/:id`

**Given** a completed todo exists
**When** I click its checkbox again
**Then** it toggles back to active — normal text, unchecked checkbox — persisted via `PATCH /api/todos/:id`

**Given** a todo exists (active or completed)
**When** I hover over it on desktop
**Then** a × delete button appears on the right side (40×40px hit area)

**Given** I'm on a mobile viewport
**When** todos are displayed
**Then** the × delete button is always visible (no hover required)

**Given** a todo exists
**When** I click the × delete button
**Then** the todo is immediately removed from the list and deleted via `DELETE /api/todos/:id`

**Given** the API endpoint `PATCH /api/todos/:id`
**When** I send `{ "isCompleted": true }` or `{ "isCompleted": false }`
**Then** I receive 200 with the updated todo in camelCase JSON

**Given** the API endpoint `DELETE /api/todos/:id`
**When** I delete a todo
**Then** I receive 204 No Content

**Given** I send PATCH or DELETE for a non-existent todo ID
**When** the server processes the request
**Then** I receive 404 with a descriptive error message

**Given** all state changes (toggle, delete)
**When** the user performs them
**Then** the UI updates optimistically (instant) with closure-based rollback on API failure

**Covers:** FR3, FR4, FR5, FR14, FR22, FR23 | AR5 | UX-DR3

### Story 2.2: Filter Todos & Bulk Clear

As a **user**,
I want to filter my todo list by status and clear all completed items at once,
So that I can focus on what's left and clean up efficiently.

**Acceptance Criteria:**

**Given** at least one todo exists (active or completed)
**When** the list is displayed
**Then** a footer appears with: item count ("{n} items left" / "{n} item left" counting active only), three filter tabs (All / Active / Completed), and a "Clear completed" button (visible only when ≥1 completed todo exists)

**Given** the footer is visible
**When** I click "Active" filter tab
**Then** only incomplete todos are shown, and the "Active" tab has `.filter--selected` styling

**Given** the footer is visible
**When** I click "Completed" filter tab
**Then** only completed todos are shown, and the "Completed" tab has `.filter--selected` styling

**Given** the footer is visible
**When** I click "All" filter tab
**Then** all todos are shown (default state on page load)

**Given** all todos are filtered out (e.g., "Active" with all completed)
**When** the list is empty due to the filter
**Then** the list area is empty but the footer remains visible with count and filter tabs

**Given** completed todos exist
**When** I click "Clear completed"
**Then** all completed todos are removed from the list and deleted via the API. Active todos are unaffected.

**Given** no completed todos exist
**When** the footer is displayed
**Then** the "Clear completed" button is hidden

**Given** no todos exist at all (all deleted or cleared)
**When** the last todo is removed
**Then** the footer disappears entirely — returning to the empty state (title + input only)

**Given** filtering is client-side
**When** `GET /api/todos` returns all todos
**Then** the App component filters the array before passing to TodoList based on the active filter state

**Covers:** FR6, FR7 | UX-DR4, UX-DR5

## Epic 3: Production-Ready Deployment

The app is containerized with zero-setup deployment, handles errors gracefully, is fully accessible and responsive, and has comprehensive test coverage.

### Story 3.1: Error Handling & Resilience

As a **user**,
I want to be informed when something goes wrong and never lose data silently,
So that I can trust the app with my tasks.

**Acceptance Criteria:**

**Given** I create, toggle, or delete a todo
**When** the API request fails (network error or server error)
**Then** the optimistic UI change is rolled back to the pre-mutation state

**Given** an API operation fails
**When** the error is caught
**Then** a plain text error message appears (e.g., "Could not save. Please try again.") below the input or above the list

**Given** an error message is displayed
**When** ~3 seconds elapse
**Then** the error message auto-dismisses without user interaction

**Given** the network is unavailable
**When** I attempt any CRUD operation
**Then** I see a text error message and no data is silently lost — the UI reflects the actual persisted state after rollback

**Given** error feedback is implemented
**When** it renders
**Then** it is plain text only — no toasts, no colored banners, no modals

**Covers:** FR13, FR16, FR17 | UX-DR10

### Story 3.2: Responsive Design & Accessibility

As a **user**,
I want the app to work perfectly on my phone and be fully keyboard-navigable,
So that I can use it on any device and with any input method.

**Acceptance Criteria:**

**Given** a viewport below 550px
**When** the app renders
**Then** the container is full-width with `16px` side padding, delete × buttons are always visible, and all touch targets are ≥ 44×44px

**Given** a viewport ≥ 550px
**When** the app renders
**Then** the container is centered with `max-width: 550px` and delete buttons appear on hover only (via `@media (hover: hover)`)

**Given** the footer on a narrow mobile viewport
**When** content doesn't fit a single row
**Then** it stacks vertically: count → filters → clear completed

**Given** the app is loaded
**When** I inspect the HTML structure
**Then** it uses semantic landmarks: `<main>`, `<form>`, `<ul>`, `<li>`, `<label>`, `<button>`, `<footer>`

**Given** a delete button exists
**When** a screen reader encounters it
**Then** it reads `aria-label="Delete todo: {title}"`

**Given** the filter list in the footer
**When** a screen reader encounters it
**Then** it has `role="navigation"` and `aria-label="Filter todos"`

**Given** the app is loaded
**When** I navigate using only Tab, Shift+Tab, Enter, and Space
**Then** I can create a todo, toggle completion, delete a todo, switch filters, and clear completed — in natural tab order

**Given** a keyboard user is navigating
**When** an element receives focus
**Then** a visible focus indicator is displayed (browser default, never suppressed)

**Given** the footer text is rendered at 14px
**When** I check its color
**Then** it uses `#777` or darker (not `#999`) to meet WCAG AA 4.5:1 contrast ratio

**Covers:** FR18, FR19 | UX-DR8, UX-DR9, UX-DR11

### Story 3.3: Docker Deployment & Testing

As a **developer**,
I want to run `docker-compose up` and have the complete app working, with ≥70% test coverage and ≥5 E2E tests,
So that the project meets all SDD quality gates.

**Acceptance Criteria:**

**Given** a fresh clone of the repository
**When** I run `docker-compose up`
**Then** the app is accessible at `http://localhost:3000` with both the frontend UI and API endpoints working, with zero manual setup steps

**Given** the Dockerfile
**When** it builds
**Then** it uses multi-stage build: Stage 1 builds frontend (Vite), Stage 2 builds backend (tsc), Stage 3 is slim `node:20-alpine` runtime with both artifacts

**Given** `docker-compose.yml` defines a volume
**When** I `docker-compose down` and `docker-compose up` again
**Then** all previously created todos are still present (persistent SQLite volume)

**Given** `docker-compose.yml` defines a healthcheck
**When** the container is running
**Then** `wget --spider -q http://localhost:3000/api/health` succeeds and Docker reports the container as healthy

**Given** Vitest is configured for both frontend and backend
**When** I run the test suites
**Then** combined code coverage is ≥ 70%

**Given** Playwright is configured
**When** I run the E2E test suite against the Docker Compose stack
**Then** at least 5 tests pass covering: add todo, toggle todo, delete todo, filter todos, clear completed

**Given** the test infrastructure
**When** tests are executed
**Then** they run as a repeatable, CI-ready process (no manual intervention)

**Covers:** FR27, FR28 | AR6, AR7, AR10, AR11
