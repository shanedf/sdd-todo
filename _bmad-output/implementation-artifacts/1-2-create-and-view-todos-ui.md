# Story 1.2: Create & View Todos UI

Status: done

## Story

As a **user**,
I want to open the app, create todos by typing and pressing Enter, and see them displayed and persisted,
so that I can quickly capture and review my tasks.

## Acceptance Criteria (BDD)

1. **Given** I open the app for the first time, **When** the page loads, **Then** I see a centered card (`max-width: 550px`) with a large thin "todos" title (`80px`, weight `100`), a text input with placeholder "What needs to be done?" that is auto-focused, and no footer.

2. **Given** CSS custom properties are defined, **When** the app renders, **Then** design tokens for colors, typography, spacing, and effects match the UX design specification (`:root` variables).

3. **Given** I type "Buy groceries" in the input, **When** I press Enter, **Then** the todo appears in the list below the input, the input is cleared, focus remains on the input, and the todo is persisted via `POST /api/todos`.

4. **Given** I press Enter with empty or whitespace-only input, **When** the form attempts to submit, **Then** nothing happens — no todo is created, no error is shown.

5. **Given** I type a very long todo title (up to 500 characters), **When** it renders in the list, **Then** the text wraps gracefully without breaking the layout.

6. **Given** I have added several todos, **When** I refresh the browser, **Then** all todos are still displayed (fetched via `GET /api/todos`).

7. **Given** no todos exist, **When** the page loads, **Then** I see only the title and input field — no footer, no empty state message beyond the placeholder.

## Requirements Covered

- **FRs:** FR1, FR2, FR9, FR10, FR11, FR12, FR15
- **ARs:** AR5 (useState, partial — optimistic updates deferred to Story 3.1)
- **UX-DRs:** UX-DR1, UX-DR2, UX-DR6, UX-DR7

## Tasks / Subtasks

- [x] **Task 1: Replace Vite template with app shell** (AC: #1, #7)
  - [x] 1.1: Replace `frontend/src/App.tsx` — remove all Vite template content, create `App` component with todos state (`useState<Todo[]>([])`), filter state (default `'all'`), loading state, and error state
  - [x] 1.2: Replace `frontend/src/App.css` — remove all Vite template styles, replace with complete `app.css` containing all design tokens and application styles
  - [x] 1.3: Replace `frontend/src/index.css` — remove Vite template global styles, replace with minimal reset (`body { margin: 0; }` and font-family)
  - [x] 1.4: Clean up unused Vite assets — remove `frontend/src/assets/` directory (contains react.svg, vite.svg, hero.png)
  - [x] 1.5: Update `frontend/index.html` — change `<title>` to "sdd-todo"

- [x] **Task 2: Create AddTodo component** (AC: #3, #4)
  - [x] 2.1: Create `frontend/src/components/AddTodo.tsx`
  - [x] 2.2: Implement `<form>` with `<input type="text">`, placeholder "What needs to be done?"
  - [x] 2.3: `autoFocus` on input
  - [x] 2.4: On Enter/submit: trim input, reject empty/whitespace, call `onAdd(title)` prop, clear input
  - [x] 2.5: Props: `onAdd: (title: string) => void`

- [x] **Task 3: Create TodoItem component** (AC: #5)
  - [x] 3.1: Create `frontend/src/components/TodoItem.tsx`
  - [x] 3.2: Render `<li>` with `<label>` containing todo title text
  - [x] 3.3: Long text wraps gracefully (`word-break: break-word`)
  - [x] 3.4: Props: `todo: Todo` (checkbox toggle and delete wired in Story 2.1)

- [x] **Task 4: Create TodoList component** (AC: #3, #5)
  - [x] 4.1: Create `frontend/src/components/TodoList.tsx`
  - [x] 4.2: Render `<ul className="todo-list">` mapping over `todos` array
  - [x] 4.3: Render `<TodoItem>` for each todo with `key={todo.id}`
  - [x] 4.4: Props: `todos: Todo[]`

- [x] **Task 5: Wire App state and API integration** (AC: #3, #4, #6, #7)
  - [x] 5.1: In `App.tsx`, on mount (`useEffect`), fetch todos via `getTodos()` and set state
  - [x] 5.2: Implement `handleAddTodo(title)` — call `createTodo(title)` API, append returned todo to state
  - [x] 5.3: Render `<AddTodo onAdd={handleAddTodo} />`
  - [x] 5.4: Render `<TodoList todos={todos} />` (only when todos.length > 0, but list area always present)
  - [x] 5.5: Add Vite proxy config for dev mode: proxy `/api` to `http://localhost:3000`

- [x] **Task 6: Design tokens and complete CSS** (AC: #1, #2, #5)
  - [x] 6.1: Define all CSS custom properties in `:root` in `App.css` matching UX spec tokens
  - [x] 6.2: Style `.app` container — centered, `max-width: 550px`, app shadow
  - [x] 6.3: Style `.app-title` — `80px`, weight `100`, `color: rgba(175, 47, 47, 0.15)`
  - [x] 6.4: Style `.add-todo` / `.add-todo-input` — `24px` font, `16px 16px 16px 60px` padding, `#ededed` bottom border
  - [x] 6.5: Style `.todo-list` — no padding, no list-style
  - [x] 6.6: Style `.todo-item` — `15px 15px 15px 60px` padding, `#ededed` border-bottom, `24px` font
  - [x] 6.7: Long text: `word-break: break-word` on `.todo-label`

- [x] **Task 7: Frontend tests** (AC: all)
  - [x] 7.1: Create `frontend/tests/AddTodo.test.tsx` — test form submission, empty input rejection, input clearing
  - [x] 7.2: Create `frontend/tests/TodoList.test.tsx` — test rendering todos, empty list
  - [x] 7.3: Install `@testing-library/react` and `@testing-library/jest-dom` and `jsdom` dev deps

### Review Findings

- [x] [Review][Patch] Missing test: focus persistence after submit — AC #3 requires "focus remains on the input" after Enter. Test added. [frontend/tests/AddTodo.test.tsx]
- [x] [Review][Defer] `handleAddTodo` has no try-catch for createTodo rejection [frontend/src/App.tsx:22] — deferred, pre-existing design decision (error handling deferred to Story 3.1)

## Dev Notes

### Architecture Compliance (MUST FOLLOW)

- **State management:** React `useState` only. No Redux, no Zustand, no context.
- **Styling:** Single global `App.css` file with CSS custom properties. NO CSS-in-JS, NO styled-components, NO inline styles, NO CSS Modules.
- **Components:** Flat in `frontend/src/components/`. PascalCase files: `AddTodo.tsx`, `TodoItem.tsx`, `TodoList.tsx`.
- **CSS classes:** `kebab-case` — `.todo-item`, `.add-todo-input`, `.app-title`
- **Types:** Import `Todo` from `../types/todo` (already created in Story 1.1)
- **API:** Import from `../api/todo-api` (already created in Story 1.1)
- **No routing:** Single page, single view. No React Router.
- **XSS protection:** React's default JSX escaping. Never use `dangerouslySetInnerHTML`.

### Existing Files from Story 1.1 (DO NOT RECREATE)

- `frontend/src/types/todo.ts` — `Todo`, `CreateTodoInput`, `ApiError` interfaces
- `frontend/src/api/todo-api.ts` — `getTodos()`, `createTodo(title)` fetch wrappers, base URL `/api`
- `backend/src/routes/todo-routes.ts` — `POST /api/todos` (201), `GET /api/todos` (200)
- `backend/src/schemas/todo-schemas.ts` — `createTodoSchema` (title: string, minLength:1, maxLength:500)

### Files to CREATE

| File | Purpose |
|---|---|
| `frontend/src/components/AddTodo.tsx` | Form with input, onAdd prop |
| `frontend/src/components/TodoItem.tsx` | Single todo row (text only for now — toggle/delete wired in Story 2.1) |
| `frontend/src/components/TodoList.tsx` | `<ul>` rendering TodoItem children |
| `frontend/tests/AddTodo.test.tsx` | Unit tests for AddTodo |
| `frontend/tests/TodoList.test.tsx` | Unit tests for TodoList |

### Files to MODIFY

| File | What Changes |
|---|---|
| `frontend/src/App.tsx` | REPLACE completely — remove Vite template, implement app shell with state and API integration |
| `frontend/src/App.css` | REPLACE completely — remove Vite template styles, add design tokens and all app styles |
| `frontend/src/index.css` | REPLACE completely — minimal reset only |
| `frontend/index.html` | Change `<title>` to "sdd-todo" |
| `frontend/vite.config.ts` | Add proxy config: `/api` → `http://localhost:3000` |

### Files to DELETE

| File/Directory | Reason |
|---|---|
| `frontend/src/assets/` | Vite template assets (react.svg, vite.svg, hero.png) — not used |

### Design Token Reference (from UX Spec)

```css
:root {
  /* Colors */
  --color-bg: #ffffff;
  --color-text: #333333;
  --color-text-muted: #999999;
  --color-border: #ededed;
  --color-accent: #b83f45;
  --color-completed: #d9d9d9;
  --color-selection: rgba(175, 47, 47, 0.15);

  /* Typography */
  --font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-size-title: 80px;
  --font-size-input: 24px;
  --font-size-item: 24px;
  --font-size-footer: 14px;

  /* Spacing */
  --spacing-item-padding: 15px;
  --spacing-footer-padding: 10px 15px;

  /* Effects */
  --shadow-app: 0 2px 4px rgba(0, 0, 0, 0.2), 0 25px 50px rgba(0, 0, 0, 0.1);
  --checkbox-size: 40px;
}
```

### Layout Spec (from UX Spec)

```
┌─────────────────────────────────┐
│         "todos" (title)          │  color: rgba(175, 47, 47, 0.15), 80px, weight 100
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │  What needs to be done?   │  │  padding: 16px 16px 16px 60px, font: 24px/300
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │    Buy groceries          │  │  padding: 15px 15px 15px 60px, font: 24px/400
│  ├───────────────────────────┤  │  border-bottom: 1px solid #ededed
│  │    Review PR              │  │
│  └───────────────────────────┘  │
│  (footer hidden until Story 2.2)│
└─────────────────────────────────┘
```

- App container: `max-width: 550px`, centered with `margin: 0 auto`
- App shadow: `0 2px 4px rgba(0,0,0,0.2), 0 25px 50px rgba(0,0,0,0.1)`
- Checkbox column: 60px left padding reserved (checkbox added in Story 2.1)
- Page background: `#f5f5f5` (light gray behind the card)

### Scope Boundaries (Story 1.2 ONLY)

**IN SCOPE:**
- App shell, AddTodo, TodoList, TodoItem (display only)
- CSS design tokens and layout styles
- Fetch todos on mount, create todo on Enter
- Empty state (title + input only)

**OUT OF SCOPE (later stories):**
- Checkbox toggle → Story 2.1
- Delete button → Story 2.1
- TodoFooter (filters, count, clear) → Story 2.2
- Optimistic updates with rollback → Story 3.1
- Error messages → Story 3.1
- Responsive breakpoints → Story 3.2
- Accessibility ARIA attributes → Story 3.2

### Previous Story Intelligence (Story 1.1)

- Vite 8.0.10 scaffolded with `react-ts` template — current App.tsx/App.css are Vite defaults that must be completely replaced
- Backend uses `type: "module"` with `.js` extensions in imports
- Backend tests use Vitest with `vitest.config.ts` — frontend should follow same pattern
- `@fastify/static` serves `frontend/dist/` conditionally (only if dir exists) — dev mode needs Vite proxy
- API returns camelCase JSON: `{ id, title, isCompleted, createdAt }`

### API Contract (for this story)

| Method | Endpoint | Request | Response |
|---|---|---|---|
| `GET` | `/api/todos` | — | 200: `Todo[]` |
| `POST` | `/api/todos` | `{ "title": "string" }` | 201: `{ id, title, isCompleted, createdAt }` |

### Component-to-CSS Class Mapping

| Component | CSS Classes |
|---|---|
| `App` | `.app`, `.app-title` |
| `AddTodo` | `.add-todo`, `.add-todo-input` |
| `TodoList` | `.todo-list` |
| `TodoItem` | `.todo-item`, `.todo-label` |

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Design System Foundation, Design Tokens, Component Specifications (AddTodo, TodoList), Spacing & Layout Foundation]
- [Source: _bmad-output/planning-artifacts/architecture.md — Frontend Architecture, Naming Conventions, Structure Conventions, Enforcement Rules]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 1: Story 1.2 acceptance criteria]
- [Source: _bmad-output/implementation-artifacts/1-1-project-setup-api-foundation.md — Dev Notes, API Contract]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Completion Notes List

- Replaced entire Vite template (App.tsx, App.css, index.css) with todo app shell
- Deleted `frontend/src/assets/` directory (Vite template images)
- Changed page title to "sdd-todo"
- Created 3 components: AddTodo, TodoItem, TodoList in `frontend/src/components/`
- App.tsx wired with useState for todos/filter/loading/error, useEffect for initial fetch, handleAddTodo
- All design tokens from UX spec implemented as CSS custom properties in App.css
- Layout matches spec: centered 550px card, 80px thin title, 24px input/items, 60px left padding
- Vite proxy configured: `/api` → `http://localhost:3000` for dev mode
- Installed test deps: @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom, vitest
- Created vitest config with jsdom environment and setup file
- 10 frontend tests pass (6 AddTodo + 4 TodoList)
- 19 backend tests pass (no regressions)
- TypeScript compiles clean (both frontend and backend)

### File List

**Created:**
- `frontend/src/components/AddTodo.tsx`
- `frontend/src/components/TodoItem.tsx`
- `frontend/src/components/TodoList.tsx`
- `frontend/tests/setup.ts`
- `frontend/tests/AddTodo.test.tsx`
- `frontend/tests/TodoList.test.tsx`

**Modified:**
- `frontend/src/App.tsx` (replaced completely)
- `frontend/src/App.css` (replaced completely)
- `frontend/src/index.css` (replaced completely)
- `frontend/index.html` (title changed)
- `frontend/vite.config.ts` (added proxy + vitest config)
- `frontend/package.json` (added test script + test deps)

**Deleted:**
- `frontend/src/assets/` (react.svg, vite.svg, hero.png)
