'use client'

import { ColumnDef } from "@tanstack/react-table"

export type Todo = {
    id: string
    text: string
    dueDate: Date | null
    status: "done"| "pending"
    priority: "high" | "low" | "medium"
    creationDate: Date 
    doneDate: Date | null
}

export const columns: ColumnDef<Todo>[] = [
    {
        accessorKey: "status",
    },
    {
        accessorKey: "text",
        header: "Text",
    },
    {
        accessorKey: "priority",
        header: () => <div className="text-center">Priority</div>,
        cell: ({row}) => {
            let backgroundColor = "";
            switch (row.getValue("priority")) {
                case "low":
                    backgroundColor = "green"
                    break;
                case "medium":
                    backgroundColor = "yellow"
                    break;
                case "high":
                    backgroundColor = "red"
                    break;
                default:
                    backgroundColor = "white"
                    break;
            }
            return <div className="text-red-400">{row.getValue("priority")}</div>
        }
    },
    {
        accessorKey: "dueDate",
        header: "Due Date",
    },
    {
        accessorKey: "creationDate",
        header: "Creation Date",
    },
    {
        accessorKey: "doneDate",
        header: "Done Date",
    },
]