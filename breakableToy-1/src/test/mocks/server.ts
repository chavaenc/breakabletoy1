import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const API_URL = "http://localhost:9090/todos";

// Mock handlers for API endpoints
export const handlers = [
  // GET /todos - Fetch todos
  http.get(API_URL, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "0");
    const size = parseInt(url.searchParams.get("size") || "10");

    return HttpResponse.json({
      todos: mockTodos.slice(page * size, (page + 1) * size),
      page,
      size,
      total: mockTodos.length,
      totalPages: Math.ceil(mockTodos.length / size),
    });
  }),

  // POST /todos - Create todo
  http.post(API_URL, async ({ request }) => {
    const newTodo = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: "test-id-" + Date.now(),
        done: false,
        doneDate: null,
        creationDate: new Date().toISOString().split("T")[0],
        ...newTodo,
      },
      { status: 201 }
    );
  }),

  // PUT /todos/:id - Update todo
  http.put(`${API_URL}/:id`, async ({ request, params }) => {
    const { id } = params;
    const updates = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ id, ...updates });
  }),

  // DELETE /todos/:id - Delete todo
  http.delete(`${API_URL}/:id`, () => {
    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  // POST /todos/:id/done - Mark as done
  http.post(`${API_URL}/:id/done`, () => {
    return HttpResponse.json({ success: true });
  }),

  // PUT /todos/:id/undone - Mark as undone
  http.put(`${API_URL}/:id/undone`, () => {
    return HttpResponse.json({ success: true });
  }),

  // GET /todos/averages - Get metrics
  http.get(`${API_URL}/averages`, () => {
    return HttpResponse.json({
      avgTimeToComplete: 5.5,
      avgPriorityHigh: 30,
      avgPriorityMedium: 50,
      avgPriorityLow: 20,
    });
  }),
];

// Mock todo data
const mockTodos = [
  {
    id: "1",
    text: "Test Todo 1",
    dueDate: "2025-11-20",
    done: false,
    doneDate: null,
    priority: "HIGH",
    creationDate: "2025-11-01",
  },
  {
    id: "2",
    text: "Test Todo 2",
    dueDate: "2025-11-25",
    done: true,
    doneDate: "2025-11-10",
    priority: "MEDIUM",
    creationDate: "2025-11-02",
  },
  {
    id: "3",
    text: "Test Todo 3",
    dueDate: "2025-12-01",
    done: false,
    doneDate: null,
    priority: "LOW",
    creationDate: "2025-11-03",
  },
];

// Setup MSW server
export const server = setupServer(...handlers);
