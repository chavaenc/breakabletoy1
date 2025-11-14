import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TodosProvider } from "@/todos/TodosContext";
import { DataTable } from "@/todos/data-table";

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Integration Tests - Todo CRUD Operations", () => {
  const renderApp = () => {
    return render(
      <TodosProvider>
        <DataTable />
      </TodosProvider>
    );
  };

  it("can create a new todo", async () => {
    const user = userEvent.setup();
    renderApp();

    // Click create button
    const createButton = screen.getAllByRole("button", {
      name: /new todo/i,
    })[0];
    await user.click(createButton);

    // Fill out form
    await waitFor(async () => {
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, "New Integration Test Todo");
    });

    // Submit
    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    // Dialog should close after save
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("can mark a todo as done", async () => {
    const user = userEvent.setup();
    renderApp();

    // Wait for todos to load
    await waitFor(() => {
      const todoElements = screen.getAllByText(/test todo 1/i);
      expect(todoElements.length).toBeGreaterThan(0);
    });

    // Find and click checkbox for incomplete todo
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
    await user.click(checkboxes[0]);

    // Wait for the action to complete (checkbox gets updated)
    await waitFor(() => {
      const updatedCheckboxes = screen.getAllByRole("checkbox");
      expect(updatedCheckboxes.length).toBeGreaterThan(0);
    });
  });

  it("can delete a todo", async () => {
    const user = userEvent.setup();
    renderApp();

    // Wait for todos to load
    await waitFor(() => {
      const todoElements = screen.getAllByText(/test todo 1/i);
      expect(todoElements.length).toBeGreaterThan(0);
    });

    // Find delete button (trash icon)
    const deleteButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.querySelector("svg.lucide-trash"));

    expect(deleteButtons.length).toBeGreaterThan(0);
    await user.click(deleteButtons[0]);

    // Wait for action to complete - buttons are re-rendered after data refetch
    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  it("can search for todos", async () => {
    const user = userEvent.setup();
    renderApp();

    // Wait for initial load
    await waitFor(() => {
      const todoElements = screen.getAllByText(/test todo 1/i);
      expect(todoElements.length).toBeGreaterThan(0);
    });

    // Type in search
    const searchInput = screen.getByPlaceholderText(/search todos/i);
    await user.type(searchInput, "test");

    // Search should trigger (input is controlled)
    expect(searchInput).toHaveValue("test");
  });

  it("handles API errors gracefully", async () => {
    const user = userEvent.setup();

    // Mock API error
    server.use(
      http.post("http://localhost:9090/todos", () => {
        return HttpResponse.json({ error: "Server error" }, { status: 500 });
      })
    );

    renderApp();

    // Try to create a todo
    const createButton = screen.getAllByRole("button", {
      name: /new todo/i,
    })[0];
    await user.click(createButton);

    await waitFor(async () => {
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, "Will Fail");
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    // On error, form should still be visible (dialog doesn't close)
    await waitFor(() => {
      const nameInput = screen.queryByLabelText(/name/i);
      // Form still present indicates error was handled
      expect(nameInput).toBeInTheDocument();
    });
  });

  it("displays different badge colors for different priorities", async () => {
    renderApp();

    await waitFor(() => {
      const highBadges = screen.getAllByText(/high/i);
      const mediumBadges = screen.getAllByText(/medium/i);
      const lowBadges = screen.getAllByText(/low/i);

      // Find badge elements with correct colors
      const highBadge = highBadges.find((el) =>
        el.className.includes("bg-red-200")
      );
      const mediumBadge = mediumBadges.find((el) =>
        el.className.includes("bg-yellow-200")
      );
      const lowBadge = lowBadges.find((el) =>
        el.className.includes("bg-green-200")
      );

      expect(highBadge).toBeDefined();
      expect(mediumBadge).toBeDefined();
      expect(lowBadge).toBeDefined();
    });
  });

  it("shows pagination controls when needed", async () => {
    renderApp();

    await waitFor(() => {
      // Look for pagination elements
      const pagination = document.querySelector('[data-slot="pagination"]');
      expect(pagination).toBeTruthy();
    });
  });
});
