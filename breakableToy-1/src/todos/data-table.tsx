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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import { DropdownMenuCheckboxItemProp } from "@radix-ui/react-dropdown-menu";

type Checked = DropdownMenuCheckboxItemProps["checked"];

export function DropdownMenuStatus({ table }) {
  const initFilters = ["done", "pending"];
  const [filterArr, setFilterArr] = React.useState(initFilters);
  const [doneStatusChecked, setDoneStatusChecked] =
    React.useState<Checked>(true);
  const [pendingStatusChecked, setPendingStatusChecked] =
    React.useState<Checked>(true);

  const updateFilter = (fStr: string, setState, state) => {
    const newState = !state;
    setState(newState);

    let newFilterArr;

    if (newState) {
      newFilterArr = [...filterArr, fStr];
    } else {
      newFilterArr = filterArr.filter((f) => f !== fStr);
    }

    setFilterArr(newFilterArr);
    table.getColumn("status")?.setFilterValue(newFilterArr);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {filterArr.map((f) => {
            if (filterArr.at(filterArr.length - 1) === f) {
              return f;
            } else {
              return f + ", ";
            }
          })}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="w-56">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={doneStatusChecked}
          onCheckedChange={(e) => {
            updateFilter("done", setDoneStatusChecked, doneStatusChecked);
          }}
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          Done
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={pendingStatusChecked}
          onCheckedChange={() => {
            updateFilter(
              "pending",
              setPendingStatusChecked,
              pendingStatusChecked
            );
          }}
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          Pending
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function DropdownMenuPriority({ table }) {
  const initFilters = ["low", "medium", "high"];
  const [filterArr, setFilterArr] = React.useState(initFilters);
  const [lowStatusChecked, setLowChecked] = React.useState<Checked>(true);
  const [mediumStatusChecked, setMediumStatusChecked] =
    React.useState<Checked>(true);
  const [highStatusChecked, setHighStatusChecked] =
    React.useState<Checked>(true);

  const updateFilter = (fStr: string, setState, state) => {
    const newState = !state;
    setState(newState);

    let newFilterArr;

    if (newState) {
      newFilterArr = [...filterArr, fStr];
    } else {
      newFilterArr = filterArr.filter((f) => f !== fStr);
    }

    setFilterArr(newFilterArr);
    table.getColumn("priority")?.setFilterValue(newFilterArr);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {filterArr.map((f) => {
            if (filterArr.at(filterArr.length - 1) === f) {
              return f;
            } else {
              return f + ", ";
            }
          })}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="w-56">
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={highStatusChecked}
          onCheckedChange={(e) => {
            updateFilter("high", setHighStatusChecked, highStatusChecked);
          }}
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          High
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={mediumStatusChecked}
          onCheckedChange={() => {
            updateFilter("medium", setMediumStatusChecked, mediumStatusChecked);
          }}
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          Medium
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={lowStatusChecked}
          onCheckedChange={() => {
            updateFilter("low", setLowChecked, lowStatusChecked);
          }}
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          Low
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
      <div className="flex items-start py-4 gap-1">
        <div className="flex flex-col gap-6 items-start justify-between align-middle">
          <p>Name:</p>
          <p>Priority:</p>
          <p>State:</p>
        </div>
        <div className="flex  flex-col items-start gap-2">
          <Input
            type="text"
            placeholder="Filter..."
            value={(table.getColumn("text")?.getFilterValue() as string) ?? " "}
            onChange={(event) =>
              table.getColumn("text")?.setFilterValue(event.target.value)
            }
            className="self-end justify-end"
          ></Input>
          <DropdownMenuPriority table={table} />
          <DropdownMenuStatus table={table} />
          {table.getmodel}
        </div>
      </div>
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
