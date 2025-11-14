import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import { DropdownMenuPriority } from "./dropdown-menu-priority";
import { DropdownMenuStatus } from "./dropdown-menu-status";
import { useTodos } from "./TodosContext";

export default function Filters() {
  const {
    text,
    setText,
    fetchTodos,
    setPage,
    setTotalPages,
    setRows,
    priority,
    status,
    sortBy,
  } = useTodos();

  const getFilteredTodos = async (newText: string) => {
    const previewRes = await fetchTodos({
      text: newText,
      status,
      priority,
      page: 0,
      sortBy:
        sortBy === ""
          ? undefined
          : (sortBy as
              | "priority"
              | "dueDate"
              | "priority_desc"
              | "dueDate_desc"),
    });

    const validTotalPages = previewRes.totalPages;
    const validPage = Math.min(0, validTotalPages - 1);

    setRows(
      previewRes.todos.map((todo) => ({
        id: todo.id,
        text: todo.text,
        dueDate: todo.dueDate ?? null,
        done: todo.done,
        doneDate: todo.doneDate ?? null,
        priority: (typeof todo.priority === "string"
          ? todo.priority
          : todo.priority[0]) as "high" | "low" | "medium",
        creationDate: todo.creationDate,
      }))
    );
    setTotalPages(validTotalPages);
    setPage(validPage);
  };

  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search todos..."
          value={text}
          onChange={(e) => {
            const newText = e.target.value;
            setText(newText);
            getFilteredTodos(newText);
          }}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2">
        <DropdownMenuPriority />
        <DropdownMenuStatus />
      </div>
    </div>
  );
}
