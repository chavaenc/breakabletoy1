import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogFooter,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Label } from "../components/ui/label";
import { DialogClose } from "../components/ui/dialog";
import { ChevronDownIcon, PencilIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import { updateTodo } from "./api/updateTodo";
import { Input } from "../components/ui/input";
import { useTodos } from "./TodosContext";

export default function UpdateTodo({
  id,
  otext,
  odueDate,
  opriority,
}: {
  id: string;
  otext: string;
  odueDate: Date | null;
  opriority: "high" | "low" | "medium";
}) {
  const { refreshTodos } = useTodos();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [text, setText] = useState("");
  const [localPriority, setLocalPriority] = useState<
    "HIGH" | "MEDIUM" | "LOW" | ""
  >("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    try {
      // Format date manually to avoid timezone issues
      const newDate = date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(date.getDate()).padStart(2, "0")}`
        : undefined;
      await updateTodo(
        id,
        {
          text,
          dueDate: newDate,
          priority: localPriority as "HIGH" | "MEDIUM" | "LOW",
        },
        async () => {
          await refreshTodos();
        }
      );
      setDialogOpen(false);
      toast.success("Todo updated successfully!");
    } catch (err) {
      const errorMessage = (err as Error).message || "Failed to update todo";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Failed to update todo:", err);
    }
  };

  useEffect(() => {
    setText(otext);
    setLocalPriority(opriority.toUpperCase() as "HIGH" | "MEDIUM" | "LOW");
    setDate(odueDate ?? undefined);
  }, [otext, opriority, odueDate]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 md:h-5 md:w-5 md:p-3 md:flex-1"
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          <PencilIcon className="h-3.5 w-3.5 md:h-auto md:w-auto" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px] "
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Todo</DialogTitle>
            <DialogDescription>
              Update a todo here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-2">
            <div className="grid gap-3">
              <Label htmlFor="text">Name</Label>
              <Input
                id="text"
                name="text"
                placeholder="New Todo"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="priority">Priority</Label>
              <ToggleGroup
                defaultValue={localPriority}
                type="single"
                onValueChange={(e) => {
                  if (e) setLocalPriority(e as "HIGH" | "MEDIUM" | "LOW");
                }}
              >
                <ToggleGroupItem value="HIGH" aria-label="Toggle high">
                  <p className="text-bold text-red-600"> High </p>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="MEDIUM"
                  aria-label="Toggle Medium"
                  className="pl-5 pr-5"
                >
                  <p className="text-bold text-orange-400 "> Medium </p>
                </ToggleGroupItem>
                <ToggleGroupItem value="LOW" aria-label="Toggle Low">
                  Low
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="date-picker" className="px-1">
                  Due Date
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <div className="flex gap-3">
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker"
                        className="w-32 justify-between font-normal"
                      >
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                      </Button>
                    </PopoverTrigger>
                    <Button
                      variant={"secondary"}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDate(undefined);
                      }}
                    >
                      Clear due date
                    </Button>
                  </div>
                  <PopoverContent
                    className="w-auto overflow-hidden p-0"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setDate(date);
                        setOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
