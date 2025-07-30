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
      const result = await fetchTodos({
        status: updatedStatus,
        priority: updatedPriority,
        page: page,
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

    // Compute new priority manually, don't rely on state
    const newPriority = newState
      ? [...priority, fStr]
      : priority.filter((p) => p !== fStr);

    // Fetch with this newPriority directly
    await getFilteredTodos({
      updatedPriority: newPriority,
      updatedStatus: status,
    });

    // THEN update state to match what was used in fetch
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
