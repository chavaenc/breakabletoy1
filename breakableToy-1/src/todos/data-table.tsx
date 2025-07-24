"use client";

import { Button } from "@/components/ui/button";

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

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const table = useReactTable({
    data,
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

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          type="text"
          placeholder="Filter..."
          value={(table.getColumn("text")?.getFilterValue() as string) ?? " "}
          onChange={(event) =>
            table.getColumn("text")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        ></Input>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

const RowBgColor = ({ row }) => {
  let bgColor;
  let textDeco;
  row.getVisibleCells().map((cell) => {
    const weekMs = 604800000;
    if (cell.row.original.dueDate) {
      let dueDateMs = cell.row.original.dueDate.getTime();
      let done = cell.row.original.status;
      if (dueDateMs) {
        if (Date.now() + weekMs >= dueDateMs) {
          bgColor = "#ff8a8a";
        } else if (Date.now() + 2 * weekMs >= dueDateMs) {
          bgColor = "#ffff0094";
        } else {
          bgColor = "rgb(186 255 186)";
        }
        if (done === "done") {
          textDeco = "line-through";
        } else {
          textDeco = "none";
        }
      }
    }
    return null;
  });
  return (
    <TableRow
      style={{ backgroundColor: bgColor, textDecoration: textDeco }}
      key={row.id}
      data-state={row.getIsSelected() && "selected"}
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
