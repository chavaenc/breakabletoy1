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
  text,
  setText,
  setStatus,
  setData,
  sortBy,
}) {
  const getFilteredTodos = async ({
    text,
    status,
    priority,
    page,
    setTotalPages,
  }) => {
    // const params = new URLSearchParams();

    // params.append("page", page.toString());
    // params.append("size", "10");

    // status.forEach((s) => params.append("status", s));
    // priority.forEach((p) => params.append("priority", p));

    // if (text && text.trim()) {
    //   params.append("text", text.trim());
    // }

    const res = await fetchTodos({ text, status, priority, page });
    setTotalPages(res.totalPages);
    setData(res.todos);
  };

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
          value={text}
          onChange={(e) => {
            const newText = e.target.value;
            setText(newText); // local state for UI
            getFilteredTodos({
              text: newText,
              status: status,
              priority: priority,
              page: 0,
              setTotalPages: setTotalPages,
            });
          }}
        />
        <DropdownMenuPriority
          table={table}
          priority={priority}
          setPriority={setPriority}
          fetchTodos={fetchTodos}
          setTotalPages={setTotalPages}
          text={text}
          setData={setData}
          page={page}
          sortBy={sortBy}
          status={status}
        />
        <DropdownMenuStatus
          table={table}
          text={text}
          page={page}
          status={status}
          priority={priority}
          setStatus={setStatus}
          fetchTodos={fetchTodos}
          setTotalPages={setTotalPages}
          sortBy={sortBy}
          setData={setData}
        />
        {table.getmodel}
      </div>
    </div>
  );
}
