import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { server } from "../mocks/server";
import { TodosProvider } from "@/todos/TodosContext";
import Filters from "@/todos/filters";

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("Filters Component", () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<TodosProvider>{component}</TodosProvider>);
  };

  it("renders search input", () => {
    renderWithProvider(<Filters />);
    const searchInput = screen.getByPlaceholderText(/search todos/i);
    expect(searchInput).toBeInTheDocument();
  });

  it("allows typing in search input", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Filters />);

    const searchInput = screen.getByPlaceholderText(/search todos/i);
    await user.type(searchInput, "test todo");

    expect(searchInput).toHaveValue("test todo");
  });

  it("renders priority dropdown", () => {
    renderWithProvider(<Filters />);
    // Button shows selected priorities, not the word "priority"
    const priorityButton = screen.getByRole("button", {
      name: /high.*medium.*low/i,
    });
    expect(priorityButton).toBeInTheDocument();
  });

  it("renders status dropdown", () => {
    renderWithProvider(<Filters />);
    // Button shows selected statuses, not the word "status"
    const statusButton = screen.getByRole("button", { name: /done.*undone/i });
    expect(statusButton).toBeInTheDocument();
  });
});
