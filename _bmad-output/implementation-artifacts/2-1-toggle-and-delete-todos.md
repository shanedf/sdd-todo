# Story 2.1: Toggle & Delete Todos

Status: done

## Story

As a **user**,
I want to mark todos as complete or incomplete and delete individual todos,
so that I can manage my task progress and remove items I no longer need.

## Acceptance Criteria (BDD)

1. **Given** a todo exists in the list, **When** I click its checkbox, **Then** it toggles to completed — strike-through text, `--color-completed` muted color, checked checkbox — and the change is persisted via `PATCH /api/todos/:id`.

2. **Given** a completed todo exists, **When** I click its checkbox again, **Then** it toggles back to active — normal text, unchecked checkbox — persisted via `PATCH /api/todos/:id`.

3. **Given** a todo exists (active or completed), **When** I hover over it on desktop, **Then** a × delete button appears on the right side (40×40px hit area).

4. **Given** I'm on a mobile viewport, **When** todos are displayed, **Then** the × delete button is always visible (no hover required).

5. **Given** a todo exists, **When** I click the × delete button, **Then** the todo is immediately removed from the list and deleted via `DELETE /api/todos/:id`.

6. **Given** the API endpoint `PATCH /api/todos/:id`, **When** I send `{ "isCompleted": true }` or `{ "isCompleted": false }`, **Then** I receive 200 with the updated todo in camelCase JSON.

7. **Given** the API endpoint `DELETE /api/todos/:id`, **When** I delete a todo, **Then** I receive 204 No Content.

8. **Given** I send PATCH or DELETE for a non-existent todo ID, **When** the server processes the request, **Then** I receive 404 with a descriptive error message.

9. **Given** all state changes (toggle, delete), **When** the user performs them, **Then** the UI updates optimistically (instant) with closure-based rollback on API failure.

## Requirements Covered

- **FRs:** FR3, FR4, FR5, FR14, FR22, FR23
- **ARs:** AR5 (useState, optimistic updates with closure-based rollback)
- **UX-DRs:** UX-DR3 (TodoItem component — checkbox, label, delete button, completed state)

## Tasks / Subtasks

- [x] **Task 1: Backend — add `updateTodo` and `deleteTodo` to db.ts** (AC: #6, #7, #8)
  - [x] 1.1: Add `updateTodo(id: number, isCompleted: boolean): Todo | undefined` — `UPDATE todos SET is_completed = ? WHERE id = ?`, return mapped todo or undefined if not found
  - [x] 1.2: Add `deleteTodo(id: number): boolean` — `DELETE FROM todos WHERE id = ?`, return `true` if `changes > 0`, `false` if no rows affected
  - [x] 1.3: Add unit tests in `backend/tests/db.test.ts`: updateTodo flips is_completed, updateTodo returns undefined for non-existent id, deleteTodo removes row, deleteTodo returns false for non-existent id

- [x] **Task 2: Backend — add JSON schemas for PATCH and DELETE** (AC: #6, #7, #8)
  - [x] 2.1: Add `updateTodoSchema` to `backend/src/schemas/todo-schemas.ts` — body: `{ isCompleted: boolean }` required, params: `{ id: integer }`, response 200: Todo shape, response 404: error shape
  - [x] 2.2: Add `deleteTodoSchema` to `backend/src/schemas/todo-schemas.ts` — params: `{ id: integer }`, response 204: empty, response 404: error shape
  - [x] 2.3: Define shared `todoResponseSchema` and `notFoundResponseSchema` objects to reuse across schemas (DRY — the Todo 200 shape is already duplicated between createTodoSchema and getTodosSchema)

- [x] **Task 3: Backend — add PATCH and DELETE routes** (AC: #6, #7, #8)
  - [x] 3.1: Add `PATCH /api/todos/:id` route in `backend/src/routes/todo-routes.ts` — extract `id` from params, `isCompleted` from body, call `updateTodo()`, return 200 with updated todo or 404
  - [x] 3.2: Add `DELETE /api/todos/:id` route in `backend/src/routes/todo-routes.ts` — extract `id` from params, call `deleteTodo()`, return 204 or 404
  - [x] 3.3: Import `updateTodo` and `deleteTodo` from db.ts
  - [x] 3.4: Add route tests in `backend/tests/todo-routes.test.ts`: PATCH toggles to completed, PATCH toggles back to active, PATCH non-existent returns 404, DELETE removes todo, DELETE non-existent returns 404, DELETE returns 204 (no body)

- [x] **Task 4: Frontend — add `updateTodo` and `deleteTodo` to todo-api.ts** (AC: #6, #7)
  - [x] 4.1: Add `updateTodo(id: number, isCompleted: boolean): Promise<Todo>` — `PATCH /api/todos/${id}` with `{ isCompleted }` body
  - [x] 4.2: Add `deleteTodo(id: number): Promise<void>` — `DELETE /api/todos/${id}`, no response body expected (204)

- [x] **Task 5: Frontend — update TodoItem component** (AC: #1, #2, #3, #4, #5)
  - [x] 5.1: Update `TodoItem` props to accept `onToggle: (id: number, isCompleted: boolean) => void` and `onDelete: (id: number) => void`
  - [x] 5.2: Add checkbox (`<input type="checkbox">`) in the 60px left zone, checked state bound to `todo.isCompleted`, `onChange` calls `onToggle(todo.id, !todo.isCompleted)`
  - [x] 5.3: Add delete button (`<button className="todo-destroy">×</button>`) with `aria-label="Delete todo: {todo.title}"`, `onClick` calls `onDelete(todo.id)`
  - [x] 5.4: Apply `.todo-item--completed` modifier class when `todo.isCompleted === true`
  - [x] 5.5: Wrap checkbox + label in semantic HTML: `<div className="todo-view">` containing the checkbox, label, and destroy button

- [x] **Task 6: Frontend — update TodoList to pass callbacks** (AC: #1, #5)
  - [x] 6.1: Update `TodoList` props to accept `onToggle` and `onDelete` callbacks
  - [x] 6.2: Pass `onToggle` and `onDelete` down to each `<TodoItem>`

- [x] **Task 7: Frontend — update App.tsx with toggle/delete handlers and optimistic updates** (AC: #1, #2, #5, #9)
  - [x] 7.1: Import `updateTodo as apiUpdateTodo` and `deleteTodo as apiDeleteTodo` from `./api/todo-api`
  - [x] 7.2: Implement `handleToggle(id, isCompleted)` — capture snapshot via closure, optimistically update `todos` state (flip `isCompleted` for matching id), then call `apiUpdateTodo(id, isCompleted)`. On failure: rollback to snapshot.
  - [x] 7.3: Implement `handleDelete(id)` — capture snapshot via closure, optimistically remove todo from state, then call `apiDeleteTodo(id)`. On failure: rollback to snapshot.
  - [x] 7.4: Pass `onToggle={handleToggle}` and `onDelete={handleDelete}` to `<TodoList>`

- [x] **Task 8: Frontend — CSS for checkbox, completed state, and delete button** (AC: #1, #2, #3, #4)
  - [x] 8.1: Style `.todo-toggle` (checkbox) — 40×40px, positioned in the 60px left zone, `cursor: pointer`, custom appearance (circle border matching TodoMVC style)
  - [x] 8.2: Style `.todo-item--completed .todo-label` — `text-decoration: line-through`, `color: var(--color-completed)`
  - [x] 8.3: Style `.todo-destroy` — absolute positioned right, 40×40px, `color: var(--color-accent)`, `font-size: 30px`, `cursor: pointer`, no border/background
  - [x] 8.4: Desktop hover reveal: `.todo-item .todo-destroy { display: none; }` + `.todo-item:hover .todo-destroy { display: block; }` inside `@media (hover: hover)`
  - [x] 8.5: Mobile always visible: default `.todo-destroy { display: block; }` (mobile-first, then hide on desktop hover devices)

- [x] **Task 9: Frontend tests** (AC: all)
  - [x] 9.1: Create `frontend/tests/TodoItem.test.tsx` — test checkbox renders, toggle calls onToggle with correct args, completed state has .todo-item--completed class, delete button calls onDelete, delete button has aria-label, completed state shows strike-through class
  - [x] 9.2: Update `frontend/tests/TodoList.test.tsx` — test that onToggle and onDelete are passed through to TodoItem children

### Review Findings

- [x] [Review][Patch] No test coverage for optimistic rollback on API failure — handleToggle and handleDelete capture snapshots and rollback in catch blocks, but no test verifies this behavior [frontend/src/App.tsx:26-43] — FIXED: added frontend/tests/App.test.tsx with 2 rollback tests
- [x] [Review][Defer] deleteTodo error response parsing could fail if response body is not valid JSON [frontend/src/api/todo-api.ts:40] — deferred, pre-existing pattern in handleResponse (error handling deferred to Story 3.1)
- [x] [Review][Defer] handleResponse success path: response.json() could throw on malformed body [frontend/src/api/todo-api.ts:8] — deferred, pre-existing pattern (error handling deferred to Story 3.1)

## Dev Notes

### Architecture Compliance (MUST FOLLOW)

- **State management:** React `useState` only. No Redux, no Zustand, no context.
- **Optimistic updates:** Fire-and-forget with closure-based snapshots. Each mutation captures pre-mutation array via closure. On failure, rollback. No operation queue. (Architecture: AR5)
- **Styling:** Single global `App.css` file with CSS custom properties. NO CSS-in-JS, NO styled-components, NO inline styles, NO CSS Modules.
- **Components:** Flat in `frontend/src/components/`. PascalCase files.
- **CSS classes:** `kebab-case` with BEM-lite modifiers: `.todo-item--completed`, `.todo-toggle`, `.todo-destroy`
- **API validation:** Fastify JSON Schema on ALL route definitions — no manual `if` checks for request validation.
- **DB access:** All SQLite queries in `backend/src/db.ts` only. Route handlers call exported functions.
- **Field mapping:** `snake_case` DB → `camelCase` JSON in `mapTodoRow()` in db.ts.
- **XSS protection:** React's default JSX escaping. Never use `dangerouslySetInnerHTML`.
- **No `any` type.** Use `unknown` if type is truly unknown.
- **No `console.log`.** Use Fastify's `request.log` or `fastify.log`.

### Existing Code State (READ BEFORE IMPLEMENTING)

#### `frontend/src/App.tsx` — Current State
- Has `useState<Todo[]>([])`, `useState<'all' | 'active' | 'completed'>('all')`, `useState(true)` (loading), `useState<string | null>(null)` (error)
- `useEffect` fetches todos on mount
- `handleAddTodo` calls `createTodo()` and appends to state
- Renders `<main className="app">` → `<h1>` → `<AddTodo>` → `<TodoList todos={todos}>`
- **MODIFY:** Add `handleToggle` and `handleDelete` handlers. Pass callbacks to `<TodoList>`.
- **PRESERVE:** All existing state, useEffect, handleAddTodo, render structure.

#### `frontend/src/components/TodoItem.tsx` — Current State
- Props: `{ todo: Todo }`
- Renders: `<li className="todo-item"><label className="todo-label">{todo.title}</label></li>`
- **MODIFY:** Add checkbox, delete button, onToggle/onDelete props, completed class modifier.
- **PRESERVE:** The `todo-item` class on `<li>`, the `todo-label` class on the label element, the `{todo.title}` text rendering.

#### `frontend/src/components/TodoList.tsx` — Current State
- Props: `{ todos: Todo[] }`
- Renders: `<ul className="todo-list">` mapping todos to `<TodoItem key={todo.id}>`
- **MODIFY:** Accept and pass through `onToggle` and `onDelete` callbacks.
- **PRESERVE:** The `todo-list` class, the mapping pattern, the `key={todo.id}`.

#### `frontend/src/api/todo-api.ts` — Current State
- Has `handleResponse<T>()`, `getTodos()`, `createTodo(title)`
- Base URL: `/api`
- **MODIFY:** Add `updateTodo()` and `deleteTodo()` functions.
- **PRESERVE:** All existing functions, `handleResponse` helper, `BASE_URL` constant.

#### `backend/src/db.ts` — Current State
- Has `initDatabase()`, `getDatabase()`, `getAllTodos()`, `getTodoById()`, `createTodo()`, `checkHealth()`
- Has `mapTodoRow()` for snake→camel mapping
- **MODIFY:** Add `updateTodo()` and `deleteTodo()` functions.
- **PRESERVE:** All existing functions, the `mapTodoRow` helper, `TodoRow` and `Todo` interfaces.

#### `backend/src/routes/todo-routes.ts` — Current State
- Has `GET /api/todos`, `POST /api/todos`, `GET /api/health`
- **MODIFY:** Add `PATCH /api/todos/:id` and `DELETE /api/todos/:id` routes.
- **PRESERVE:** All existing routes unchanged.

#### `backend/src/schemas/todo-schemas.ts` — Current State
- Has `createTodoSchema`, `getTodosSchema`, `healthSchema`
- **MODIFY:** Add `updateTodoSchema`, `deleteTodoSchema`. Consider extracting shared `todoResponseSchema` and `notFoundResponseSchema`.
- **PRESERVE:** All existing schemas unchanged (they are referenced by existing routes).

#### `frontend/src/App.css` — Current State (63 lines)
- Has all design tokens in `:root`, styles for `.app`, `.app-title`, `.add-todo`, `.add-todo-input`, `.todo-list`, `.todo-item`, `.todo-label`
- **MODIFY:** Add styles for `.todo-toggle`, `.todo-item--completed`, `.todo-destroy`, hover/mobile media queries.
- **PRESERVE:** All existing styles unchanged.

### UX Design Reference

**TodoItem layout (from UX spec):**
```
┌──────────────────────────────────────────┐
│ [○]  Todo text here                   [×] │  padding: 15px 15px 15px 60px
│  ↑                                    ↑   │
│  checkbox (40×40px)           delete btn   │
│  60px left zone              40×40px hit   │
└──────────────────────────────────────────┘
```

**Completed state:**
- Checkbox: filled/checked
- Text: `text-decoration: line-through`, `color: var(--color-completed)` (#d9d9d9)
- The reduced contrast is intentional — completed items are de-emphasized

**Delete button behavior:**
- Desktop (`@media (hover: hover)`): hidden by default, shown on `.todo-item:hover`
- Mobile (default / no hover): always visible
- Color: `var(--color-accent)` (#b83f45)
- Character: `×` (multiplication sign)
- Accessibility: `aria-label="Delete todo: {todo.title}"`

**Optimistic update pattern (from architecture):**
```typescript
const handleToggle = async (id: number, isCompleted: boolean) => {
  const snapshot = todos; // closure captures pre-mutation state
  setTodos(prev => prev.map(t => t.id === id ? { ...t, isCompleted } : t));
  try {
    await apiUpdateTodo(id, isCompleted);
  } catch {
    setTodos(snapshot); // rollback on failure
  }
};
```

### API Contract Reference

**PATCH /api/todos/:id**
- Request: `{ "isCompleted": true | false }`
- Success: `200 { id, title, isCompleted, createdAt }` (camelCase)
- Not found: `404 { statusCode: 404, error: "Not Found", message: "Todo not found" }`

**DELETE /api/todos/:id**
- Request: no body
- Success: `204` (no body)
- Not found: `404 { statusCode: 404, error: "Not Found", message: "Todo not found" }`

### Previous Story Intelligence

**From Story 1.2 review findings:**
- `handleAddTodo` has no try-catch — error handling deferred to Story 3.1. However, Story 2.1 introduces optimistic updates with rollback which **requires** try-catch. The `handleToggle` and `handleDelete` handlers MUST have try-catch for rollback. Do NOT add try-catch to `handleAddTodo` (that's Story 3.1's scope).
- Focus persistence test was needed — ensure new tests are thorough.

**From Story 1.1 patterns:**
- Backend tests use `app.inject()` pattern with Fastify's built-in test support
- DB tests use in-memory database (`:memory:`)
- Frontend tests use `@testing-library/react` with `userEvent.setup()` pattern
- The `makeTodo()` test helper in `TodoList.test.tsx` is reusable — import or replicate in new test files

### Testing Standards

- **Backend:** Vitest, tests in `backend/tests/`. Use `app.inject()` for route testing.
- **Frontend:** Vitest + @testing-library/react + @testing-library/user-event. Tests in `frontend/tests/`. Setup file imports jest-dom matchers.
- **Existing test counts:** Frontend: 11 tests (7 AddTodo + 4 TodoList), Backend: 19 tests (10 db + 9 routes)
- **New tests needed:** ~6 backend (db + routes), ~8 frontend (TodoItem + TodoList updates)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — PATCH returns 200 with updated entity, DELETE returns 204
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — Optimistic updates with closure-based snapshots
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component-to-Style Mapping] — `.todo-item`, `.todo-item--completed`, `.todo-toggle`, `.todo-label`, `.todo-destroy`
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Experience Mechanics] — Complete Todo and Delete Todo interaction patterns

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (Copilot)

### Completion Notes

All 9 tasks implemented and verified. 51 total tests passing (30 backend + 21 frontend), 0 regressions.

**Backend:** Added `updateTodo()` and `deleteTodo()` to db.ts. Extracted shared `todoResponseSchema` and `notFoundResponseSchema` for DRY schemas. Added `PATCH /api/todos/:id` (200/404) and `DELETE /api/todos/:id` (204/404) routes with full JSON Schema validation. 11 new backend tests (5 db + 6 routes).

**Frontend:** Added `updateTodo()` and `deleteTodo()` API functions. Updated TodoItem with checkbox, delete button (×), completed class modifier, and aria-label. Updated TodoList and App to pass callbacks. Implemented optimistic updates with closure-based rollback for toggle and delete. Added TodoMVC-style checkbox (custom SVG checkmark), hover-reveal delete on desktop, always-visible on mobile. 10 new frontend tests (9 TodoItem + 1 TodoList).

### Change Log

- 2026-04-27: Story 2.1 implementation complete — toggle, delete, optimistic updates, full CSS styling

### File List

**Modified:**
- backend/src/db.ts
- backend/src/schemas/todo-schemas.ts
- backend/src/routes/todo-routes.ts
- backend/tests/db.test.ts
- backend/tests/todo-routes.test.ts
- frontend/src/api/todo-api.ts
- frontend/src/components/TodoItem.tsx
- frontend/src/components/TodoList.tsx
- frontend/src/App.tsx
- frontend/src/App.css
- frontend/tests/TodoList.test.tsx

**Created:**
- frontend/tests/TodoItem.test.tsx
