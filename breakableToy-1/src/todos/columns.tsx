"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../components/ui/button";
import { ArrowUpDown, Check } from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import { useState } from "react";

export type Todo = {
  id: string;
  text: string;
  dueDate: Date | null;
  status: "done" | "pending";
  priority: "high" | "low" | "medium";
  creationDate: Date;
  doneDate: Date | null;
};

export const columns: ColumnDef<Todo>[] = [
  {
    id: "status",
    accessorKey: "status",
    // accessorFn: (row) => row.status,
    header: ({ table }) => (
      <div className="text-center">
        <Checkbox
          className="text-center"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomeRowsSelected() && "indeterminate")
          }
          onCheckedChange={table.getToggleAllPageRowsSelectedHandler()}
          //   onCheckedChange={(value) => {
          //     const selectedRows = table
          //       .getRowModel()
          //       .rows.map((row) => row.original.id);
          //     setData((prev) =>
          //       prev.map((todo) =>
          //         selectedRows.includes(todo.id)
          //           ? { ...todo, status: value ? "pending" : "done" }
          //           : todo
          //       )
          //     );
          //     table.toggleAllPageRowsSelected(!!value);
          //   }}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => {
      let status = row.original.status;
      return (
        <div className="pt-1">
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            // onCheckedChange={(value) => {
            //   row.toggleSelected(!!value);
            //   if (row.getIsSelected()) {
            //     status = "pending";
            //     row.original.status = "pending";
            //     console.log(row.original.status);
            //   } else {
            //     status = "done";
            //     row.renderValue("status");
            //     row.o;

            //     row.original.status = "done";
            //     console.log(row.original.status);
            //   }
            // }}
            aria-label="Select row"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    filterFn: (row, columnId, filterValue: string[]) => {
      if (filterValue.includes("done") && filterValue.includes("pending")) {
        return true;
      } else if (
        filterValue.includes("done") &&
        !filterValue.includes("pending")
      ) {
        return row.getIsSelected();
      } else if (
        !filterValue.includes("done") &&
        filterValue.includes("pending")
      ) {
        return !row.getIsSelected();
      } else {
        return false;
      }
    },
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
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
          date.getMonth() + 1 + "/" + date.getDay() + "/" + date.getFullYear();
        return <div className="font-medium">{formatted}</div>;
      } else {
        return <div>No due date</div>;
      }
    },
  },
];
