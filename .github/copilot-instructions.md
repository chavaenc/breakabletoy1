# Breakable Toy 1 - Full-Stack Todo App

## Architecture Overview

This is a **full-stack todo management application** with a clear separation of concerns:

- **Frontend**: `breakableToy-1/` - React + TypeScript + Vite (port 8080)
- **Backend**: `backend/` - Spring Boot 3.5 + Java 21 (port 9090)
- **Data Storage**: In-memory ArrayList (no database - data resets on restart)
- **Communication**: REST API with CORS enabled for localhost:8080

The frontend uses React Context (`TodosContext`) for state management and @tanstack/react-table for the data grid. The backend is a standard Spring Boot REST controller with a service layer.

## Critical Developer Workflows

### Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run          # Start server on port 9090
mvn test                      # Run JUnit + Mockito tests
```

### Frontend (React + Vite)
```bash
cd breakableToy-1
npm install                   # First time setup
npm run dev                   # or npm start - dev server on port 8080
npm run build                 # TypeScript compile + Vite build
npm run test                  # Run Vitest with happy-dom
```

**Key**: Both servers must run simultaneously. Frontend expects backend at `http://localhost:9090/todos` (configured in `breakableToy-1/src/config.ts`).

## Data Flow & API Contract

### Request/Response Patterns
- **GET /todos?page=0&size=10&status=done,undone&priority=HIGH,MEDIUM,LOW&text=search&sortBy=priority**
  - Returns: `{ todos: Todo[], page, size, total, totalPages }`
  - Frontend normalizes date strings → `Date` objects in `fetchTodos.tsx`
  
- **POST /todos** - Body: `{ text, dueDate, priority }` - Returns 200 on success
- **PUT /todos/:id** - Body: `{ text, dueDate, priority }` - Returns 200 or 404
- **POST /todos/:id/done** - Marks done with `doneDate = today`
- **PUT /todos/:id/undone** - Clears done flag and doneDate
- **DELETE /todos/:id** - Returns 204 on success
- **GET /todos/averages** - Returns `{ averageTime, byPriority: { low, medium, high } }`

### Data Model Differences
- **Backend**: Uses `LocalDate` for dates, `Priority` enum (HIGH/MEDIUM/LOW)
- **Frontend**: Uses `Date` objects, lowercase priority strings ("high"/"medium"/"low")
- **Key field**: `creationDate` is auto-generated with random past date (0-30 days ago) on creation

## Project-Specific Conventions

### Frontend Architecture
- **Path alias**: `@/` maps to `src/` (configured in `vite.config.ts`)
- **State management**: `TodosContext.tsx` provides global state - always use `useTodos()` hook
- **API layer**: All network calls isolated in `src/todos/api/*.tsx` - never use fetch directly elsewhere
- **Columns pattern**: `getColumns()` factory in `columns.tsx` creates column definitions with embedded action handlers
- **Testing**: MSW (Mock Service Worker) for API mocking, happy-dom for DOM, Vitest as test runner

### Backend Architecture
- **No persistence**: `TodoService` uses in-memory `ArrayList` - data is volatile
- **CORS**: Explicitly configured in `TodoController` for `http://localhost:8080`
- **Validation**: `validateTodo()` method checks text and priority - returns error string or null
- **Filtering logic**: Service layer implements complex filtering - all filters must match (AND logic) except when priority/status arrays are empty
- **Sorting**: Comparator in `getComparator()` supports priority, dueDate, creationData (ascending/descending)

### Known Issues & Quirks
- **Bug in deleteTodo**: `breakableToy-1/src/todos/api/deleteTodo.tsx` has typo `setTotalPages(updated.totalPagesp)` - should be `totalPages`
- **Random creation dates**: Backend generates random `creationDate` 0-30 days in past for demo purposes
- **Case sensitivity**: Backend uses uppercase Priority enum (HIGH), frontend uses lowercase ("high") - conversion happens in API layer
- **Test error suppression**: Frontend tests suppress AbortError from happy-dom cleanup (see `src/test/setup.ts`)

## Key Files to Reference

### Frontend
- `src/config.ts` - Backend URL configuration (single source of truth)
- `src/todos/TodosContext.tsx` - Global state provider with filters, pagination, sorting
- `src/todos/api/fetchTodos.tsx` - API helpers + date normalization logic
- `src/todos/columns.tsx` - Table column definitions with action buttons
- `src/test/mocks/server.ts` - MSW handlers for testing

### Backend
- `backend/src/main/java/com/example/breakabletoy1/todo/controller/TodoController.java` - REST endpoints
- `backend/src/main/java/com/example/breakabletoy1/todo/service/TodoService.java` - Business logic + in-memory storage
- `backend/src/main/java/com/example/breakabletoy1/todo/model/Todo.java` - Entity with Lombok annotations
- `backend/src/main/resources/application.properties` - Server port configuration

## Adding New Features

### New API Endpoint
1. Add method in `TodoController` with proper HTTP verb and path
2. Implement logic in `TodoService` 
3. Create API helper in `breakableToy-1/src/todos/api/` following existing patterns
4. Update `TodosContext` if new state is needed
5. Add MSW handler in `src/test/mocks/server.ts` for tests

### New Table Column
1. Update `getColumns()` in `src/todos/columns.tsx`
2. Add header component if sortable (follow `PriorityHeader` pattern)
3. Implement cell renderer with appropriate styling (use `cn()` utility)

### New Filter/Sort
1. Add state to `TodosContext` (both state variable and setter)
2. Update `fetchTodos` call to include new parameter
3. Implement backend logic in `TodoService.getTodos()`
4. Add UI controls in `filters.tsx` or column headers

## Testing Patterns

- **Backend**: JUnit 5 + Mockito, test service layer directly (see `TodoServiceTest.java`)
- **Frontend**: Vitest + Testing Library + MSW for API mocking
- **Test isolation**: Each test should create fresh service instance (backend) or use MSW reset (frontend)
- **Date handling**: Tests must account for date normalization in frontend API layer
