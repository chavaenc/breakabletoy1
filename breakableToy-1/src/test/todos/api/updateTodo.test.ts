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
import { updateTodo, markDone, markUndone } from "@/todos/api/updateTodo";
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

describe("updateTodo API", () => {
  const mockOnSuccess = vi.fn().mockResolvedValue(undefined);

  it("successfully updates a todo", async () => {
    await updateTodo(
      "test-id",
      { text: "Updated", dueDate: "2025-12-01", priority: "HIGH" },
      mockOnSuccess
    );

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Todo updated successfully!");
  });

  it.skip("handles network timeout", async () => {
    server.use(
      http.put("http://localhost:9090/todos/:id", async () => {
        // Never resolve - let axios timeout
        await new Promise(() => {});
        return HttpResponse.json({});
      })
    );

    await expect(
      updateTodo(
        "test-id",
        { text: "Updated", priority: "HIGH" },
        mockOnSuccess
      )
    ).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("timeout")
    );
  }, 20000);

  it("handles not found error", async () => {
    server.use(
      http.put("http://localhost:9090/todos/:id", () => {
        return HttpResponse.json(
          {
            error: "NOT_FOUND",
            message: "Todo not found with id: nonexistent",
          },
          { status: 404 }
        );
      })
    );

    await expect(
      updateTodo(
        "nonexistent",
        { text: "Updated", priority: "HIGH" },
        mockOnSuccess
      )
    ).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("not found")
    );
  });

  it("handles validation error", async () => {
    server.use(
      http.put("http://localhost:9090/todos/:id", () => {
        return HttpResponse.json(
          {
            error: "VALIDATION_ERROR",
            message: "The todo name is required.",
          },
          { status: 400 }
        );
      })
    );

    await expect(
      updateTodo("test-id", { text: "", priority: "HIGH" }, mockOnSuccess)
    ).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("todo name is required")
    );
  });

  it("handles connection refused", async () => {
    server.use(
      http.put("http://localhost:9090/todos/:id", () => {
        return HttpResponse.error();
      })
    );

    await expect(
      updateTodo(
        "test-id",
        { text: "Updated", priority: "HIGH" },
        mockOnSuccess
      )
    ).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Cannot connect to server")
    );
  });
});

describe("markDone API", () => {
  it("successfully marks todo as done", async () => {
    const response = await markDone("test-id");
    expect(response.status).toBe(200);
  });

  it.skip("handles network timeout", async () => {
    server.use(
      http.post("http://localhost:9090/todos/:id/done", async () => {
        // Never resolve - let axios timeout
        await new Promise(() => {});
        return HttpResponse.json({});
      })
    );

    await expect(markDone("test-id")).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("timeout")
    );
  }, 20000);

  it("handles not found error", async () => {
    server.use(
      http.post("http://localhost:9090/todos/:id/done", () => {
        return HttpResponse.json(
          {
            error: "NOT_FOUND",
            message: "Todo not found",
          },
          { status: 404 }
        );
      })
    );

    await expect(markDone("nonexistent")).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("not found")
    );
  });

  it("handles connection refused", async () => {
    server.use(
      http.post("http://localhost:9090/todos/:id/done", () => {
        return HttpResponse.error();
      })
    );

    await expect(markDone("test-id")).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Cannot connect to server")
    );
  });
});

describe("markUndone API", () => {
  it("successfully marks todo as undone", async () => {
    const response = await markUndone("test-id");
    expect(response.status).toBe(200);
  });

  it.skip("handles network timeout", async () => {
    server.use(
      http.put("http://localhost:9090/todos/:id/undone", async () => {
        // Never resolve - let axios timeout
        await new Promise(() => {});
        return HttpResponse.json({});
      })
    );

    await expect(markUndone("test-id")).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("timeout")
    );
  }, 20000);

  it("handles not found error", async () => {
    server.use(
      http.put("http://localhost:9090/todos/:id/undone", () => {
        return HttpResponse.json(
          {
            error: "NOT_FOUND",
            message: "Todo not found",
          },
          { status: 404 }
        );
      })
    );

    await expect(markUndone("nonexistent")).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("not found")
    );
  });

  it("handles server error", async () => {
    server.use(
      http.put("http://localhost:9090/todos/:id/undone", () => {
        return HttpResponse.json(
          { message: "Internal server error" },
          { status: 500 }
        );
      })
    );

    await expect(markUndone("test-id")).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Internal server error")
    );
  });
});
