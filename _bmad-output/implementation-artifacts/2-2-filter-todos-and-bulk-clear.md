# Story 2.2: Filter Todos & Bulk Clear

Status: done

## Story

As a **user**,
I want to filter my todo list by status and clear all completed items at once,
so that I can focus on what's left and clean up efficiently.

## Acceptance Criteria (BDD)

1. **Given** at least one todo exists (active or completed), **When** the list is displayed, **Then** a footer appears with: item count ("{n} items left" / "{n} item left" counting active only), three filter tabs (All / Active / Completed), and a "Clear completed" button (visible only when ≥1 completed todo exists).

2. **Given** the footer is visible, **When** I click "Active" filter tab, **Then** only incomplete todos are shown, and the "Active" tab has `.filter--selected` styling.

3. **Given** the footer is visible, **When** I click "Completed" filter tab, **Then** only completed todos are shown, and the "Completed" tab has `.filter--selected` styling.

4. **Given** the footer is visible, **When** I click "All" filter tab, **Then** all todos are shown (default state on page load).

5. **Given** all todos are filtered out (e.g., "Active" with all completed), **When** the list is empty due to the filter, **Then** the list area is empty but the footer remains visible with count and filter tabs.

6. **Given** completed todos exist, **When** I click "Clear completed", **Then** all completed todos are removed from the list and deleted via the API. Active todos are unaffected.

7. **Given** no completed todos exist, **When** the footer is displayed, **Then** the "Clear completed" button is hidden.

8. **Given** no todos exist at all (all deleted or cleared), **When** the last todo is removed, **Then** the footer disappears entirely — returning to the empty state (title + input only).

9. **Given** filtering is client-side, **When** `GET /api/todos` returns all todos, **Then** the App component filters the array before passing to TodoList based on the active filter state.

## Requirements Covered

- **FRs:** FR6 (bulk clear), FR7 (view completed via filter)
- **UX-DRs:** UX-DR4 (TodoList receives pre-filtered array), UX-DR5 (TodoFooter — count, filters, clear completed)

## Tasks / Subtasks

- [x] **Task 1: Backend — add `deleteCompletedTodos` to db.ts** (AC: #6)
  - [x] 1.1: Add `deleteCompletedTodos(): number` — `DELETE FROM todos WHERE is_completed = 1`, return `result.changes` (count of deleted rows)
  - [x] 1.2: Add unit tests in `backend/tests/db.test.ts`: deleteCompletedTodos removes only completed, returns count, leaves active untouched, returns 0 when no completed exist

- [x] **Task 2: Backend — add DELETE /api/todos/completed route** (AC: #6)
  - [x] 2.1: Add `deleteCompletedTodosSchema` to `backend/src/schemas/todo-schemas.ts` — response 200: `{ deleted: integer }`, no params or body
  - [x] 2.2: Add `DELETE /api/todos/completed` route in `backend/src/routes/todo-routes.ts` — call `deleteCompletedTodos()`, return `{ deleted: count }` with 200. IMPORTANT: Register this route BEFORE `DELETE /api/todos/:id` so Fastify doesn't match "completed" as an `:id` param
  - [x] 2.3: Add route tests in `backend/tests/todo-routes.test.ts`: DELETE /api/todos/completed removes completed todos, returns count, leaves active todos, returns `{ deleted: 0 }` when none completed

- [x] **Task 3: Frontend — add `deleteCompletedTodos` to todo-api.ts** (AC: #6)
  - [x] 3.1: Add `deleteCompletedTodos(): Promise<{ deleted: number }>` — `DELETE /api/todos/completed`, use `handleResponse`

- [x] **Task 4: Frontend — create TodoFooter component** (AC: #1, #2, #3, #4, #5, #7)
  - [x] 4.1: Create `frontend/src/components/TodoFooter.tsx` with props: `{ activeCount: number; completedCount: number; filter: 'all' | 'active' | 'completed'; onFilterChange: (filter: 'all' | 'active' | 'completed') => void; onClearCompleted: () => void }`
  - [x] 4.2: Render `<footer className="todo-footer">` containing:
    - `<span className="todo-count">`: "{n} items left" / "{n} item left" (singular when activeCount === 1)
    - `<ul className="todo-filters" role="navigation" aria-label="Filter todos">` with three `<li>` children each containing a `<button>` for All / Active / Completed. Active filter button gets `className="filter--selected"`.
    - `<button className="clear-completed">Clear completed</button>` — only rendered when `completedCount > 0`

- [x] **Task 5: Frontend — update App.tsx with filtering and clear completed** (AC: #1, #5, #6, #8, #9)
  - [x] 5.1: Import `deleteCompletedTodos as apiDeleteCompleted` from `./api/todo-api` and `TodoFooter` from `./components/TodoFooter`
  - [x] 5.2: Derive `filteredTodos` from `todos` and `filter` state: 'all' → all, 'active' → `!isCompleted`, 'completed' → `isCompleted`. Pass `filteredTodos` to `<TodoList>`.
  - [x] 5.3: Derive `activeCount` and `completedCount` from `todos` (not filtered — counts always reflect full list)
  - [x] 5.4: Implement `handleClearCompleted()` — capture snapshot, optimistically filter out completed todos from state, call `apiDeleteCompleted()`. On failure: rollback to snapshot.
  - [x] 5.5: Render `<TodoFooter>` below `<TodoList>` only when `todos.length > 0`. Pass `activeCount`, `completedCount`, `filter`, `onFilterChange={setFilter}`, `onClearCompleted={handleClearCompleted}`.

- [x] **Task 6: Frontend — CSS for TodoFooter** (AC: #1, #2, #3, #4, #7)
  - [x] 6.1: Style `.todo-footer` — `padding: var(--spacing-footer-padding)`, `display: flex`, `align-items: center`, `justify-content: space-between`, `font-size: var(--font-size-footer)`, `color: #777` (darkened from `#999` per UX-DR11 WCAG compliance), `border-top: 1px solid var(--color-border)`
  - [x] 6.2: Style `.todo-count` — no special styling, inherits footer font
  - [x] 6.3: Style `.todo-filters` — `list-style: none`, `margin: 0`, `padding: 0`, `display: flex`, `gap: 4px`. Filter buttons: no background, no border, `padding: 3px 7px`, `cursor: pointer`, `border-radius: 3px`, `border: 1px solid transparent`
  - [x] 6.4: Style `.filter--selected` — `border-color: var(--color-selection)` (the rgba red tint)
  - [x] 6.5: Style `.clear-completed` — no background, no border, `cursor: pointer`, `color: inherit`. On hover: `text-decoration: underline`
  - [x] 6.6: Responsive: add `@media (max-width: 430px)` for narrow mobile — flex-wrap the footer so count/filters/clear stack vertically. Ensure filter tab touch targets are ≥ 44px height via padding.

- [x] **Task 7: Frontend tests** (AC: all)
  - [x] 7.1: Create `frontend/tests/TodoFooter.test.tsx`:
    - Renders item count with correct singular/plural ("1 item left" vs "3 items left")
    - Shows all three filter buttons
    - Selected filter has `.filter--selected` class
    - Clicking filter calls onFilterChange with correct value
    - "Clear completed" button visible when completedCount > 0
    - "Clear completed" button hidden when completedCount === 0
    - Clicking "Clear completed" calls onClearCompleted
    - Has `role="navigation"` and `aria-label="Filter todos"` on filter list
  - [x] 7.2: Update `frontend/tests/App.test.tsx`:
    - Footer appears when todos exist
    - Footer hidden when no todos
    - Filtering shows correct subset (active filter hides completed, completed filter hides active)
    - Clear completed removes completed todos optimistically
    - Clear completed rolls back on API failure

## Dev Notes

### Architecture Compliance (MUST FOLLOW)

- **State management:** React `useState` only. No Redux, no Zustand, no context.
- **Optimistic updates:** Fire-and-forget with closure-based snapshots for clear completed. (AR5)
- **Filtering:** Client-side only. `GET /api/todos` returns ALL todos. App filters before passing to TodoList. (Architecture decision: "Filtering — Client-side only")
- **Styling:** Single global `App.css`. NO CSS-in-JS, NO styled-components, NO inline styles, NO CSS Modules.
- **Components:** Flat in `frontend/src/components/`. PascalCase files.
- **CSS classes:** `kebab-case` with BEM-lite modifiers: `.filter--selected`, `.clear-completed`
- **API validation:** Fastify JSON Schema on ALL route definitions.
- **DB access:** All SQLite queries in `backend/src/db.ts` only.
- **Field mapping:** `snake_case` DB → `camelCase` JSON in `mapTodoRow()`.
- **No `any` type.** No `console.log`.

### Existing Code State (READ BEFORE IMPLEMENTING)

#### `frontend/src/App.tsx` — Current State
- State: `todos: Todo[]`, `filter: 'all' | 'active' | 'completed'`, `loading: boolean`, `error: string | null`
- Note: `filter` state ALREADY EXISTS but is unused. Wire it up — don't re-declare it.
- Has: `useEffect` (fetch on mount), `handleAddTodo`, `handleToggle`, `handleDelete`
- Renders: `<main>` → `<h1>` → `<AddTodo>` → `<TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />`
- **MODIFY:** Add filtering logic, `handleClearCompleted`, derive counts, conditionally render `<TodoFooter>`. Change `<TodoList todos={todos}` to `<TodoList todos={filteredTodos}`.
- **PRESERVE:** All existing state, handlers, imports, render structure. Do NOT remove the `loading` or `error` state even though they're not fully wired yet (Story 3.1 will use them).

#### `frontend/src/components/TodoList.tsx` — Current State
- Props: `{ todos: Todo[]; onToggle; onDelete }`
- Renders `<ul className="todo-list">` mapping todos
- **NO CHANGES NEEDED.** TodoList receives pre-filtered array from App.

#### `frontend/src/api/todo-api.ts` — Current State
- Has: `handleResponse<T>()`, `getTodos()`, `createTodo()`, `updateTodo()`, `deleteTodo()`
- **MODIFY:** Add `deleteCompletedTodos()`.
- **PRESERVE:** All existing functions.

#### `backend/src/db.ts` — Current State
- Has: `initDatabase()`, `getDatabase()`, `getAllTodos()`, `getTodoById()`, `createTodo()`, `checkHealth()`, `updateTodo()`, `deleteTodo()`, `mapTodoRow()`
- **MODIFY:** Add `deleteCompletedTodos()`.
- **PRESERVE:** All existing functions.

#### `backend/src/routes/todo-routes.ts` — Current State
- Has: `GET /api/todos`, `POST /api/todos`, `GET /api/health`, `PATCH /api/todos/:id`, `DELETE /api/todos/:id`
- **MODIFY:** Add `DELETE /api/todos/completed`. Register BEFORE the `DELETE /api/todos/:id` route so "completed" doesn't match as `:id`.
- **PRESERVE:** All existing routes.

#### `backend/src/schemas/todo-schemas.ts` — Current State
- Has shared: `todoResponseSchema`, `notFoundResponseSchema`, `todoParamsSchema`
- Has exports: `createTodoSchema`, `getTodosSchema`, `healthSchema`, `updateTodoSchema`, `deleteTodoSchema`
- **MODIFY:** Add `deleteCompletedTodosSchema`.
- **PRESERVE:** All existing schemas.

#### `frontend/src/App.css` — Current State (155 lines)
- Has all design tokens, styles for `.app`, `.app-title`, `.add-todo*`, `.todo-list`, `.todo-item*`, `.todo-view`, `.todo-toggle*`, `.todo-label`, `.todo-destroy*`, hover media query
- **MODIFY:** Add footer styles (`.todo-footer`, `.todo-count`, `.todo-filters`, `.filter--selected`, `.clear-completed`) and narrow mobile responsive rule.
- **PRESERVE:** All existing styles.

### UX Design Reference

**Footer layout (from UX spec):**
```
┌──────────────────────────────────────────┐
│ 2 items left    All | Active | Comp    Clear completed │
│ ← count         ← filters (centered)    ← clear btn → │
│                                                        │
│ padding: 10px 15px                                     │
│ font-size: 14px                                        │
│ color: #777 (darkened from #999 per UX-DR11)          │
└──────────────────────────────────────────┘
```

**Footer visibility rules:**
- **No todos at all** → footer hidden entirely
- **Only active todos** → footer visible, "Clear completed" hidden
- **Has completed todos** → footer visible, "Clear completed" visible
- **All filtered out** → list empty but footer stays visible

**Filter tabs:**
- Default on page load: "All"
- Selected state: `.filter--selected` — border with `var(--color-selection)` (rgba red tint)
- Use `<button>` elements (NOT `<a>` tags — no URL routing, no hash changes)
- Filter list: `role="navigation"`, `aria-label="Filter todos"`

**Item count:**
- Counts ACTIVE (uncompleted) todos only
- Singular: "1 item left", Plural: "{n} items left"

**Clear completed:**
- Text button: "Clear completed"
- No confirmation dialog — prior completions are implicit confirmation (UX principle: "Prior actions are confirmation")
- Hover: underline

**Color note:** Footer text should use `#777` (not the `--color-text-muted: #999`) to meet WCAG AA 4.5:1 contrast at 14px font size. This was flagged in the UX spec (UX-DR11).

### Previous Story Learnings (from Story 2.1)

1. **Schema DRY refactoring worked well** — shared `todoResponseSchema` and `notFoundResponseSchema` objects. Continue this pattern for new schemas.
2. **Optimistic update pattern is established** — capture snapshot, mutate, try API call, catch rollback. Reuse exact same pattern for clear completed.
3. **CSS absolute positioning within relative `.todo-item`** works correctly. Footer can use simple flexbox since it's not inside `.todo-item`.
4. **Test patterns established** — `vi.fn()` for callbacks, `vi.mocked()` for API mocks, `userEvent.setup()` for interactions, `waitFor` for async assertions.
5. **Code review found missing rollback tests** — include rollback test for `handleClearCompleted` from the start.

### Critical Implementation Notes

1. **Route ordering matters:** `DELETE /api/todos/completed` MUST be registered before `DELETE /api/todos/:id`. If `:id` route comes first, Fastify will try to parse "completed" as an integer ID and fail with a schema validation error. Move the new route registration to before the existing DELETE route.
2. **`filter` state already exists** in App.tsx — don't create a duplicate. Just wire up the existing `setFilter` as the `onFilterChange` callback.
3. **Counts derive from `todos` (unfiltered), not `filteredTodos`.** `activeCount = todos.filter(t => !t.isCompleted).length`. This ensures the footer always shows the true count regardless of which filter is active.
4. **TodoList needs NO changes.** It already accepts a `todos` array — just pass the filtered subset from App.

### API Contract Reference

**DELETE /api/todos/completed**
- Request: No body, no params
- Success: `200 { deleted: <count> }` — count of removed todos
- This is NOT 204 (unlike individual delete) because we return the count

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture: Filtering — Client-side only]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Component Strategy: TodoFooter]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Responsive Design & Accessibility]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX Consistency Patterns: Button Hierarchy]

### Review Findings

- [x] [Review][Patch] Missing `required` in deleteCompletedTodosSchema [backend/src/schemas/todo-schemas.ts:97] — Schema should include `required: ['deleted']` for correctness
- [x] [Review][Patch] `!important` on `.filter--selected` avoidable with better selector [frontend/src/App.css:~195] — Use `.todo-filters button.filter--selected` instead of bare `.filter--selected` to avoid `!important`
- [x] [Review][Defer] No aria-live announcement when footer disappears [frontend/src/App.tsx] — deferred, Story 3.2 covers accessibility

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes

All 7 tasks implemented and tested. 75 total tests passing (36 backend + 39 frontend). Key decisions: DELETE /api/todos/completed route registered before :id route to prevent param matching conflict. Footer uses #777 text color for WCAG AA compliance. Existing filter state in App.tsx wired up (not re-declared). Client-side filtering derives filteredTodos before passing to TodoList. Clear completed uses same optimistic snapshot/rollback pattern as toggle and delete.

### File List

- backend/src/db.ts (modified — added deleteCompletedTodos)
- backend/src/schemas/todo-schemas.ts (modified — added deleteCompletedTodosSchema)
- backend/src/routes/todo-routes.ts (modified — added DELETE /api/todos/completed route)
- backend/tests/db.test.ts (modified — added 3 deleteCompletedTodos tests)
- backend/tests/todo-routes.test.ts (modified — added 3 DELETE /api/todos/completed tests)
- frontend/src/api/todo-api.ts (modified — added deleteCompletedTodos function)
- frontend/src/components/TodoFooter.tsx (new — footer component)
- frontend/src/App.tsx (modified — filtering, clear completed, TodoFooter rendering)
- frontend/src/App.css (modified — footer styles + responsive)
- frontend/tests/TodoFooter.test.tsx (new — 10 tests)
- frontend/tests/App.test.tsx (modified — added 6 tests for footer, filtering, clear completed)
