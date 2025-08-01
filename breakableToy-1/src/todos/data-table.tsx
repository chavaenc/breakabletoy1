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
import { getAverages } from "./api/fetchTodos";
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
  sortBy: string;
  setSortBy: any;
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
  sortBy,
  setSortBy,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [totalPages, setTotalPages] = useState(0);
  const [metricData, setMetricData] = useState();
  const [page, setPage] = useState(0);

  const table = useReactTable({
    data: rows,
    columns: getColumns({
      setRows,
      setTotalPages,
      fetchTodos,
      getAverages: () => {
        getAverages(setMetricData);
      },
      metricData,
      setMetricData,
      sortBy,
      setSortBy,
      text,
      priority,
      status,
      page,
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

  useEffect(() => {
    fetchTodos({ page, priority, status, sortBy, text }).then((data) => {
      getAverages(setMetricData);
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
        setPage={setPage}
        totalPages={totalPages}
        status={status}
        setStatus={setStatus}
        page={page}
        setData={setRows}
        setText={setText}
        sortBy={sortBy}
      />
      <CreateTodo
        setData={setRows}
        fetchTodos={() => fetchTodos({ page, status, priority, sortBy, text })}
        setTotalPages={setTotalPages}
      />
      <div className="flex mb-4  "></div>
      <div className="rounded-md border mx-auto w-[90%]">
        <Table className="px-0 table-fixed">
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
      <div className="flex bg-white shadow-md rounded-md p-6 space-y-6 justify-around items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Average Time to Finish Tasks
          </h3>
          <p className="text-gray-700">
            <span className="font-medium text-blue-600">
              {metricData?.averageTime?.toFixed(2)}
            </span>{" "}
            mins, (
            <span className="font-medium text-green-600">
              {(metricData?.averageTime / 60)?.toPrecision(3)}
            </span>{" "}
            hours or{" "}
            <span className="font-medium text-purple-600">
              {(metricData?.averageTime / 60 / 24)?.toPrecision(3)}
            </span>{" "}
            days)
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Average Time by Priority
          </h3>
          <ul className="space-y-2">
            <li className="text-gray-700">
              <span className="font-semibold text-yellow-500">Low:</span>{" "}
              {metricData?.byPriority?.low?.toFixed(2)} mins (
              {(metricData?.byPriority?.low / 60)?.toPrecision(3)} hours{" "}
              {" or "}
              {(metricData?.byPriority?.low / 60 / 24)?.toPrecision(3)} days)
            </li>
            <li className="text-gray-700">
              <span className="font-semibold text-blue-500">Medium:</span>{" "}
              {metricData?.byPriority?.medium?.toFixed(2)} mins (
              {(metricData?.byPriority.medium / 60)?.toPrecision(3)} hours{" "}
              {" or "}
              {(metricData?.byPriority.medium / 60 / 24)?.toPrecision(3)} days)
            </li>
            <li className="text-gray-700">
              <span className="font-semibold text-red-500">High:</span>{" "}
              {metricData?.byPriority?.high?.toFixed(2)} mins (
              {(metricData?.byPriority?.high / 60)?.toPrecision(3)} hours{" "}
              {" or "}
              {(metricData?.byPriority?.high / 60 / 24)?.toPrecision(3)} days)
            </li>
          </ul>
        </div>
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
        <TableCell
          className="truncate overflow-hidden text-ellipsis whitespace-nowrap"
          key={cell.id}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
};
