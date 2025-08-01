"use client";
import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../components/ui/button";
import { ArrowUpDown, Check, PencilIcon, TrashIcon } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import UpdateTodo from "./updateTodo";
import { markDone, markUndone } from "./api/updateTodo";
import { deleteTodo } from "./api/deleteTodo";
import { setPriority } from "os";
type ColumnsProps = {
  setRows: React.Dispatch<React.SetStateAction<Todo[]>>;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  fetchTodos: any;
  getAverages: any;
  setMetricData: any;
  metricData: any;
  sortBy: any;
  setSortBy: any;
  text: string;
  status: any;
  page: any;
  priority: any;
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
let order: "" | "_desc" = "";
let dateOrder: "" | "_desc" = "";
let newSort = "";

export function getColumns({
  setRows,
  setTotalPages,
  fetchTodos,
  getAverages,
  setMetricData,
  metricData,
  sortBy,
  setSortBy,
  text,
  priority,
  status,
  page,
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
              markDone(todo.id);
            } else {
              markUndone(todo.id);
            }

            const updated = await fetchTodos({
              text,
              priority,
              status,
              page,
              sortBy,
            });
            setRows(updated.todos);
            setTotalPages(updated.totalPages);
            getAverages();
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
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              className="text-center"
              variant="ghost"
              onClick={async () => {
                order = order === "" ? "_desc" : "";

                newSort = "priority" + order;
                setSortBy(newSort);
                const data = await fetchTodos({
                  text,
                  page,
                  status,
                  priority,
                  sortBy: newSort,
                });
                setRows(data.todos);
              }}
            >
              {" "}
              Priority
              <ArrowUpDown className="ml-2 h-4 w-4 text-center" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return <div className="">{row.getValue("priority")}</div>;
      },
    },
    {
      accessorKey: "dueDate",
      sortingFn: "datetime",
      header: ({ column }) => {
        return (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={async () => {
                dateOrder = dateOrder === "" ? "_desc" : "";
                newSort = "dueDate" + dateOrder;
                setSortBy(newSort);
                const data = await fetchTodos({
                  text,
                  page,
                  status,
                  priority,
                  sortBy: newSort,
                });
                setRows(data.todos);
              }}
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
        const otext = row.original.text;
        const odueDate = row.original.dueDate;
        const opriority = row.original.priority;

        return (
          <>
            <div className="flex gap-1 p-1">
              <Button
                onClick={() => {
                  deleteTodo(
                    fetchTodos,
                    setRows,
                    setTotalPages,
                    id,
                    status,
                    priority,
                    page,
                    text,
                    sortBy
                  );
                }}
                variant="outline"
                className="h-5 w-5 p-3"
              >
                <TrashIcon className="text-red-400" />
              </Button>
              <UpdateTodo
                id={id}
                fetchTodos={fetchTodos}
                otext={otext}
                odueDate={odueDate}
                opriority={opriority}
                setRows={setRows}
                setTotalPages={setTotalPages}
                status={status}
                priorityFilter={priority}
                page={page}
                textFilter={text}
                sortBy={sortBy}
              />
            </div>
          </>
        );
      },
    },
  ];
}
