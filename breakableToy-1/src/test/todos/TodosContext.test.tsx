import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { server } from "../mocks/server";
import { TodosProvider, useTodos } from "@/todos/TodosContext";
import type { ReactNode } from "react";

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("TodosContext", () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TodosProvider>{children}</TodosProvider>
  );

  it("provides initial state", () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    expect(result.current.rows).toEqual([]);
    expect(result.current.page).toBe(0);
    expect(result.current.priority).toEqual(["HIGH", "MEDIUM", "LOW"]);
    expect(result.current.status).toEqual(["done", "undone"]);
    expect(result.current.text).toBe("");
    expect(result.current.sortBy).toBe("");
  });

  it("fetches todos on mount", async () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows.length).toBeGreaterThan(0);
    });
  });

  it("updates page", async () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    result.current.setPage(1);

    await waitFor(() => {
      expect(result.current.page).toBe(1);
    });
  });

  it("updates sortBy", async () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    result.current.setSortBy("priority");

    await waitFor(() => {
      expect(result.current.sortBy).toBe("priority");
    });
  });

  it("updates text filter", async () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    result.current.setText("test");

    await waitFor(() => {
      expect(result.current.text).toBe("test");
    });
  });

  it("provides fetchTodos function", () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    expect(typeof result.current.fetchTodos).toBe("function");
  });

  it("provides refreshTodos function", () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    expect(typeof result.current.refreshTodos).toBe("function");
  });

  it("provides refreshAverages function", () => {
    const { result } = renderHook(() => useTodos(), { wrapper });

    expect(typeof result.current.refreshAverages).toBe("function");
  });
});
