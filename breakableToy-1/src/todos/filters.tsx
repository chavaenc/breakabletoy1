import React from "react";
import { Input } from "../components/ui/input";
import { DropdownMenuPriority } from "./dropdown-menu-priority";
import { DropdownMenuStatus } from "./dropdown-menu-status";

export default function Filters({
  table,
  priority,
  setPriority,
  fetchTodos,
  setTotalPages,
  page,
  status,
  setStatus,
  setData,
}) {
  return (
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
        <DropdownMenuPriority
          table={table}
          priority={priority}
          setPriority={setPriority}
          fetchTodos={fetchTodos}
          setTotalPages={setTotalPages}
          setData={setData}
          page={page}
          status={status}
        />
        <DropdownMenuStatus
          table={table}
          page={page}
          status={status}
          priority={priority}
          setStatus={setStatus}
          fetchTodos={fetchTodos}
          setTotalPages={setTotalPages}
          setData={setData}
        />
        {table.getmodel}
      </div>
    </div>
  );
}
