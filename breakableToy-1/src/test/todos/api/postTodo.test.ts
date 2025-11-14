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
import { postTodo } from "@/todos/api/postTodo";
import { toast } from "sonner";

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

describe("postTodo API", () => {
  const mockParams = {
    setText: vi.fn(),
    setPriority: vi.fn(),
    setError: vi.fn(),
    setDialogOpen: vi.fn(),
    setData: vi.fn(),
    setTotalPages: vi.fn(),
    fetchTodos: vi.fn().mockResolvedValue(undefined),
    setDate: vi.fn(),
    text: "Test Todo",
    priority: "HIGH",
    date: new Date("2025-12-01"),
  };

  it("successfully creates a todo", async () => {
    await postTodo(mockParams);

    expect(mockParams.setText).toHaveBeenCalledWith("");
    expect(mockParams.setPriority).toHaveBeenCalledWith("");
    expect(mockParams.setError).toHaveBeenCalledWith("");
    expect(mockParams.setDialogOpen).toHaveBeenCalledWith(false);
    expect(mockParams.fetchTodos).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Todo created successfully!");
  });

  it.skip("handles network timeout", async () => {
    server.use(
      http.post("http://localhost:9090/todos", async () => {
        // Never resolve - let axios timeout
        await new Promise(() => {});
        return HttpResponse.json({});
      })
    );

    await expect(postTodo(mockParams)).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("timeout")
    );
    expect(mockParams.setError).toHaveBeenCalledWith(
      expect.stringContaining("timeout")
    );
  }, 20000);

  it("handles validation error from server", async () => {
    server.use(
      http.post("http://localhost:9090/todos", () => {
        return HttpResponse.json(
          {
            error: "VALIDATION_ERROR",
            message: "The todo name is required.",
          },
          { status: 400 }
        );
      })
    );

    await expect(postTodo(mockParams)).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("todo name is required")
    );
  });

  it("handles server error", async () => {
    server.use(
      http.post("http://localhost:9090/todos", () => {
        return HttpResponse.json(
          { message: "Database error" },
          { status: 500 }
        );
      })
    );

    await expect(postTodo(mockParams)).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Database error")
    );
  });

  it("handles connection refused", async () => {
    server.use(
      http.post("http://localhost:9090/todos", () => {
        return HttpResponse.error();
      })
    );

    await expect(postTodo(mockParams)).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Cannot connect to server")
    );
  });

  it("formats date correctly", async () => {
    const dateParams = {
      ...mockParams,
      date: new Date("2025-11-15"),
    };

    await postTodo(dateParams);

    expect(mockParams.fetchTodos).toHaveBeenCalled();
  });

  it("handles undefined date", async () => {
    const noDateParams = {
      ...mockParams,
      date: undefined,
    };

    await postTodo(noDateParams);

    expect(mockParams.fetchTodos).toHaveBeenCalled();
  });

  it("sets error state on failure", async () => {
    server.use(
      http.post("http://localhost:9090/todos", () => {
        return HttpResponse.json(
          { message: "Invalid priority" },
          { status: 400 }
        );
      })
    );

    await expect(postTodo(mockParams)).rejects.toThrow();
    expect(mockParams.setError).toHaveBeenCalled();
  });
});
