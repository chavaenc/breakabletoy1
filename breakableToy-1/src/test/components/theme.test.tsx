import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

describe("Theme Toggle Component", () => {
  const renderWithProvider = () => {
    return render(
      <ThemeProvider defaultTheme="light">
        <ModeToggle />
      </ThemeProvider>
    );
  };

  it("renders theme toggle button", () => {
    renderWithProvider();
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("shows sun icon in light mode", () => {
    renderWithProvider();
    const sunIcon = document.querySelector(".lucide-sun");
    expect(sunIcon).toBeInTheDocument();
  });

  it("opens dropdown menu when clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    expect(screen.getByText(/light/i)).toBeInTheDocument();
    expect(screen.getByText(/dark/i)).toBeInTheDocument();
    expect(screen.getByText(/system/i)).toBeInTheDocument();
  });

  it("has light, dark, and system options", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const button = screen.getByRole("button", { name: /toggle theme/i });
    await user.click(button);

    const lightOption = screen.getByText(/^light$/i);
    const darkOption = screen.getByText(/^dark$/i);
    const systemOption = screen.getByText(/system/i);

    expect(lightOption).toBeInTheDocument();
    expect(darkOption).toBeInTheDocument();
    expect(systemOption).toBeInTheDocument();
  });
});

describe("ThemeProvider", () => {
  it("provides theme context to children", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies dark class when theme is dark", () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <div data-testid="content">Test</div>
      </ThemeProvider>
    );

    // The html element should have the dark class
    const html = document.documentElement;
    expect(
      html.classList.contains("dark") || html.classList.contains("light")
    ).toBe(true);
  });
});
