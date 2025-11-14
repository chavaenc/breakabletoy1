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
import { deleteTodo } from "@/todos/api/deleteTodo";
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

describe("deleteTodo API", () => {
  const mockRefreshTodos = vi.fn().mockResolvedValue(undefined);
  const mockRefreshAverages = vi.fn();
  const mockSetMetricData = {};

  it("successfully deletes a todo", async () => {
    await deleteTodo(
      mockRefreshTodos,
      mockSetMetricData,
      "test-id",
      mockRefreshAverages
    );

    expect(mockRefreshTodos).toHaveBeenCalled();
    expect(mockRefreshAverages).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Todo deleted successfully!");
  });

  it.skip("handles network timeout", async () => {
    server.use(
      http.delete("http://localhost:9090/todos/:id", async () => {
        // Never resolve - let axios timeout
        await new Promise(() => {});
        return HttpResponse.json({});
      })
    );

    await expect(
      deleteTodo(
        mockRefreshTodos,
        mockSetMetricData,
        "test-id",
        mockRefreshAverages
      )
    ).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("timeout")
    );
  }, 20000);

  it("handles not found error", async () => {
    server.use(
      http.delete("http://localhost:9090/todos/:id", () => {
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
      deleteTodo(
        mockRefreshTodos,
        mockSetMetricData,
        "nonexistent",
        mockRefreshAverages
      )
    ).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("not found")
    );
  });

  it("handles server error", async () => {
    server.use(
      http.delete("http://localhost:9090/todos/:id", () => {
        return HttpResponse.json(
          { message: "Failed to delete from database" },
          { status: 500 }
        );
      })
    );

    await expect(
      deleteTodo(
        mockRefreshTodos,
        mockSetMetricData,
        "test-id",
        mockRefreshAverages
      )
    ).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to delete")
    );
  });

  it("handles connection refused", async () => {
    server.use(
      http.delete("http://localhost:9090/todos/:id", () => {
        return HttpResponse.error();
      })
    );

    await expect(
      deleteTodo(
        mockRefreshTodos,
        mockSetMetricData,
        "test-id",
        mockRefreshAverages
      )
    ).rejects.toThrow();
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining("Cannot connect to server")
    );
  });

  it("does not refresh on error", async () => {
    server.use(
      http.delete("http://localhost:9090/todos/:id", () => {
        return HttpResponse.error();
      })
    );

    mockRefreshTodos.mockClear();
    mockRefreshAverages.mockClear();

    await expect(
      deleteTodo(
        mockRefreshTodos,
        mockSetMetricData,
        "test-id",
        mockRefreshAverages
      )
    ).rejects.toThrow();

    expect(mockRefreshTodos).not.toHaveBeenCalled();
    expect(mockRefreshAverages).not.toHaveBeenCalled();
  });
});
