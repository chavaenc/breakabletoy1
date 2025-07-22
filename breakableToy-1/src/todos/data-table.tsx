"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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
          bgColor = "red";
        } else if (Date.now() + 2 * weekMs >= dueDateMs) {
          bgColor = "yellow";
        } else {
          bgColor = "green";
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
