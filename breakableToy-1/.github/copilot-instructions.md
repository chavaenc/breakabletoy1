## Purpose

This file gives concise, project-specific guidance to an AI coding agent so it can be immediately productive in this repo.

## Quick facts

- Framework: React + TypeScript + Vite (SWC plugin)
- UI: Tailwind CSS + Radix UI primitives (components under `src/components/ui`)
- Table: @tanstack/react-table used for the main Todos table
- API backend: expected at http://localhost:9090 (see `src/config.ts`)
- Dev server: runs on port 8080 (set in `vite.config.ts`)

## Useful commands

Use the repo root. Example (Windows cmd):

```
npm install
npm run dev    # run vite (or npm start)
npm run build  # tsc -b && vite build
npm run preview
npm run lint
npm run test   # runs vitest if configured
```

## Important files & behavior to reference

- `src/config.ts` — single place for backend URL (API_URL). Update this when pointing to a different backend.
- `src/todos/api/*.tsx` — all network interactions live here (fetchTodos, postTodo, updateTodo, deleteTodo, getAverages). They use the global fetch API and expect JSON payloads.
- `src/todos/columns.tsx` — builds column definitions for @tanstack/react-table using a factory `getColumns(...)`. Columns contain action cells that call API helpers and then re-fetch via `fetchTodos`.
- `src/todos/data-table.tsx` — the consumer of `getColumns`, sets up sorting, filtering, pagination and calls `fetchTodos` to populate rows.
- `src/components/ui/*` — shared design primitives (Table, Button, Checkbox, Pagination, etc.). Follow their props when creating UI.
- `src/lib/utils.ts` — `cn(...)` utility for composing Tailwind classes (uses clsx + tailwind-merge).
- `vite.config.ts` and `tsconfig.json` — define alias `@` → `src` (use `@/path/to/file`).

## Data shapes and API contract (as implemented)

- GET /todos?queryParams returns { todos: [...], page, size, total, totalPages }
- Each todo returned is normalized in `fetchTodos` to convert date strings into JS `Date` objects (see `fetchTodos` mapping).
- POST /todos expects { text, dueDate, priority } and returns updated list on client re-fetch.
- PUT /todos/:id to update; POST /todos/:id/done and PUT /todos/:id/undone to toggle done state.
- GET /todos/averages returns metric data used by the UI (`getAverages`).

## Project conventions and gotchas

- Path alias: use `@/` imports instead of relative paths where appropriate.
- Client components: some files use the React "use client" directive (e.g., `src/todos/*`); avoid moving server-only logic into those files.
- Network helpers live under `src/todos/api` and are expected to re-fetch lists after mutations — prefer reusing those helpers rather than direct fetches.
- Styling: Tailwind classes are applied directly; use `cn(...)` for conditional class composition.

## Debugging tips

- Frontend: open http://localhost:8080. Check the browser console & network tab for failing fetches.
- Backend: the frontend expects the API at the URL in `src/config.ts` (default http://localhost:9090/todos). Start the backend before making requests.
- Common bug found: `src/todos/api/deleteTodo.tsx` sets `setTotalPages(updated.totalPagesp)` — likely a typo (`totalPagesp`) that will cause undefined behavior. Verify and fix when modifying.

## When changing behavior

- Update `src/config.ts` if you change the backend host/port.
- Keep API helpers in `src/todos/api` consistent: they centralize error handling, JSON parsing, and conversion (dates → Date objects).
- Update `getColumns` in `src/todos/columns.tsx` when adding new columns; header buttons toggle `sortBy` and call `fetchTodos` with `sortBy`.

If anything here is unclear or you want more detail (e.g., examples of adding a new API call, column, or unit tests), tell me what area to expand.
