import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { fetchTodos as apiFetchTodos, getAverages } from "./api/fetchTodos";

// Use a unified Todo type compatible with both API and UI
export type Todo = {
  id: string;
  text: string;
  dueDate: Date | null;
  done: boolean;
  priority: "high" | "low" | "medium";
  creationDate: Date;
  doneDate: Date | null;
};

type Priority = "HIGH" | "MEDIUM" | "LOW";
type Status = "done" | "undone";
type SortBy = "priority" | "dueDate" | "priority_desc" | "dueDate_desc" | "";

interface MetricData {
  averageTime?: number;
  byPriority?: {
    low?: number;
    medium?: number;
    high?: number;
  };
}

interface TodosContextType {
  // State
  rows: Todo[];
  page: number;
  priority: Priority[];
  total: number | undefined;
  totalPages: number;
  status: Status[];
  text: string;
  sortBy: SortBy;
  metricData: MetricData | undefined;

  // Setters
  setRows: React.Dispatch<React.SetStateAction<Todo[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setPriority: React.Dispatch<React.SetStateAction<Priority[]>>;
  setTotal: React.Dispatch<React.SetStateAction<number | undefined>>;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<Status[]>>;
  setText: React.Dispatch<React.SetStateAction<string>>;
  setSortBy: React.Dispatch<React.SetStateAction<SortBy>>;
  setMetricData: React.Dispatch<React.SetStateAction<MetricData | undefined>>;

  // Functions
  fetchTodos: typeof apiFetchTodos;
  refreshTodos: () => Promise<void>;
  refreshAverages: () => void;
}

const TodosContext = createContext<TodosContextType | undefined>(undefined);

export function TodosProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<Todo[]>([]);
  const [page, setPage] = useState(0);
  const [priority, setPriority] = useState<Priority[]>([
    "HIGH",
    "MEDIUM",
    "LOW",
  ]);
  const [total, setTotal] = useState<number | undefined>();
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState<Status[]>(["done", "undone"]);
  const [text, setText] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("");
  const [metricData, setMetricData] = useState<MetricData | undefined>();

  // Refresh todos with current filters
  const refreshTodos = useCallback(async () => {
    const sortByParam =
      sortBy === ""
        ? undefined
        : (sortBy as "priority" | "dueDate" | "priority_desc" | "dueDate_desc");
    const data = await apiFetchTodos({
      page,
      status,
      priority,
      text,
      sortBy: sortByParam,
    });
    // Map the API response to our Todo type
    setRows(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.todos.map((todo: any) => ({
        id: todo.id,
        text: todo.text,
        dueDate: todo.dueDate ?? null,
        done: todo.done,
        doneDate: todo.doneDate ?? null,
        priority: todo.priority as "high" | "low" | "medium",
        creationDate: todo.creationDate,
      }))
    );
    setTotalPages(data.totalPages);
    setTotal(data.total);
  }, [page, status, priority, text, sortBy]);

  // Refresh averages
  const refreshAverages = useCallback(() => {
    getAverages(setMetricData);
  }, []);

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      await refreshTodos();
      refreshAverages();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: TodosContextType = {
    // State
    rows,
    page,
    priority,
    total,
    totalPages,
    status,
    text,
    sortBy,
    metricData,

    // Setters
    setRows,
    setPage,
    setPriority,
    setTotal,
    setTotalPages,
    setStatus,
    setText,
    setSortBy,
    setMetricData,

    // Functions
    fetchTodos: apiFetchTodos,
    refreshTodos,
    refreshAverages,
  };

  return (
    <TodosContext.Provider value={value}>{children}</TodosContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodosContext);
  if (context === undefined) {
    throw new Error("useTodos must be used within a TodosProvider");
  }
  return context;
}
