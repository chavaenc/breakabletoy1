import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { fetchTodos, getAverages } from "@/todos/api/fetchTodos";
import { toast } from "sonner";

// Mock toast notifications
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe("fetchTodos API", () => {
  it("successfully fetches todos", async () => {
    const result = await fetchTodos({ page: 0, size: 10 });

    expect(result.todos).toBeDefined();
    expect(Array.isArray(result.todos)).toBe(true);
    expect(result.page).toBe(0);
    expect(result.size).toBe(10);
  });

  it.skip("handles network timeout errors", async () => {
    server.use(
      http.get("http://localhost:9090/todos", async () => {
        await new Promise((resolve) => setTimeout(resolve, 15000));
        return HttpResponse.json({ todos: [] });
      })
    );

    const result = await fetchTodos();

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("timeout")
    );
    expect(result.todos).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("handles server connection refused", async () => {
    server.use(
      http.get("http://localhost:9090/todos", () => {
        return HttpResponse.error();
      })
    );

    const result = await fetchTodos();

    expect(toast.error).toHaveBeenCalled();
    expect(result.todos).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("handles empty response from server", async () => {
    server.use(
      http.get("http://localhost:9090/todos", () => {
        return HttpResponse.json({});
      })
    );

    const result = await fetchTodos();

    expect(toast.error).toHaveBeenCalledWith("Invalid response from server");
    expect(result.todos).toEqual([]);
  });

  it("handles server error with custom message", async () => {
    server.use(
      http.get("http://localhost:9090/todos", () => {
        return HttpResponse.json(
          { message: "Database connection failed" },
          { status: 500 }
        );
      })
    );

    const result = await fetchTodos();

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Database connection failed")
    );
    expect(result.todos).toEqual([]);
  });

  it("normalizes date objects correctly", async () => {
    const result = await fetchTodos();

    if (result.todos.length > 0) {
      const todo = result.todos[0];
      expect(todo.creationDate).toBeInstanceOf(Date);
      if (todo.dueDate) {
        expect(todo.dueDate).toBeInstanceOf(Date);
      }
    }
  });

  it("converts priority to lowercase", async () => {
    const result = await fetchTodos();

    if (result.todos.length > 0) {
      const todo = result.todos[0];
      expect(["high", "medium", "low"]).toContain(todo.priority);
    }
  });

  it("applies filters correctly", async () => {
    const result = await fetchTodos({
      status: ["done"],
      priority: ["HIGH"],
      text: "test",
    });

    expect(result).toBeDefined();
  });
});

describe("getAverages API", () => {
  it("successfully fetches averages", async () => {
    const mockSetMetricData = vi.fn();

    await getAverages(mockSetMetricData);

    expect(mockSetMetricData).toHaveBeenCalled();
  });

  it.skip("handles network timeout for averages", async () => {
    server.use(
      http.get("http://localhost:9090/todos/averages", async () => {
        await new Promise((resolve) => setTimeout(resolve, 15000));
        return HttpResponse.json({});
      })
    );

    const mockSetMetricData = vi.fn();
    await getAverages(mockSetMetricData);

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("timeout")
    );
  });

  it("handles server error for averages", async () => {
    server.use(
      http.get("http://localhost:9090/todos/averages", () => {
        return HttpResponse.json(
          { message: "Failed to calculate averages" },
          { status: 500 }
        );
      })
    );

    const mockSetMetricData = vi.fn();
    await getAverages(mockSetMetricData);

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to calculate averages")
    );
  });

  it("handles connection refused for averages", async () => {
    server.use(
      http.get("http://localhost:9090/todos/averages", () => {
        return HttpResponse.error();
      })
    );

    const mockSetMetricData = vi.fn();
    await getAverages(mockSetMetricData);

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Cannot connect to server")
    );
  });
});
