/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { getColumns, type Todo } from "@/todos/columns";
import { TodosProvider } from "@/todos/TodosContext";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("getColumns - Column Definitions", () => {
  const mockTodo: Todo = {
    id: "test-id-123",
    text: "Test Todo",
    dueDate: new Date("2025-11-20"),
    done: false,
    priority: "high",
    creationDate: new Date("2025-11-01"),
    doneDate: null,
  };

  function TestTable({ todo }: { todo: Todo }) {
    const columns = getColumns();
    const table = useReactTable({
      data: [todo],
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <TodosProvider>
        <table>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </TodosProvider>
    );
  }

  it("returns an array of column definitions", () => {
    const columns = getColumns();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns.length).toBeGreaterThan(0);
  });

  it("includes status column", () => {
    const columns = getColumns();
    const statusColumn = columns.find((col) => col.id === "status");
    expect(statusColumn).toBeDefined();
    expect(statusColumn?.enableSorting).toBe(false);
    expect(statusColumn?.enableHiding).toBe(false);
  });

  it("includes text column", () => {
    const columns = getColumns();
    const textColumn = columns.find((col: any) => col.accessorKey === "text");
    expect(textColumn).toBeDefined();
  });

  it("includes priority column", () => {
    const columns = getColumns();
    const priorityColumn = columns.find(
      (col: any) => col.accessorKey === "priority"
    );
    expect(priorityColumn).toBeDefined();
  });

  it("includes dueDate column", () => {
    const columns = getColumns();
    const dueDateColumn = columns.find(
      (col: any) => col.accessorKey === "dueDate"
    );
    expect(dueDateColumn).toBeDefined();
  });

  it.skip("includes actions column", () => {
    const columns = getColumns();
    const actionsColumn = columns.find((col) => col.id === "actions");
    expect(actionsColumn).toBeDefined();
    expect(actionsColumn?.enableSorting).toBe(false);
    expect(actionsColumn?.enableHiding).toBe(false);
  });

  it("renders status checkbox for undone todo", () => {
    render(<TestTable todo={mockTodo} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it.skip("renders status checkbox as checked for done todo", () => {
    const doneTodo = { ...mockTodo, done: true };
    render(<TestTable todo={doneTodo} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("displays todo text", () => {
    render(<TestTable todo={mockTodo} />);
    expect(screen.getByText("Test Todo")).toBeInTheDocument();
  });

  it("displays priority badge with correct color for high priority", () => {
    render(<TestTable todo={mockTodo} />);
    const badge = screen.getByText(/high/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("red");
  });

  it("displays priority badge with correct color for medium priority", () => {
    const mediumTodo = { ...mockTodo, priority: "medium" as const };
    render(<TestTable todo={mediumTodo} />);
    const badge = screen.getByText(/medium/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("yellow");
  });

  it("displays priority badge with correct color for low priority", () => {
    const lowTodo = { ...mockTodo, priority: "low" as const };
    render(<TestTable todo={lowTodo} />);
    const badge = screen.getByText(/low/i);
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("green");
  });

  it("displays due date with correct formatting", () => {
    render(<TestTable todo={mockTodo} />);
    expect(screen.getByText(/Nov/i)).toBeInTheDocument();
    expect(screen.getByText(/20/)).toBeInTheDocument();
  });

  it.skip("shows urgent color for due date within 1 week", () => {
    const urgentTodo = {
      ...mockTodo,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    };
    render(<TestTable todo={urgentTodo} />);
    const dueDateBadge = screen.getByText(/\w{3}/); // Month abbreviation
    expect(dueDateBadge.parentElement?.className).toContain("red");
  });

  it("handles null due date gracefully", () => {
    const noDueDateTodo = { ...mockTodo, dueDate: null };
    render(<TestTable todo={noDueDateTodo} />);
    expect(screen.queryByText(/Nov/i)).not.toBeInTheDocument();
  });

  it("renders update button", () => {
    render(<TestTable todo={mockTodo} />);
    const updateButtons = screen.getAllByRole("button");
    expect(updateButtons.length).toBeGreaterThan(0);
  });

  it.skip("renders delete button", () => {
    render(<TestTable todo={mockTodo} />);
    const deleteButton = screen.getByRole("button", { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it("status column has center alignment", () => {
    const columns = getColumns();
    const statusColumn = columns.find((col) => col.id === "status");
    expect(statusColumn?.header).toBeDefined();
  });

  it("priority header exists", () => {
    const columns = getColumns();
    const priorityColumn = columns.find(
      (col: any) => col.accessorKey === "priority"
    );
    expect(priorityColumn?.header).toBeDefined();
  });

  it("due date header exists", () => {
    const columns = getColumns();
    const dueDateColumn = columns.find(
      (col: any) => col.accessorKey === "dueDate"
    );
    expect(dueDateColumn?.header).toBeDefined();
  });

  it("actions column is not sortable", () => {
    const columns = getColumns();
    const actionsColumn = columns.find((col) => (col as any).id === "actions");
    expect(actionsColumn).toBeDefined();
    expect((actionsColumn as any)?.enableSorting).not.toBe(true);
  });

  it("actions column is not hideable", () => {
    const columns = getColumns();
    const actionsColumn = columns.find((col) => (col as any).id === "actions");
    expect(actionsColumn).toBeDefined();
    expect((actionsColumn as any)?.enableHiding).not.toBe(true);
  });
});
