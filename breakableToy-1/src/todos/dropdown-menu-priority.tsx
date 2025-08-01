import React, { useState } from "react";
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

export function DropdownMenuPriority({
  table,
  priority,
  setPriority,
  fetchTodos,
  setTotalPages,
  setData,
  status,
  page,
  setPage,
  text,
  totalPages,
  sortBy,
}) {
  const [lowStatusChecked, setLowChecked] = React.useState<Checked>(true);
  const [mediumStatusChecked, setMediumStatusChecked] =
    React.useState<Checked>(true);
  const [highStatusChecked, setHighStatusChecked] =
    React.useState<Checked>(true);
  const [error, setError] = useState();

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
        sortBy,
      });

      let newPage = page;
      if (tempResult.totalPages <= page) {
        newPage = Math.max(tempResult.totalPages - 1, 0);
        setPage(newPage);
      }

      const result = await fetchTodos({
        text,
        status: updatedStatus,
        priority: updatedPriority,
        page: newPage,
        sortBy,
      });

      setData(result.todos);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
  };

  const updateFilter = async (fStr: string, setState, currentState) => {
    const newState = !currentState;
    setState(newState);

    const newPriority = newState
      ? [...priority, fStr]
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
          onCheckedChange={async (e) => {
            await updateFilter("HIGH", setHighStatusChecked, highStatusChecked);
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
            updateFilter("MEDIUM", setMediumStatusChecked, mediumStatusChecked);
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
            updateFilter("LOW", setLowChecked, lowStatusChecked);
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
