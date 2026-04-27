# Story 3.1: Error Handling & Resilience

Status: ready-for-dev

## Story

As a **user**,
I want to be informed when something goes wrong and never lose data silently,
so that I can trust the app with my tasks.

## Acceptance Criteria (BDD)

1. **Given** I create, toggle, or delete a todo, **When** the API request fails (network error or server error), **Then** the optimistic UI change is rolled back to the pre-mutation state.

2. **Given** an API operation fails, **When** the error is caught, **Then** a plain text error message appears (e.g., "Could not save. Please try again.") below the input or above the list.

3. **Given** an error message is displayed, **When** ~3 seconds elapse, **Then** the error message auto-dismisses without user interaction.

4. **Given** the network is unavailable, **When** I attempt any CRUD operation, **Then** I see a text error message and no data is silently lost — the UI reflects the actual persisted state after rollback.

5. **Given** error feedback is implemented, **When** it renders, **Then** it is plain text only — no toasts, no colored banners, no modals.

## Requirements Covered

- **FRs:** FR13 (user informed of write failures), FR16 (error condition feedback), FR17 (network issue communication)
- **UX-DRs:** UX-DR10 (error feedback — plain text, auto-dismiss ~3s, below input or above list)

## Tasks / Subtasks

- [ ] **Task 1: Wire error state to UI in App.tsx** (AC: #2, #5)
  - [ ] 1.1: The `error` state (`useState<string | null>(null)`) already exists in App.tsx. Render it as `{error && <p className="error-message">{error}</p>}` between `<AddTodo>` and `<TodoList>`. This positions the message below input, above list per UX-DR10.
  - [ ] 1.2: Implement auto-dismiss — when `error` changes to a non-null value, start a `setTimeout` of 3000ms that calls `setError(null)`. Use a `useEffect` with cleanup (`clearTimeout`) to prevent stale timers. Dependency array: `[error]`.

- [ ] **Task 2: Set error messages in all catch blocks** (AC: #1, #2, #4)
  - [ ] 2.1: In `handleAddTodo` — the current implementation does NOT have optimistic update (it awaits the API and appends the result). Add a try/catch: on failure, call `setError('Could not add todo. Please try again.')`. The todo won't appear since it's not optimistic. No rollback needed.
  - [ ] 2.2: In `handleToggle` — the catch block already rolls back. Add `setError('Could not update todo. Please try again.')` in the catch.
  - [ ] 2.3: In `handleDelete` — the catch block already rolls back. Add `setError('Could not delete todo. Please try again.')` in the catch.
  - [ ] 2.4: In `handleClearCompleted` — the catch block already rolls back. Add `setError('Could not clear completed. Please try again.')` in the catch.
  - [ ] 2.5: In the `useEffect` fetch on mount — the catch block should set `setError('Could not load todos. Please try again.')` instead of or in addition to the current error handling.

- [ ] **Task 3: CSS for error message** (AC: #5)
  - [ ] 3.1: Add `.error-message` styles in `App.css`: `padding: 10px 15px` (matches footer padding), `color: var(--color-text)`, `font-size: var(--font-size-footer)` (14px), no background, no border, no colored banner. Just plain text per UX-DR10.

- [ ] **Task 4: Frontend tests — error display and auto-dismiss** (AC: all)
  - [ ] 4.1: Update `frontend/tests/App.test.tsx`:
    - Error message appears when createTodo API fails
    - Error message appears when updateTodo API fails (toggle)
    - Error message appears when deleteTodo API fails
    - Error message appears when deleteCompletedTodos API fails
    - Error message auto-dismisses after ~3 seconds (use `vi.useFakeTimers` / `vi.advanceTimersByTime(3000)`)
    - Error message not shown on successful operations
    - New error replaces previous error (only one error at a time)

## Dev Notes

### Architecture Compliance (MUST FOLLOW)

- **State management:** React `useState` only. No Redux, no Zustand, no context.
- **Optimistic updates:** Already implemented for toggle, delete, clear completed. `handleAddTodo` is NOT optimistic — it awaits the API before appending.
- **Styling:** Single global `App.css`. NO CSS-in-JS, NO styled-components, NO inline styles, NO CSS Modules.
- **Error feedback:** Plain text only — no toasts, no colored banners, no modals (UX-DR10).
- **No `any` type.** No `console.log`.

### Existing Code State (READ BEFORE IMPLEMENTING)

#### `frontend/src/App.tsx` — Current State
- State: `todos: Todo[]`, `filter: 'all' | 'active' | 'completed'`, `loading: boolean`, `error: string | null`
- **CRITICAL:** `error` state ALREADY EXISTS but is unused in the render. Wire it up — don't re-declare it.
- **CRITICAL:** `loading` state ALREADY EXISTS but is unused in the render. Do NOT touch it — Story 3.3 may use it.
- Has: `useEffect` (fetch on mount — has try/catch but doesn't set `error`), `handleAddTodo` (no try/catch currently), `handleToggle` (has try/catch with rollback), `handleDelete` (has try/catch with rollback), `handleClearCompleted` (has try/catch with rollback)
- Renders: `<main>` → `<h1>` → `<AddTodo>` → `<TodoList todos={filteredTodos}>` → conditional `<TodoFooter>`
- **MODIFY:** Add error rendering between AddTodo and TodoList, add useEffect for auto-dismiss timer, add setError calls in all catch blocks, wrap handleAddTodo in try/catch
- **PRESERVE:** All existing state variables, all existing handlers' optimistic logic, all imports, render structure, filtering logic, footer conditional

#### `frontend/src/App.css` — Current State (225 lines)
- Has all design tokens as CSS custom properties in `:root`
- Has styles for: `.app`, `.app-title`, `.add-todo*`, `.todo-list`, `.todo-item*`, `.todo-view`, `.todo-toggle*`, `.todo-label`, `.todo-destroy*`, `.todo-footer`, `.todo-count`, `.todo-filters`, `.filter--selected`, `.clear-completed`
- Has responsive media queries: `@media (hover: hover)` for delete hover, `@media (max-width: 430px)` for footer stacking
- **MODIFY:** Add `.error-message` class at the end (before responsive queries if positioning matters, or after — it's just text styling)
- **PRESERVE:** All existing styles

#### `frontend/tests/App.test.tsx` — Current State (8 tests)
- Mock setup: `getTodos`, `updateTodo`, `deleteTodo`, `deleteCompletedTodos` all mocked
- `beforeEach`: clears mocks, sets default mock returns
- describe blocks: "App optimistic rollback" (2 tests), "App footer visibility" (2 tests), "App filtering" (2 tests), "App clear completed" (2 tests)
- **MODIFY:** Add `createTodo` mock usage. Add new describe block for error handling tests.
- **PRESERVE:** All existing tests and mock setup

#### `frontend/src/api/todo-api.ts` — Current State
- Has: `ApiError` interface (`{ statusCode, error, message }`), `handleResponse<T>()`, `getTodos()`, `createTodo()`, `updateTodo()`, `deleteTodo()`, `deleteCompletedTodos()`
- Error pattern: `handleResponse` throws `ApiError` on non-ok responses. Network failures throw native `TypeError`.
- **NO CHANGES NEEDED** — the API layer already throws proper errors. App.tsx catch blocks just need to set error state.

#### Backend — NO CHANGES NEEDED
- Backend routes already return proper error responses (400, 404, 500 via Fastify)
- Backend tests already cover error responses
- No new endpoints, schemas, or db functions needed for this story

### handleAddTodo — Special Case

Unlike toggle/delete/clear, `handleAddTodo` is NOT optimistic. Current implementation:
```typescript
const handleAddTodo = async (title: string) => {
  const todo = await createTodo(title);
  setTodos((prev) => [...prev, todo]);
};
```
This needs a try/catch wrapper, but NO rollback since nothing was optimistically added. On error, just `setError(...)`.

### Auto-Dismiss Pattern

```typescript
useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }
}, [error]);
```

This ensures:
- Timer starts when error is set
- Previous timer is cleaned up if a new error arrives (React re-runs effect)
- Timer is cleaned up on unmount
- Only runs when error changes

### Error Message Copy

Per UX spec: "Functional, never cute." Examples:
- Create fails: "Could not add todo. Please try again."
- Toggle fails: "Could not update todo. Please try again."
- Delete fails: "Could not delete todo. Please try again."
- Clear completed fails: "Could not clear completed. Please try again."
- Fetch fails: "Could not load todos. Please try again."

### Previous Story Learnings (from Stories 2.1 & 2.2)

1. **Optimistic update pattern is established** — capture snapshot, mutate, try API call, catch rollback. This story adds `setError()` to the existing catch blocks.
2. **Test patterns established** — `vi.fn()` for callbacks, `vi.mocked()` for API mocks, `userEvent.setup()` for interactions, `waitFor` for async assertions.
3. **Code review lesson** — Include all error scenario tests from the start.
4. **Schema `required` field** — Remember to include `required` in any new schemas (N/A for this story, no new schemas).

### What This Story Does NOT Cover

- Loading states / loading indicators (initial page load is already fast enough)
- Error boundaries (React error boundary component)
- Retry mechanisms (user can manually retry by re-doing the action)
- Aria-live regions for error announcements (Story 3.2 covers accessibility)
- Backend error handling changes (already complete)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.1]
- [Source: _bmad-output/planning-artifacts/architecture.md — Error Handling: try/catch in API functions → throw typed errors → component catches and rolls back]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR10: Error Feedback]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Interaction Patterns: Error → Text message, auto-dismiss ~3s]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes

Story context engine analysis completed — comprehensive developer guide created. Error state already exists in App.tsx (unused), all rollback catch blocks already exist. This story wires the error state to UI, adds setError calls, and implements auto-dismiss.

### File List

### Debug Log References
