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
export function DropdownMenuStatus({
  table,
  fetchTodos,
  setTotalPages,
  status,
  page,
  priority,
  setStatus,
  setData,
}) {
  const [doneStatusChecked, setDoneStatusChecked] = useState<Checked>(true);
  const [pendingStatusChecked, setPendingStatusChecked] =
    useState<Checked>(true);
  const [error, setError] = useState();

  const getFilteredTodos = async ({
    updatedPriority = priority,
    updatedStatus = status,
  } = {}) => {
    try {
      setStatus(updatedStatus);
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
    const newStatus = newState
      ? [...status, fStr]
      : status.filter((p) => p !== fStr);

    // Fetch with this newPriority directly
    await getFilteredTodos({
      updatedPriority: priority,
      updatedStatus: newStatus,
    });

    // THEN update state to match what was used in fetch
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
          onCheckedChange={(e) => {
            updateFilter("done", setDoneStatusChecked, doneStatusChecked);
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
              pendingStatusChecked
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
