"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

import * as React from "react";
import CreateTodo from "./createTodo";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { markDone, markUndone } from "./api/updateTodo";
import { deleteTodo } from "./api/deleteTodo";
import UpdateTodo from "./updateTodo";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { useEffect } from "react";
import Filters from "./filters";
import { getColumns } from "./columns";
import { useTodos } from "./TodosContext";

export function DataTable() {
  const {
    rows,
    page,
    setPage,
    totalPages,
    metricData,
    refreshTodos,
    refreshAverages,
    setSortBy,
  } = useTodos();

  const table = useReactTable({
    data: rows,
    columns: getColumns(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const [activePrioritySort, setActivePrioritySort] = React.useState<
    "" | "asc" | "desc"
  >("");
  const [activeDateSort, setActiveDateSort] = React.useState<
    "" | "asc" | "desc"
  >("");

  useEffect(() => {
    refreshTodos();
    refreshAverages();
  }, [page, refreshTodos, refreshAverages]);

  return (
    <div>
      <Filters />
      <div className="mb-4">
        {/* Desktop Create Todo */}
        <div className="hidden md:block">
          <CreateTodo />
        </div>

        {/* Mobile Sort Controls */}
        <div className="md:hidden flex gap-2 justify-end">
          <Button
            variant={activePrioritySort !== "" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              let newOrder: "" | "asc" | "desc" = "";
              if (activePrioritySort === "") {
                newOrder = "desc";
              } else if (activePrioritySort === "desc") {
                newOrder = "asc";
              } else {
                newOrder = "";
              }
              setActivePrioritySort(newOrder);
              setActiveDateSort("");
              setSortBy(
                (newOrder === "desc"
                  ? "priority_desc"
                  : newOrder === "asc"
                  ? "priority"
                  : "") as
                  | "priority"
                  | "dueDate"
                  | "priority_desc"
                  | "dueDate_desc"
              );
            }}
            className="transition-all"
          >
            Priority{" "}
            {activePrioritySort === "desc"
              ? "↓"
              : activePrioritySort === "asc"
              ? "↑"
              : ""}
          </Button>
          <Button
            variant={activeDateSort !== "" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              let newOrder: "" | "asc" | "desc" = "";
              if (activeDateSort === "") {
                newOrder = "desc";
              } else if (activeDateSort === "desc") {
                newOrder = "asc";
              } else {
                newOrder = "";
              }
              setActiveDateSort(newOrder);
              setActivePrioritySort("");
              setSortBy(
                (newOrder === "desc"
                  ? "dueDate_desc"
                  : newOrder === "asc"
                  ? "dueDate"
                  : "") as
                  | "priority"
                  | "dueDate"
                  | "priority_desc"
                  | "dueDate_desc"
              );
            }}
            className="transition-all"
          >
            Date{" "}
            {activeDateSort === "desc"
              ? "↓"
              : activeDateSort === "asc"
              ? "↑"
              : ""}
          </Button>
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <CreateTodo isMobileFloating={true} />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border mx-auto w-full overflow-x-auto">
        <Table className="px-0 min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  if (header.id == "text") {
                    return (
                      <TableHead key={header.id} className="text-center  w-1/3">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  } else {
                    return (
                      <TableHead key={header.id} className="text-center">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  }
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const todo = row.original;

                return (
                  <TableRow
                    key={row.id}
                    className={todo.done ? "opacity-50" : ""}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const shouldStrikethrough =
                        todo.done &&
                        !["status", "actions"].includes(cell.column.id);

                      return (
                        <TableCell
                          key={cell.id}
                          className={shouldStrikethrough ? "line-through" : ""}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const todo = row.original;
            const priorityLower = todo.priority.toLowerCase();

            let priorityColor = "";
            if (priorityLower === "high") {
              priorityColor =
                "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100";
            } else if (priorityLower === "medium") {
              priorityColor =
                "bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100";
            } else {
              priorityColor =
                "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100";
            }

            let dueDateColor = "";
            let dateStr = "";
            if (todo.dueDate) {
              const dueDate = new Date(todo.dueDate);
              dateStr = dueDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              const weekMs = 604800000;
              const dueTime = dueDate.getTime();
              const now = Date.now();
              const timeRemaining = dueTime - now;

              if (timeRemaining < weekMs) {
                dueDateColor =
                  "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100";
              } else if (timeRemaining < 2 * weekMs) {
                dueDateColor =
                  "bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100";
              } else {
                dueDateColor =
                  "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100";
              }
            }

            return (
              <div
                key={row.id}
                className={`border rounded-md p-2 bg-white dark:bg-gray-800 ${
                  todo.done ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  {todo.done ? (
                    <Badge
                      className="bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100 cursor-pointer text-xs px-1.5 py-0"
                      onClick={async () => {
                        try {
                          await markUndone(todo.id);
                          await refreshTodos();
                          refreshAverages();
                          toast.success("Todo marked as undone!");
                        } catch (err) {
                          toast.error("Failed to update todo status");
                          console.error("Failed to update todo status:", err);
                        }
                      }}
                    >
                      ✓
                    </Badge>
                  ) : (
                    <Checkbox
                      checked={todo.done}
                      onCheckedChange={async (checked) => {
                        try {
                          if (checked) {
                            await markDone(todo.id);
                          } else {
                            await markUndone(todo.id);
                          }
                          await refreshTodos();
                          refreshAverages();
                          toast.success(
                            checked
                              ? "Todo marked as done!"
                              : "Todo marked as undone!"
                          );
                        } catch (err) {
                          toast.error("Failed to update todo status");
                          console.error("Failed to update todo status:", err);
                        }
                      }}
                      aria-label="Mark as done"
                      className="shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium text-left ${
                        todo.done ? "line-through" : ""
                      }`}
                    >
                      {todo.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Badge className={`${priorityColor} text-xs px-1.5 py-0`}>
                      {priorityLower === "high"
                        ? "H"
                        : priorityLower === "medium"
                        ? "M"
                        : "L"}
                    </Badge>
                    {todo.dueDate && (
                      <Badge className={`${dueDateColor} text-xs px-1.5 py-0`}>
                        {dateStr}
                      </Badge>
                    )}
                    <Button
                      onClick={() => {
                        deleteTodo(
                          refreshTodos,
                          () => {},
                          todo.id,
                          refreshAverages
                        );
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <TrashIcon className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                    <UpdateTodo
                      id={todo.id}
                      otext={todo.text}
                      odueDate={todo.dueDate}
                      opriority={todo.priority}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No results.
          </div>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 0) {
                    setPage((prev) => prev - 1);
                  }
                }}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href={`?page=${i + 1}`}
                  isActive={i === page}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() =>
                  page + 1 < totalPages && setPage((prev) => prev + 1)
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 shadow-md rounded-md p-4 sm:p-6 space-y-4 md:space-y-0 md:space-x-6 justify-around items-start md:items-center border dark:border-gray-700">
        <div className="w-full md:w-auto">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Average Time to Finish Tasks
          </h3>
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {metricData?.averageTime?.toFixed(2)}
            </span>{" "}
            mins, (
            <span className="font-medium text-green-600 dark:text-green-400">
              {metricData?.averageTime
                ? (metricData.averageTime / 60).toPrecision(3)
                : 0}
            </span>{" "}
            hours or{" "}
            <span className="font-medium text-purple-600 dark:text-purple-400">
              {metricData?.averageTime
                ? (metricData.averageTime / 60 / 24).toPrecision(3)
                : 0}
            </span>{" "}
            days)
          </p>
        </div>

        <div className="w-full md:w-auto">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            Average Time by Priority
          </h3>
          <ul className="space-y-2">
            <li className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-yellow-500 dark:text-yellow-400">
                Low:
              </span>{" "}
              {metricData?.byPriority?.low?.toFixed(2)} mins (
              {metricData?.byPriority?.low
                ? (metricData.byPriority.low / 60).toPrecision(3)
                : 0}{" "}
              hours {" or "}
              {metricData?.byPriority?.low
                ? (metricData.byPriority.low / 60 / 24).toPrecision(3)
                : 0}{" "}
              days)
            </li>
            <li className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-blue-500 dark:text-blue-400">
                Medium:
              </span>{" "}
              {metricData?.byPriority?.medium?.toFixed(2)} mins (
              {metricData?.byPriority?.medium
                ? (metricData.byPriority.medium / 60).toPrecision(3)
                : 0}{" "}
              hours {" or "}
              {metricData?.byPriority?.medium
                ? (metricData.byPriority.medium / 60 / 24).toPrecision(3)
                : 0}{" "}
              days)
            </li>
            <li className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-red-500 dark:text-red-400">
                High:
              </span>{" "}
              {metricData?.byPriority?.high?.toFixed(2)} mins (
              {metricData?.byPriority?.high
                ? (metricData.byPriority.high / 60).toPrecision(3)
                : 0}{" "}
              hours {" or "}
              {metricData?.byPriority?.high
                ? (metricData.byPriority.high / 60 / 24).toPrecision(3)
                : 0}{" "}
              days)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
