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
export function DropdownMenuStatus({ table }) {
  const initFilters = ["done", "pending"];
  const [filterArr, setFilterArr] = useState(initFilters);
  const [doneStatusChecked, setDoneStatusChecked] = useState<Checked>(true);
  const [pendingStatusChecked, setPendingStatusChecked] =
    useState<Checked>(true);

  const updateFilter = (fStr: string, setState, state) => {
    const newState = !state;
    setState(newState);

    let newFilterArr;

    if (newState) {
      newFilterArr = [...filterArr, fStr];
    } else {
      newFilterArr = filterArr.filter((f) => f !== fStr);
    }

    setFilterArr(newFilterArr);
    table.getColumn("status")?.setFilterValue(newFilterArr);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {filterArr.map((f) => {
            if (filterArr.at(filterArr.length - 1) === f) {
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
          Done
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={pendingStatusChecked}
          onCheckedChange={() => {
            updateFilter(
              "pending",
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
