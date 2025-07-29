import { useEffect, useState } from "react";
import { columns, Todo } from "./columns";
import { DataTable } from "./data-table";

type Priority = "HIGH" | "MEDIUM" | "LOW";

interface Todo {
  id: string;
  text: string;
  dueDate?: Date;
  done: boolean;
  doneDate?: Date;
  priority: Priority;
  creationDate: Date;
}

interface FetchTodosParams {
  page?: number;
  size?: number;
  done?: boolean;
  text?: string;
  priority?: Priority;
  sortBy?: "priority" | "dueDate";
}
interface PaginatedTodos {
  todos: Todo[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
async function fetchTodos(
  params: FetchTodosParams = {}
): Promise<PaginatedTodos> {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.append("page", params.page.toString());
  if (params.size !== undefined) query.append("size", params.size.toString());
  if (params.done !== undefined) query.append("done", params.done.toString());
  if (params.text) query.append("text", params.text);
  if (params.priority) query.append("priority", params.priority);
  if (params.sortBy) query.append("sortBy", params.sortBy);

  console.log(query);
  const url = `http://localhost:8080/todos?${query.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch todos: ${response.status}`);
  }

  const raw = await response.json();

  return {
    todos: raw.todos.map(
      (todo: any): Todo => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        doneDate: todo.doneDate ? new Date(todo.doneDate) : undefined,
        creationDate: new Date(todo.creationDate),
        priority: todo.priority.toLowerCase(),
      })
    ),
    page: raw.page,
    size: raw.size,
    total: raw.total,
    totalPages: raw.totalPages,
  };
}

export default function DemoPage() {
  const [rows, setRows] = useState<Todo[]>([]);
  const [page, setPage] = useState();
  const [total, setTota] = useState();
  const [totalPages, setTotalPages] = useState();

  useEffect(() => {
    fetchTodos({ page }).then((data) => {
      setRows(data.todos);
    });
  }, []);

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        rows={rows}
        setRows={setRows}
        page={page}
        total={total}
        totalPages={totalPages}
        fetchTodos={fetchTodos}
      />
    </div>
  );
}
