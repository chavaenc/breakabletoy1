import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";
import App from "@/App";

describe("App Component", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <App />
      </ThemeProvider>
    );
    // Check for search input which is always visible
    expect(screen.getByPlaceholderText(/search todos/i)).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    render(
      <ThemeProvider defaultTheme="light">
        <App />
      </ThemeProvider>
    );
    // The theme toggle button should be present
    const themeButton = screen.getByRole("button", { name: /toggle theme/i });
    expect(themeButton).toBeInTheDocument();
  });
});
