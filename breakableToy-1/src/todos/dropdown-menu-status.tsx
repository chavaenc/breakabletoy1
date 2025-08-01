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
  text,
  totalPages,
  setPage,
  sortBy,
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

      const previewResult = await fetchTodos({
        text,
        status: updatedStatus,
        priority: updatedPriority,
        page: 0,
        sortBy,
      });

      const validTotalPages = previewResult.totalPages;
      const validPage = Math.min(page, validTotalPages - 1);

      const result = await fetchTodos({
        text,
        status: updatedStatus,
        priority: updatedPriority,
        page: validPage,
        sortBy,
      });

      setData(result.todos);
      setTotalPages(validTotalPages);
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
  };

  const updateFilter = async (fStr: string, setState, currentState) => {
    const newState = !currentState;
    setState(newState);

    const newStatus = newState
      ? [...status, fStr]
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
