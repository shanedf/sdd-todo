# Story 3.2: Responsive Design & Accessibility

Status: ready-for-dev

## Story

As a **user**,
I want the app to work perfectly on my phone and be fully keyboard-navigable,
so that I can use it on any device and with any input method.

## Acceptance Criteria (BDD)

1. **Given** a viewport below 550px, **When** the app renders, **Then** the container is full-width with `16px` side padding, delete × buttons are always visible, and all touch targets are ≥ 44×44px.

2. **Given** a viewport ≥ 550px, **When** the app renders, **Then** the container is centered with `max-width: 550px` and delete buttons appear on hover only (via `@media (hover: hover)`).

3. **Given** the footer on a narrow mobile viewport, **When** content doesn't fit a single row, **Then** it stacks vertically: count → filters → clear completed.

4. **Given** the app is loaded, **When** I inspect the HTML structure, **Then** it uses semantic landmarks: `<main>`, `<form>`, `<ul>`, `<li>`, `<label>`, `<button>`, `<footer>`.

5. **Given** a delete button exists, **When** a screen reader encounters it, **Then** it reads `aria-label="Delete todo: {title}"`.

6. **Given** the filter list in the footer, **When** a screen reader encounters it, **Then** it has `role="navigation"` and `aria-label="Filter todos"`.

7. **Given** the app is loaded, **When** I navigate using only Tab, Shift+Tab, Enter, and Space, **Then** I can create a todo, toggle completion, delete a todo, switch filters, and clear completed — in natural tab order.

8. **Given** a keyboard user is navigating, **When** an element receives focus, **Then** a visible focus indicator is displayed (browser default, never suppressed).

9. **Given** the footer text is rendered at 14px, **When** I check its color, **Then** it uses `#777` or darker (not `#999`) to meet WCAG AA 4.5:1 contrast ratio.

## Requirements Covered

- **FRs:** FR18 (responsive desktop and mobile), FR19 (keyboard navigation)
- **UX-DRs:** UX-DR8 (responsive strategy), UX-DR9 (accessibility), UX-DR11 (footer text contrast)

## Tasks / Subtasks

- [ ] **Task 1: Add responsive breakpoint for mobile full-width** (AC: #1)
  - [ ] 1.1: Add `@media (max-width: 550px)` rule in `App.css` for `.app` — `max-width: 100%`, `padding: 0 16px`, `box-shadow: none` (card shadow is unnecessary at full width). This gives the full-width + side padding mobile layout. Note: the existing `@media (max-width: 430px)` for footer stacking remains separate — it triggers at a narrower breakpoint.

- [ ] **Task 2: Add `role="alert"` to error message** (AC: screen reader support, deferred from Story 3.1 review)
  - [ ] 2.1: In `App.tsx`, change `<p className="error-message">` to `<p className="error-message" role="alert">`. This ensures screen readers announce errors when they appear.

- [ ] **Task 3: Ensure focus indicators are never suppressed** (AC: #8)
  - [ ] 3.1: Audit `App.css` for any `outline: none` or `outline: 0` on interactive elements. The `.add-todo-input` currently has `outline: none`. Add a `:focus-visible` rule that restores a visible outline: `.add-todo-input:focus-visible { outline: 2px solid var(--color-accent); outline-offset: -2px; }`. This preserves the clean look on mouse click but shows focus for keyboard users.
  - [ ] 3.2: Verify `.todo-toggle`, `.todo-destroy`, `.todo-filters button`, `.clear-completed` do NOT suppress outlines. If any do, add `:focus-visible` overrides.

- [ ] **Task 4: Frontend tests — accessibility and responsive** (AC: #4, #5, #6, #7, #8)
  - [ ] 4.1: Add tests to verify:
    - Semantic HTML: `<main>` landmark exists, `<form>` exists, `<ul>` exists, `<footer>` exists when todos present
    - `aria-label="Delete todo: {title}"` on delete buttons (already tested in TodoItem.test.tsx but verify integration)
    - `role="navigation"` with `aria-label="Filter todos"` on filter list (already tested in TodoFooter.test.tsx)
    - `role="alert"` on error message when displayed
    - Natural tab order: input → checkbox → delete → ... → filter buttons → clear completed (verify with Tab simulation)

## Dev Notes

### Architecture Compliance (MUST FOLLOW)

- **Styling:** Single global `App.css`. NO CSS-in-JS, NO styled-components, NO inline styles, NO CSS Modules.
- **CSS classes:** `kebab-case` with BEM-lite modifiers.
- **No `any` type.** No `console.log`.

### Existing Code State (READ BEFORE IMPLEMENTING)

#### What's Already Done (DO NOT REDO)
- Semantic HTML landmarks: `<main>` (App.tsx), `<form>` (AddTodo.tsx), `<ul>` (TodoList.tsx), `<footer>` (TodoFooter.tsx), `<label>` (TodoItem.tsx), `<button>` (TodoItem.tsx, TodoFooter.tsx) — ALL COMPLETE
- `aria-label="Delete todo: {title}"` on delete button in TodoItem.tsx — COMPLETE
- `role="navigation"` + `aria-label="Filter todos"` on filter `<ul>` in TodoFooter.tsx — COMPLETE
- Delete button always visible on mobile via `@media (hover: hover)` hiding pattern — COMPLETE
- Footer stacking on narrow mobile via `@media (max-width: 430px)` — COMPLETE
- Filter tabs 10px 14px padding for touch targets on mobile — COMPLETE
- Footer text color `#777` for WCAG AA 4.5:1 contrast — COMPLETE
- Centered card `max-width: 550px` — COMPLETE
- Checkbox 40×40px hit area — COMPLETE
- Delete button 40×40px hit area — COMPLETE

#### What Needs Work
- `.add-todo-input` has `outline: none` — needs `:focus-visible` restore for keyboard users
- No `@media (max-width: 550px)` rule for full-width mobile layout with 16px padding
- Error message needs `role="alert"` for screen reader announcements
- No explicit tests for semantic landmarks or accessibility attributes at integration level

#### `frontend/src/App.css` — Current State (232 lines)
- `:root` — design tokens
- `.app` — max-width 550px, centered, shadow
- `.add-todo-input` — has `outline: none` (PROBLEM for keyboard accessibility)
- `.todo-item` — relative positioning, 60px left padding
- `.todo-toggle` — 40×40px checkbox
- `.todo-destroy` — 40×40px, absolute right
- `@media (hover: hover)` — hides delete button on desktop hover
- `.todo-footer` — flex, #777 color
- `.todo-filters` — buttons with selected state
- `.error-message` — plain text styling
- `@media (max-width: 430px)` — footer stacking

### Deferred Items Resolved by This Story
- [Review][Defer] No aria-live announcement when footer disappears (from Story 2.2 review) — partially addressed via `role="alert"` on error messages. Footer disappearance is a normal UI state change, not an announcement-worthy event.
- [Review][Defer] Missing `role="alert"` on error message (from Story 3.1 review) — RESOLVED in Task 2.

### Previous Story Learnings
1. **Test patterns established** — `vi.fn()` for callbacks, `vi.mocked()` for API mocks, `userEvent.setup()` for interactions, `waitFor` for async assertions.
2. **CSS specificity** — use `.parent .child` selectors instead of `!important`.
3. **Code review lesson** — always include `required` in schemas, use proper selector specificity.

### What This Story Does NOT Cover
- Custom focus ring styling beyond restoring browser defaults
- Skip-to-content link (not required — single-view app)
- ARIA live regions for list changes (standard `<ul>` semantics are sufficient)
- Dark mode / prefers-color-scheme
- prefers-reduced-motion (no animations exist)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 3, Story 3.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — Accessibility Compliance table]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — UX-DR8, UX-DR9, UX-DR11]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes

Story context engine analysis completed. Most accessibility and responsive requirements already implemented in previous stories. Remaining work: mobile full-width breakpoint, role="alert" on error, focus-visible on input, and integration tests.

### File List

### Debug Log References
