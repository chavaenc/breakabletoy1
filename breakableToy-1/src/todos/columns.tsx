"use client";
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../components/ui/button";
import { ArrowUpDown, Check, PencilIcon, TrashIcon } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import UpdateTodo from "./updateTodo";
type ColumnsProps = {
  setRows: React.Dispatch<React.SetStateAction<Todo[]>>;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  fetchTodos: any;
};
export type Todo = {
  id: string;
  text: string;
  dueDate: Date | null;
  done: boolean;
  priority: "high" | "low" | "medium";
  creationDate: Date;
  doneDate: Date | null;
};

async function markDone(id: string) {
  await fetch(`http://localhost:8080/todos/${id}/done`, {
    method: "POST",
  });
}

async function markUndone(id: string) {
  await fetch(`http://localhost:8080/todos/${id}/undone`, {
    method: "PUT",
  });
}

export function getColumns({
  setRows,
  setTotalPages,
  fetchTodos,
}: ColumnsProps): ColumnDef<Todo>[] {
  return [
    {
      id: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const todo = row.original;
        const isChecked = todo.done;

        const handleChange = async (checked: boolean) => {
          try {
            if (checked) {
              await fetch(`http://localhost:8080/todos/${todo.id}/done`, {
                method: "POST",
              });
            } else {
              await fetch(`http://localhost:8080/todos/${todo.id}/undone`, {
                method: "PUT",
              });
            }

            const updated = await fetchTodos();
            setRows(updated.todos);
            setTotalPages(updated.totalPages);
          } catch (err) {
            console.error("Failed to update todo status:", err);
          }
        };

        console.log("STATUs", row.original.done);
        return (
          <Checkbox
            checked={todo.done}
            onCheckedChange={() => handleChange(!todo.done)}
            aria-label="Mark as done"
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: "text",
      header: () => <div className="text-center">Name</div>,
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <div className="text-center">
          <Button
            className="text-center"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {" "}
            Priority
            <ArrowUpDown className="ml-2 h-4 w-4 text-center" />
          </Button>
        </div>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        if (rowA.original.priority === "high") {
          if (rowB.original.priority === "medium") {
            return 1;
          } else if (rowB.original.priority === "low") {
            return 1;
          } else {
            return 0;
          }
        } else if (rowA.original.priority === "medium") {
          if (rowB.original.priority === "high") {
            return -1;
          } else if (rowB.original.priority === "low") {
            return 1;
          } else {
            return 0;
          }
        } else if (rowA.original.priority === "low") {
          if (rowB.original.priority === "high") {
            return -1;
          } else if (rowB.original.priority === "medium") {
            return -1;
          } else {
            return 0;
          }
        }
        return 0;
      },
      cell: ({ row }) => {
        let backgroundColor = "";
        switch (row.getValue("priority")) {
          case "low":
            backgroundColor = "green";
            break;
          case "medium":
            backgroundColor = "yellow";
            break;
          case "high":
            backgroundColor = "red";
            break;
          default:
            backgroundColor = "white";
            break;
        }
        return <div className="">{row.getValue("priority")}</div>;
      },
      filterFn: "arrIncludesSome",
    },
    {
      accessorKey: "dueDate",
      sortingFn: "datetime",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              {" "}
              Due Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        if (row.getValue("dueDate")) {
          const date = new Date(row.getValue("dueDate"));
          const formatted =
            date.getMonth() +
            1 +
            "/" +
            date.getDay() +
            "/" +
            date.getFullYear();
          return <div className="font-medium">{formatted}</div>;
        } else {
          return <div>No due date</div>;
        }
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id;
        const text = row.original.text;
        const dueDate = row.original.dueDate;
        const priority = row.original.priority;

        return (
          <>
            <div className="flex gap-1 p-1">
              <Button
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `http://localhost:8080/todos/${id}`,
                      {
                        method: "DELETE",
                      }
                    );

                    if (!res.ok) {
                      const msg = await res.text();
                      throw new Error(msg || "Failed to delete");
                    }

                    const updated = await fetchTodos();
                    setRows(updated.todos);
                    setTotalPages(updated.totalPages);
                  } catch (err) {
                    console.error("Delete failed:", err);
                  }
                }}
                variant="outline"
                className="h-5 w-5 p-3"
              >
                <TrashIcon className="text-red-400" />
              </Button>
              <UpdateTodo
                id={id}
                fetchTodos={fetchTodos}
                otext={text}
                odueDate={dueDate}
                opriority={priority}
                setRows={setRows}
                setTotalPages={setTotalPages}
              />
            </div>
          </>
        );
      },
    },
  ];
}
