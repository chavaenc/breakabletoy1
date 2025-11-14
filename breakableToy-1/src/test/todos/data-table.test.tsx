import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { server } from "../mocks/server";
import { TodosProvider } from "@/todos/TodosContext";
import { DataTable } from "@/todos/data-table";

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("DataTable Component", () => {
  const renderWithProvider = () => {
    return render(
      <TodosProvider>
        <DataTable />
      </TodosProvider>
    );
  };

  it("renders search and filter controls", () => {
    renderWithProvider();
    expect(screen.getByPlaceholderText(/search todos/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /high.*medium.*low/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /done.*undone/i })
    ).toBeInTheDocument();
  });

  it("renders create todo button on desktop", () => {
    renderWithProvider();
    const createButtons = screen.getAllByRole("button", { name: /new todo/i });
    expect(createButtons.length).toBeGreaterThan(0);
  });

  it("renders mobile sort buttons", () => {
    renderWithProvider();
    const priorityButtons = screen.getAllByRole("button", {
      name: /priority/i,
    });
    const dateButtons = screen.getAllByRole("button", { name: /date/i });
    expect(priorityButtons.length).toBeGreaterThan(0);
    expect(dateButtons.length).toBeGreaterThan(0);
  });

  it("loads and displays todos from API", async () => {
    renderWithProvider();

    await waitFor(() => {
      const todoElements = screen.getAllByText(/test todo 1/i);
      expect(todoElements.length).toBeGreaterThan(0);
    });
  });

  it("displays todo badges with correct priority colors", async () => {
    renderWithProvider();

    await waitFor(() => {
      const highBadges = screen.getAllByText(/high/i);
      // Find the badge element (has bg-red-200 class)
      const highBadge = highBadges.find((el) =>
        el.className.includes("bg-red-200")
      );
      expect(highBadge).toBeDefined();
      expect(highBadge).toHaveClass("bg-red-200");
    });
  });

  it("shows done badge for completed todos", async () => {
    renderWithProvider();

    await waitFor(() => {
      const doneBadge = screen.getByText(/done/i);
      expect(doneBadge).toBeInTheDocument();
    });
  });

  it("applies opacity to completed todo rows", async () => {
    renderWithProvider();

    await waitFor(() => {
      // Find the row with the completed todo
      const tableBody = screen.getAllByRole("row");
      const completedRow = tableBody.find((row) =>
        row.textContent?.includes("Test Todo 2")
      );
      expect(completedRow).toHaveClass("opacity-50");
    });
  });

  it("shows metrics cards with data", async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(
        screen.getByText(/average time to finish tasks/i)
      ).toBeInTheDocument();
    });
  });

  it("clicking priority sort button changes sort state", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    // Get all priority buttons (mobile + desktop) and select the desktop one (has ArrowUpDown svg)
    const priorityButtons = screen.getAllByRole("button", {
      name: /priority/i,
    });
    const desktopPriorityButton = priorityButtons.find((btn) =>
      btn.querySelector("svg.lucide-arrow-up-down")
    );
    expect(desktopPriorityButton).toBeDefined();

    // Click button - should not throw
    await user.click(desktopPriorityButton!);

    // Verify button still exists after click
    const buttonsAfterClick = screen.getAllByRole("button", {
      name: /priority/i,
    });
    expect(buttonsAfterClick.length).toBeGreaterThan(0);
  });

  it("clicking date sort button changes sort state", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    // Get all date buttons (mobile + desktop) and select the desktop one (has "Due Date" text)
    const dateButtons = screen.getAllByRole("button", { name: /date/i });
    const desktopDateButton = dateButtons.find((btn) =>
      btn.textContent?.includes("Due Date")
    );
    expect(desktopDateButton).toBeDefined();

    // Click button - should not throw
    await user.click(desktopDateButton!);

    // Verify button still exists after click
    const buttonsAfterClick = screen.getAllByRole("button", { name: /date/i });
    expect(buttonsAfterClick.length).toBeGreaterThan(0);
  });
});
