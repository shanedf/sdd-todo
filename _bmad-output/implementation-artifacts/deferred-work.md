# Deferred Work

## Deferred from: code review of stories 3.2 + 3.3 (2025-07-25)

- Dead `setLoading` state in App.tsx — `[, setLoading]` keeps an unused state setter. Remove entire `useState` and associated `setLoading(false)` calls if loading state is never read.
- Touch targets 40×40px vs AC 3.2#1 requirement of ≥44×44px — spec author marked 40px as "COMPLETE" in story tasks, but AC text says ≥44px. Resolve spec inconsistency and increase if needed.
- `@media (hover: hover)` not scoped to desktop — on hybrid devices (e.g., iPad + mouse) below 550px viewport, delete buttons may be incorrectly hidden. Fix: `@media (hover: hover) and (min-width: 551px)`.
- E2E `beforeEach` cleanup lacks error handling — `GET /api/todos` and `DELETE /api/todos/{id}` responses not checked for errors; failures would silently corrupt test state.
