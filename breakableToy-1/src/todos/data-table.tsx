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
import type { Todo } from "./columns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  setData: React.Dispatch<React.SetStateAction<Todo[]>>;
}

export function DataTable<TData, TValue>({
  columns,
  rows,
  setRows,
  total,
  fetchTodos,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const table = useReactTable({
    data: rows,
    columns,
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
  const [totalPages, setTotalPages] = useState(0);
  useEffect(() => {
    fetchTodos({ page }).then((data) => {
      setRows(data.todos);
      setTotalPages(data.totalPages);
    });
  }, [page]);

  return (
    <div>
      <Filters table={table} />
      <CreateTodo
        setData={setRows}
        fetchTodos={() => fetchTodos({ page })}
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
  let bgColor;
  let textDeco;
  row.getVisibleCells().map((cell) => {
    const weekMs = 604800000;
    let done = cell.row.original.status;
    if (cell.row.original.dueDate) {
      let dueDateMs = cell.row.original.dueDate.getTime();
      if (dueDateMs) {
        if (Date.now() + weekMs >= dueDateMs) {
          bgColor = "#ff8a8a";
        } else if (Date.now() + 2 * weekMs >= dueDateMs) {
          bgColor = "#ffff0094";
        } else {
          bgColor = "rgb(186 255 186)";
        }
      }
    }
    if (row.getIsSelected()) {
      textDeco = "line-through";
    } else {
      textDeco = "none";
    }
    return null;
  });
  return (
    <TableRow
      style={{ backgroundColor: bgColor, textDecoration: textDeco }}
      key={row.id}
      data-state={row.getIsSelected() && "selected"}
      onClick={row.getToggleSelectedHandler()}
    >
      {row.getVisibleCells().map((cell) => {
        return (
          <TableCell key={cell.id}>
            {" "}
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
};
