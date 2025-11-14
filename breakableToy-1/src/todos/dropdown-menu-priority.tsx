import React from "react";
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
import type { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { useTodos } from "./TodosContext";

export function DropdownMenuPriority() {
  const {
    priority,
    setPriority,
    fetchTodos,
    setTotalPages,
    setRows,
    status,
    page,
    setPage,
    text,
    sortBy,
  } = useTodos();

  const [lowStatusChecked, setLowChecked] = React.useState<Checked>(true);
  const [mediumStatusChecked, setMediumStatusChecked] =
    React.useState<Checked>(true);
  const [highStatusChecked, setHighStatusChecked] =
    React.useState<Checked>(true);
  const getFilteredTodos = async ({
    updatedPriority = priority,
    updatedStatus = status,
  } = {}) => {
    try {
      setPriority(updatedPriority);
      const tempResult = await fetchTodos({
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

      let newPage = page;
      if (tempResult.totalPages <= page) {
        newPage = Math.max(tempResult.totalPages - 1, 0);
        setPage(newPage);
      }

      setRows(
        tempResult.todos.map((todo) => ({
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
      setTotalPages(tempResult.totalPages);
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

    const newPriority = newState
      ? [...priority, fStr as "HIGH" | "MEDIUM" | "LOW"]
      : priority.filter((p) => p !== fStr);

    await getFilteredTodos({
      updatedPriority: newPriority,
      updatedStatus: status,
    });

    setPriority(newPriority);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {priority.map((f) => {
            if (priority.at(priority.length - 1) === f) {
              return f.toLowerCase();
            } else {
              return f.toLowerCase() + ", ";
            }
          })}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="start" className="w-56">
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={highStatusChecked}
          onCheckedChange={async () => {
            await updateFilter(
              "HIGH",
              setHighStatusChecked,
              Boolean(highStatusChecked)
            );
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
            updateFilter(
              "MEDIUM",
              setMediumStatusChecked,
              Boolean(mediumStatusChecked)
            );
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
            updateFilter("LOW", setLowChecked, Boolean(lowStatusChecked));
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
