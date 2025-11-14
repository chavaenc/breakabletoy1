"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ArrowUpDown, TrashIcon } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import UpdateTodo from "./updateTodo";
import { markDone, markUndone } from "./api/updateTodo";
import { deleteTodo } from "./api/deleteTodo";
import { useTodos } from "./TodosContext";
import { toast } from "sonner";

export type Todo = {
  id: string;
  text: string;
  dueDate: Date | null;
  done: boolean;
  priority: "high" | "low" | "medium";
  creationDate: Date;
  doneDate: Date | null;
};

export function getColumns(): ColumnDef<Todo>[] {
  return [
    {
      id: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => <StatusCell todo={row.original} />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "text",
      header: () => <div className="text-center">Name</div>,
      cell: ({ row }) => {
        return <div className="text-center">{row.original.text}</div>;
      },
    },
    {
      accessorKey: "priority",
      header: () => <PriorityHeader />,
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        const priorityLower = priority.toLowerCase();

        let colorClass = "";

        if (priorityLower === "high") {
          colorClass =
            "bg-red-200 text-red-900 hover:bg-red-300 dark:bg-red-900 dark:text-red-100";
        } else if (priorityLower === "medium") {
          colorClass =
            "bg-yellow-200 text-yellow-900 hover:bg-yellow-300 dark:bg-yellow-900 dark:text-yellow-100";
        } else {
          colorClass =
            "bg-green-200 text-green-900 hover:bg-green-300 dark:bg-green-900 dark:text-green-100";
        }

        return (
          <div className="flex justify-center">
            <Badge className={colorClass}>{priority}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: () => <DueDateHeader />,
      cell: ({ row }) => {
        if (row.getValue("dueDate")) {
          const dueDate = new Date(row.getValue("dueDate"));
          const dateStr = dueDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          // Calculate urgency based on time remaining
          const weekMs = 604800000; // 1 week in milliseconds
          const dueTime = dueDate.getTime();
          const now = Date.now();
          const timeRemaining = dueTime - now;

          let colorClass = "";

          if (timeRemaining < weekMs) {
            // Due within 1 week - Red
            colorClass =
              "bg-red-200 text-red-900 hover:bg-red-300 dark:bg-red-900 dark:text-red-100";
          } else if (timeRemaining < 2 * weekMs) {
            // Due within 2 weeks - Yellow
            colorClass =
              "bg-yellow-200 text-yellow-900 hover:bg-yellow-300 dark:bg-yellow-900 dark:text-yellow-100";
          } else {
            // Due after 2 weeks - Green
            colorClass =
              "bg-green-200 text-green-900 hover:bg-green-300 dark:bg-green-900 dark:text-green-100";
          }

          return (
            <div className="flex justify-center">
              <Badge className={colorClass}>{dateStr}</Badge>
            </div>
          );
        } else {
          return (
            <div className="flex justify-center">
              <Badge variant="outline" className="text-muted-foreground">
                No due date
              </Badge>
            </div>
          );
        }
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionsCell todo={row.original} />,
    },
  ];
}

// Extracted components that use the context
function StatusCell({ todo }: { todo: Todo }) {
  const { refreshTodos, refreshAverages } = useTodos();

  const handleChange = async (checked: boolean) => {
    try {
      if (checked) {
        await markDone(todo.id);
      } else {
        await markUndone(todo.id);
      }
      await refreshTodos();
      refreshAverages();
      toast.success(
        checked ? "Todo marked as done!" : "Todo marked as undone!"
      );
    } catch (err) {
      toast.error("Failed to update todo status");
      console.error("Failed to update todo status:", err);
    }
  };

  if (todo.done) {
    return (
      <div className="flex justify-center">
        <Badge
          className="bg-green-200 text-green-900 hover:bg-green-300 dark:bg-green-900 dark:text-green-100 cursor-pointer"
          onClick={() => handleChange(false)}
        >
          Done
        </Badge>
      </div>
    );
  }

  return (
    <Checkbox
      checked={todo.done}
      onCheckedChange={handleChange}
      aria-label="Mark as done"
    />
  );
}

function PriorityHeader() {
  const { sortBy, setSortBy } = useTodos();

  const handleClick = () => {
    let newSort: "" | "priority" | "priority_desc" = "";
    if (sortBy === "") {
      newSort = "priority_desc";
    } else if (sortBy === "priority_desc") {
      newSort = "priority";
    } else {
      newSort = "";
    }
    setSortBy(newSort);
  };

  return (
    <div className="text-center">
      <Button className="text-center" variant="ghost" onClick={handleClick}>
        Priority
        <ArrowUpDown className="ml-2 h-4 w-4 text-center" />
      </Button>
    </div>
  );
}

function DueDateHeader() {
  const { sortBy, setSortBy } = useTodos();

  const handleClick = () => {
    let newSort: "" | "dueDate" | "dueDate_desc" = "";
    if (sortBy === "") {
      newSort = "dueDate_desc";
    } else if (sortBy === "dueDate_desc") {
      newSort = "dueDate";
    } else {
      newSort = "";
    }
    setSortBy(newSort);
  };

  return (
    <div className="text-center">
      <Button variant="ghost" onClick={handleClick}>
        Due Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function ActionsCell({ todo }: { todo: Todo }) {
  const { refreshTodos, setMetricData, refreshAverages } = useTodos();

  return (
    <div className="flex gap-1 p-1">
      <Button
        onClick={() => {
          deleteTodo(refreshTodos, setMetricData, todo.id, refreshAverages);
        }}
        variant="outline"
        className="h-5 w-5 p-3"
      >
        <TrashIcon className="text-red-400" />
      </Button>
      <UpdateTodo
        id={todo.id}
        otext={todo.text}
        odueDate={todo.dueDate}
        opriority={todo.priority}
      />
    </div>
  );
}
