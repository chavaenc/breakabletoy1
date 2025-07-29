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

export function DropdownMenuPriority({ table }) {
  const initFilters = ["low", "medium", "high"];
  const [filterArr, setFilterArr] = React.useState(initFilters);
  const [lowStatusChecked, setLowChecked] = React.useState<Checked>(true);
  const [mediumStatusChecked, setMediumStatusChecked] =
    React.useState<Checked>(true);
  const [highStatusChecked, setHighStatusChecked] =
    React.useState<Checked>(true);

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
    table.getColumn("priority")?.setFilterValue(newFilterArr);
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
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={highStatusChecked}
          onCheckedChange={(e) => {
            updateFilter("high", setHighStatusChecked, highStatusChecked);
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
            updateFilter("medium", setMediumStatusChecked, mediumStatusChecked);
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
            updateFilter("low", setLowChecked, lowStatusChecked);
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
