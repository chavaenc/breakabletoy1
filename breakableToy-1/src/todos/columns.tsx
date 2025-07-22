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
        header: "Status",
    },
    {
        accessorKey: "text",
        header: "Text",
    },
    {
        accessorKey: "priority",
        header: "Priority",
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