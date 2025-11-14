import axios, { AxiosError } from "axios";
import { API_URL } from "@/config";
import { toast } from "sonner";

interface PostTodoParams {
  setText: (text: string) => void;
  setPriority: (priority: "" | "HIGH" | "MEDIUM" | "LOW") => void;
  setError: (error: string) => void;
  setDialogOpen: (open: boolean) => void;
  setData: (data: any) => void;
  setTotalPages: (pages: number) => void;
  fetchTodos: () => Promise<void>;
  setDate: (date: Date | undefined) => void;
  text: string;
  priority: string;
  date: Date | undefined;
}

export const postTodo = async ({
  setText,
  setPriority,
  setError,
  setDialogOpen,
  fetchTodos,
  setDate,
  text,
  priority,
  date,
}: PostTodoParams) => {
  try {
    // Format date manually to avoid timezone issues
    const formattedDate = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`
      : undefined;

    await axios.post(
      `${API_URL}`,
      {
        text: text,
        dueDate: formattedDate,
        priority: priority || undefined,
      },
      {
        timeout: 10000, // 10 second timeout
      }
    );

    setText("");
    setDate(undefined);
    setPriority("");
    setError("");
    setDialogOpen(false);
    await fetchTodos();
    toast.success("Todo created successfully!");
  } catch (err: any) {
    console.error("Failed to create todo:", err);

    let errorMessage = "Failed to create todo";

    if (axios.isAxiosError(err)) {
      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please try again.";
      } else if (err.response) {
        // Extract error message from backend response
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          errorMessage;
      } else if (err.request) {
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      }
    }

    setError(errorMessage);
    toast.error(errorMessage);
    throw err; // Re-throw so the calling function can handle it
  }
};
