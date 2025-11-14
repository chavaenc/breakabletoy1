import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TodosProvider } from "@/todos/TodosContext";
import UpdateTodo from "@/todos/updateTodo";

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("UpdateTodo Component", () => {
  const mockTodo = {
    id: "test-123",
    otext: "Original Todo",
    odueDate: new Date("2025-11-20"),
    opriority: "high" as "high" | "medium" | "low",
  };

  const renderWithProvider = () => {
    return render(
      <TodosProvider>
        <UpdateTodo {...mockTodo} />
      </TodosProvider>
    );
  };

  it("renders edit button", () => {
    renderWithProvider();
    const editButton = screen.getByRole("button");
    expect(editButton).toBeInTheDocument();
  });

  it("opens dialog when edit button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const editButton = screen.getByRole("button");
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText(/update todo/i)).toBeInTheDocument();
    });
  });

  it("pre-fills form with existing todo data", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const editButton = screen.getByRole("button");
    await user.click(editButton);

    await waitFor(() => {
      const textInput = screen.getByDisplayValue(/original todo/i);
      expect(textInput).toBeInTheDocument();
    });
  });

  it("allows updating todo text", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const editButton = screen.getByRole("button");
    await user.click(editButton);

    await waitFor(async () => {
      const textInput = screen.getByDisplayValue(/original todo/i);
      await user.clear(textInput);
      await user.type(textInput, "Updated Todo");
      expect(textInput).toHaveValue("Updated Todo");
    });
  });

  it("has update and cancel buttons", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const editButton = screen.getByRole("button");
    await user.click(editButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });
  });

  it.skip("closes dialog when cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const editButton = screen.getByLabelText(/edit/i);
    await user.click(editButton);

    await waitFor(async () => {
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it.skip("handles API error during update", async () => {
    const user = userEvent.setup();

    // Mock error response
    server.use(
      http.put("http://localhost:9090/todos/:id", () => {
        return HttpResponse.json({ message: "Update failed" }, { status: 500 });
      })
    );

    renderWithProvider();

    const editButton = screen.getByLabelText(/edit/i);
    await user.click(editButton);

    await waitFor(async () => {
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);
      await user.type(nameInput, "Updated text");

      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);
    });

    // Dialog should stay open on error
    await waitFor(() => {
      expect(screen.getByText(/edit todo/i)).toBeInTheDocument();
    });
  });

  it.skip("shows validation error for empty text", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const editButton = screen.getByLabelText(/edit/i);
    await user.click(editButton);

    await waitFor(async () => {
      const nameInput = screen.getByLabelText(/name/i);
      await user.clear(nameInput);

      const updateButton = screen.getByRole("button", { name: /update/i });
      await user.click(updateButton);
    });

    // Form should still be visible if validation failed
    await waitFor(() => {
      expect(screen.getByText(/edit todo/i)).toBeInTheDocument();
    });
  });

  it.skip("allows changing priority", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const editButton = screen.getByLabelText(/edit/i);
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText(/priority/i)).toBeInTheDocument();
    });
  });

  it.skip("allows changing due date", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const editButton = screen.getByLabelText(/edit/i);
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText(/due date/i)).toBeInTheDocument();
    });
  });
});
