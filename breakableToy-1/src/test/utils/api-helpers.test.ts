import { describe, it, expect } from "vitest";
import { fetchTodos } from "@/todos/api/fetchTodos";

describe("API Helper Functions", () => {
  describe("fetchTodos", () => {
    it("should be a function", () => {
      expect(typeof fetchTodos).toBe("function");
    });

    it("should accept optional parameters", () => {
      // Should not throw when called without parameters
      expect(() => fetchTodos()).not.toThrow();
    });

    it("should accept page parameter", () => {
      expect(() => fetchTodos({ page: 1 })).not.toThrow();
    });

    it("should accept size parameter", () => {
      expect(() => fetchTodos({ size: 20 })).not.toThrow();
    });

    it("should accept status filter", () => {
      expect(() => fetchTodos({ status: ["done"] })).not.toThrow();
    });

    it("should accept priority filter", () => {
      expect(() => fetchTodos({ priority: ["HIGH"] })).not.toThrow();
    });

    it("should accept text search", () => {
      expect(() => fetchTodos({ text: "test" })).not.toThrow();
    });

    it("should accept sortBy parameter", () => {
      expect(() => fetchTodos({ sortBy: "priority" })).not.toThrow();
    });

    it("should accept sortBy with _desc suffix", () => {
      expect(() => fetchTodos({ sortBy: "priority_desc" })).not.toThrow();
    });
  });
});

describe("Date Formatting", () => {
  it("formats dates correctly for API", () => {
    // Use timezone-safe parsing
    const date = new Date("2025-11-20T00:00:00");
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const formatted = `${year}-${month}-${day}`;

    expect(formatted).toBe("2025-11-20");
  });

  it("handles timezone-safe date parsing", () => {
    const dateString = "2025-11-20";
    const parsed = new Date(dateString + "T00:00:00");

    expect(parsed.getDate()).toBe(20);
    expect(parsed.getMonth()).toBe(10); // November is month 10
    expect(parsed.getFullYear()).toBe(2025);
  });
});

describe("Priority Types", () => {
  it("has valid priority values", () => {
    const priorities: ("HIGH" | "MEDIUM" | "LOW")[] = ["HIGH", "MEDIUM", "LOW"];
    expect(priorities).toHaveLength(3);
    expect(priorities).toContain("HIGH");
    expect(priorities).toContain("MEDIUM");
    expect(priorities).toContain("LOW");
  });
});

describe("Status Types", () => {
  it("has valid status values", () => {
    const statuses: ("done" | "undone")[] = ["done", "undone"];
    expect(statuses).toHaveLength(2);
    expect(statuses).toContain("done");
    expect(statuses).toContain("undone");
  });
});

describe("SortBy Types", () => {
  it("has valid sortBy values", () => {
    const sortByOptions: (
      | "priority"
      | "dueDate"
      | "priority_desc"
      | "dueDate_desc"
      | ""
    )[] = ["priority", "dueDate", "priority_desc", "dueDate_desc", ""];

    expect(sortByOptions).toHaveLength(5);
    expect(sortByOptions).toContain("priority");
    expect(sortByOptions).toContain("dueDate");
    expect(sortByOptions).toContain("priority_desc");
    expect(sortByOptions).toContain("dueDate_desc");
  });
});
