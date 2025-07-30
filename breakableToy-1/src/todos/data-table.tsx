"use client";

import { useFormStatus } from "react-dom";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import * as React from "react";
import CreateTodo from "./createTodo";
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { useEffect, useState } from "react";
import Filters from "./filters";
import { Button } from "../components/ui/button";
import { getColumns, type Todo } from "./columns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setRows: any;
  priority: any;
  setPriority: any;
  done: any;
  text: any;
  setDone: any;
  setText: any;
}

export function DataTable<TData, TValue>({
  columns,
  rows,
  setRows,
  text,
  setText,
  total,
  fetchTodos,
  priority,
  setPriority,
  status,
  setStatus,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [totalPages, setTotalPages] = useState(0);
  const table = useReactTable({
    data: rows,
    columns: getColumns({
      setRows,
      setTotalPages,
      fetchTodos: () => fetchTodos({ text, page, status, priority }),
    }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  interface Todo {
    id: number;
    name: string;
    priority: string;
    dueDate: string;
    doneDate: string;
    creationDate: string;
    status: string;
  }

  async function updateTodo(
    id: string,
    updatedTodo: {
      text: string;
      dueDate?: string; // "YYYY-MM-DD"
      priority: "HIGH" | "MEDIUM" | "LOW";
    }
  ) {
    try {
      const response = await fetch(`http://localhost:8080/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update todo: ${errorText}`);
      }

      const result = await response.json();
      console.log("Updated todo:", result);
      return result;
    } catch (err) {
      console.error("Error:", err);
    }
  }

  const [page, setPage] = useState(0);
  useEffect(() => {
    fetchTodos({ page, priority, status }).then((data) => {
      setRows(data.todos);
      setTotalPages(data.totalPages);
    });
  }, [page]);

  return (
    <div>
      <Filters
        table={table}
        priority={priority}
        setPriority={setPriority}
        fetchTodos={fetchTodos}
        text={text}
        setTotalPages={setTotalPages}
        status={status}
        setStatus={setStatus}
        page={page}
        setData={setRows}
        setText={setText}
      />
      <CreateTodo
        setData={setRows}
        fetchTodos={() => fetchTodos({ page, status, priority })}
        setTotalPages={setTotalPages}
      />
      <div className="flex mb-4"></div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
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
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                let bgColor = "";

                return <RowBgColor row={row} />;
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  page > 0 && setPage((prev) => prev - 1);
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
    </div>
  );
}

const RowBgColor = ({ row }) => {
  let bgColor = "";
  let textDeco = "";

  const todo = row.original;

  if (todo.dueDate) {
    const weekMs = 604800000;
    const dueDate = new Date(todo.dueDate).getTime();
    const now = Date.now();

    if (now + weekMs >= dueDate) {
      bgColor = "#ff8a8a";
    } else if (now + 2 * weekMs >= dueDate) {
      bgColor = "#ffff0094";
    } else {
      bgColor = "rgb(186 255 186)";
    }
  }

  textDeco = todo.done ? "line-through" : "none";

  return (
    <TableRow
      key={row.id}
      style={{ backgroundColor: bgColor, textDecoration: textDeco }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
};
