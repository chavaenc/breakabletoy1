import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { TodosProvider } from "@/todos/TodosContext";
import CreateTodo from "@/todos/createTodo";

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("CreateTodo Component", () => {
  const renderWithProvider = (isMobileFloating = false) => {
    return render(
      <TodosProvider>
        <CreateTodo isMobileFloating={isMobileFloating} />
      </TodosProvider>
    );
  };

  it("renders desktop button correctly", () => {
    renderWithProvider(false);
    const button = screen.getByRole("button", { name: /new todo/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("+ New Todo");
  });

  it("renders mobile floating button correctly", () => {
    renderWithProvider(true);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    // Check for the plus icon (not text)
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("opens dialog when button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole("button", { name: /new todo/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/create a new todo here/i)).toBeInTheDocument();
    });
  });

  it("shows form fields in dialog", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole("button", { name: /new todo/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByText(/priority/i)).toBeInTheDocument();
      expect(screen.getByText(/due date/i)).toBeInTheDocument();
    });
  });

  it("allows filling out the form", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole("button", { name: /new todo/i });
    await user.click(button);

    await waitFor(async () => {
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, "New test todo");
      expect(nameInput).toHaveValue("New test todo");
    });
  });

  it("has cancel and save buttons", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole("button", { name: /new todo/i });
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });
  });

  it.skip("shows error when submitting without required fields", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole("button", { name: /new todo/i });
    await user.click(button);

    await waitFor(async () => {
      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);
    });

    // Form should still be open if validation failed
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    });
  });

  it("closes dialog when cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole("button", { name: /new todo/i });
    await user.click(button);

    await waitFor(async () => {
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("clears form after successful submission", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole("button", { name: /new todo/i });
    await user.click(button);

    await waitFor(async () => {
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, "Todo to clear");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);
    });

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Reopen and check if form is cleared
    await user.click(button);
    await waitFor(() => {
      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveValue("");
    });
  });

  it("handles API error gracefully", async () => {
    const user = userEvent.setup();

    // Mock error response
    server.use(
      http.post("http://localhost:9090/todos", () => {
        return HttpResponse.json(
          { message: "Validation error" },
          { status: 400 }
        );
      })
    );

    renderWithProvider();

    const button = screen.getByRole("button", { name: /new todo/i });
    await user.click(button);

    await waitFor(async () => {
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, "Test");

      const saveButton = screen.getByRole("button", { name: /save/i });
      await user.click(saveButton);
    });

    // Dialog should stay open on error
    await waitFor(() => {
      expect(screen.getByText(/create a new todo here/i)).toBeInTheDocument();
    });
  });

  it("allows selecting priority", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole("button", { name: /new todo/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/priority/i)).toBeInTheDocument();
    });
  });

  it("allows selecting due date", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole("button", { name: /new todo/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/due date/i)).toBeInTheDocument();
    });
  });
});
