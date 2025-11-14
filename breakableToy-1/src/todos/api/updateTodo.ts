import axios, { AxiosError } from "axios";
import { API_URL } from "@/config";
import { toast } from "sonner";

export async function updateTodo(
  id: string,
  updatedTodo: {
    text: string;
    dueDate?: string; // "YYYY-MM-DD"
    priority: "HIGH" | "MEDIUM" | "LOW";
  },
  onSuccess: () => Promise<void>
) {
  try {
    await axios.put(`${API_URL}/${id}`, updatedTodo, {
      timeout: 10000, // 10 second timeout
    });
    await onSuccess();
    toast.success("Todo updated successfully!");
  } catch (err) {
    console.error("Error updating todo:", err);

    let errorMessage = "Failed to update todo";

    if (axios.isAxiosError(err)) {
      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please try again.";
      } else if (err.response) {
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          errorMessage;
      } else if (err.request) {
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      }
    }

    toast.error(errorMessage);
    throw err;
  }
}

export async function markDone(id: string) {
  try {
    const response = await axios.post(
      `${API_URL}/${id}/done`,
      {},
      {
        timeout: 10000,
      }
    );
    return response;
  } catch (err) {
    console.error("Error marking todo as done:", err);

    let errorMessage = "Failed to mark todo as done";

    if (axios.isAxiosError(err)) {
      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please try again.";
      } else if (err.response) {
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          errorMessage;
      } else if (err.request) {
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      }
    }

    toast.error(errorMessage);
    throw err;
  }
}

export async function markUndone(id: string) {
  try {
    const response = await axios.put(
      `${API_URL}/${id}/undone`,
      {},
      {
        timeout: 10000,
      }
    );
    return response;
  } catch (err) {
    console.error("Error marking todo as undone:", err);

    let errorMessage = "Failed to mark todo as undone";

    if (axios.isAxiosError(err)) {
      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please try again.";
      } else if (err.response) {
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          errorMessage;
      } else if (err.request) {
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      }
    }

    toast.error(errorMessage);
    throw err;
  }
}
