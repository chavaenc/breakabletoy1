import axios, { AxiosError } from "axios";
import { API_URL } from "@/config";
import { toast } from "sonner";

export const deleteTodo = async (
  refreshTodos: () => Promise<void>,
  _setMetricData: unknown,
  id: string,
  refreshAverages: () => void
) => {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      timeout: 10000, // 10 second timeout
    });
    await refreshTodos();
    refreshAverages();
    toast.success("Todo deleted successfully!");
  } catch (err) {
    console.error("Delete failed:", err);

    let errorMessage = "Failed to delete todo";

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
};
