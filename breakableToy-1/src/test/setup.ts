import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll } from "vitest";

// Suppress happy-dom abort errors during cleanup
const originalConsoleError = console.error;
const originalUnhandledRejection = process.listeners("unhandledRejection");

beforeAll(() => {
  // Suppress console errors from AbortError
  console.error = (...args: unknown[]) => {
    const message = String(args[0]);
    if (
      message.includes("AbortError") ||
      message.includes("The operation was aborted") ||
      message.includes("NetworkError") ||
      message.includes("Request aborted") ||
      message.includes("ECONNABORTED") ||
      message.includes("socket hang up") ||
      message.includes("ECONNRESET")
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  // Suppress unhandled promise rejections from AbortError
  process.removeAllListeners("unhandledRejection");
  process.on("unhandledRejection", (reason: Error | { code?: string }) => {
    const message = reason?.message || String(reason);
    const code =
      typeof reason === "object" && "code" in reason ? reason.code : "";

    // Only ignore abort-related errors from happy-dom cleanup
    if (
      message.includes("aborted") ||
      message.includes("AbortError") ||
      message.includes("NetworkError") ||
      message.includes("Request aborted") ||
      code === "ECONNABORTED" ||
      code === "ECONNRESET" ||
      code === "ERR_BAD_RESPONSE"
    ) {
      return;
    }
    // Re-throw other errors
    throw reason;
  });
});

afterAll(() => {
  console.error = originalConsoleError;
  // Restore original unhandled rejection listeners
  process.removeAllListeners("unhandledRejection");
  originalUnhandledRejection.forEach((listener) => {
    process.on(
      "unhandledRejection",
      listener as NodeJS.UnhandledRejectionListener
    );
  });
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
