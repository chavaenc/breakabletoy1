import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { Button } from "../components/ui/button";
type Checked = DropdownMenuCheckboxItemProps["checked"];
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useState } from "react";
import { useTodos } from "./TodosContext";

export function DropdownMenuStatus() {
  const {
    fetchTodos,
    setTotalPages,
    status,
    priority,
    setStatus,
    setRows,
    text,
    sortBy,
  } = useTodos();

  const [doneStatusChecked, setDoneStatusChecked] = useState<Checked>(true);
  const [pendingStatusChecked, setPendingStatusChecked] =
    useState<Checked>(true);
  const getFilteredTodos = async ({
    updatedPriority = priority,
    updatedStatus = status,
  } = {}) => {
    try {
      setStatus(updatedStatus);

      const previewResult = await fetchTodos({
        text,
        status: updatedStatus,
        priority: updatedPriority,
        page: 0,
        sortBy:
          sortBy === ""
            ? undefined
            : (sortBy as
                | "priority"
                | "dueDate"
                | "priority_desc"
                | "dueDate_desc"),
      });

      const validTotalPages = previewResult.totalPages;

      setRows(
        previewResult.todos.map((todo) => ({
          id: todo.id,
          text: todo.text,
          dueDate: todo.dueDate ?? null,
          done: todo.done,
          doneDate: todo.doneDate ?? null,
          priority: (typeof todo.priority === "string"
            ? todo.priority
            : todo.priority[0]) as "high" | "low" | "medium",
          creationDate: todo.creationDate,
        }))
      );
      setTotalPages(validTotalPages);
    } catch (err) {
      console.log(err);
    }
  };

  const updateFilter = async (
    fStr: string,
    setState: (value: boolean) => void,
    currentState: boolean
  ) => {
    const newState = !currentState;
    setState(newState);

    const newStatus = newState
      ? [...status, fStr as "done" | "undone"]
      : status.filter((p) => p !== fStr);

    await getFilteredTodos({
      updatedPriority: priority,
      updatedStatus: newStatus,
    });

    setStatus(newStatus);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {status.map((f) => {
            if (status.at(status.length - 1) === f) {
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
          onCheckedChange={() => {
            updateFilter(
              "done",
              setDoneStatusChecked,
              Boolean(doneStatusChecked)
            );
          }}
          onSelect={(e) => {
            e.preventDefault();
          }}
        >
          done
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={pendingStatusChecked}
          onCheckedChange={() => {
            updateFilter(
              "undone",
              setPendingStatusChecked,
              Boolean(pendingStatusChecked)
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
