import axios, { AxiosError } from "axios";
import { API_URL } from "@/config";
import { toast } from "sonner";

export const getAverages = async (setMetricData: (data: any) => void) => {
  try {
    const { data } = await axios.get(`${API_URL}/averages`, {
      timeout: 10000, // 10 second timeout
    });
    setMetricData(data);
  } catch (error) {
    console.error("Failed to fetch averages:", error);

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        toast.error("Request timeout. Please try again.");
      } else if (error.response) {
        toast.error(
          `Failed to fetch metrics: ${
            error.response.data?.message || error.message
          }`
        );
      } else if (error.request) {
        toast.error("Cannot connect to server. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } else {
      toast.error("An unexpected error occurred.");
    }
  }
};

type Priority = "HIGH" | "MEDIUM" | "LOW";

interface Todo {
  id: string;
  text: string;
  dueDate?: Date;
  done: boolean;
  doneDate?: Date;
  priority: Priority[];
  creationDate: Date;
}
interface FetchTodosParams {
  page?: number;
  size?: number;
  status?: ("done" | "undone")[];
  text?: string;
  priority?: Priority[];
  sortBy?: "priority" | "dueDate" | "priority_desc" | "dueDate_desc";
}
interface PaginatedTodos {
  todos: Todo[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
export async function fetchTodos(
  params: FetchTodosParams = {}
): Promise<PaginatedTodos> {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.append("page", params.page.toString());
  if (params.size !== undefined) query.append("size", params.size.toString());
  if (params.status && Array.isArray(params.status)) {
    params.status.forEach((p) => query.append("status", p));
  }
  if (params.text) query.append("text", params.text);
  if (params.priority && Array.isArray(params.priority)) {
    params.priority.forEach((p) => {
      query.append("priority", p);
    });
  }
  if (params.sortBy) query.append("sortBy", params.sortBy);

  const url = `${API_URL}?${query.toString()}`;

  try {
    const { data: raw } = await axios.get(url, {
      timeout: 10000, // 10 second timeout
    });

    // Handle empty response
    if (!raw || !raw.todos) {
      toast.error("Invalid response from server");
      return {
        todos: [],
        page: 0,
        size: 10,
        total: 0,
        totalPages: 0,
      };
    }

    return {
      todos: raw.todos.map(
        (todo: any): Todo => ({
          ...todo,
          dueDate: todo.dueDate
            ? new Date(todo.dueDate + "T00:00:00")
            : undefined,
          doneDate: todo.doneDate
            ? new Date(todo.doneDate + "T00:00:00")
            : undefined,
          creationDate: new Date(todo.creationDate),
          priority: todo.priority.toLowerCase(),
        })
      ),
      page: raw.page,
      size: raw.size,
      total: raw.total,
      totalPages: raw.totalPages,
    };
  } catch (error) {
    console.error("Failed to fetch todos:", error);

    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        toast.error("Request timeout. Please try again.");
      } else if (error.response) {
        const errorMessage =
          error.response.data?.message || "Failed to fetch todos";
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("Cannot connect to server. Please check your connection.");
      } else {
        toast.error("An unexpected error occurred while fetching todos.");
      }
    } else {
      toast.error("An unexpected error occurred.");
    }

    // Return empty result on error
    return {
      todos: [],
      page: 0,
      size: 10,
      total: 0,
      totalPages: 0,
    };
  }
}
