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
    header: ({ table }) => (
      <div className="text-center">
        <Checkbox
          className="text-center"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);

            table.getRowModel().rows.map((row) => {
              if (row.getIsSelected() && table.getIsAllPageRowsSelected()) {
                row.original.status = "pending";
              } else if (
                row.getIsSelected() &&
                !table.getIsAllPageRowsSelected()
              ) {
                row.original.status = "done";
              } else if (
                !row.getIsSelected() &&
                !table.getIsAllPageRowsSelected()
              ) {
                row.original.status = "done";
              }
            });
          }}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => {
      let value = "";
      return (
        <div className="pt-1">
          <Checkbox
            checked={row.getIsSelected() && row.original.status == "done"}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              if (row.getIsSelected()) {
                row.original.status = "pending";
              } else {
                row.original.status = "done";
              }
            }}
            aria-label="Select row"
          />
          <div className="hidden">{value}</div>
        </div>
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
      const date = new Date(row.getValue("dueDate"));
      const formatted =
        date.getMonth() + 1 + "/" + date.getDay() + "/" + date.getFullYear();
      return <div className="font-medium">{formatted}</div>;
    },
  },
];
