"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../components/ui/button";
import { ArrowUpDown } from "lucide-react";

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
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "text",
    header: "Text",
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {" "}
        Priority
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
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
      return <div className="text-red-400">{row.getValue("priority")}</div>;
    },
  },
  {
    accessorKey: "dueDate",
    sortingFn: "datetime",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {" "}
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "creationDate",
    header: "Creation Date",
  },
  {
    accessorKey: "doneDate",
    header: "Done Date",
  },
];
