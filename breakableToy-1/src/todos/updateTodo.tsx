import React, { useEffect, useState } from "react";

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
import { ChevronDownIcon, Italic, PencilIcon, TrashIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import { useFormStatus } from "react-dom";
import { fetchTodos } from "./page";
import { updateTodo } from "./api/updateTodo";
import { Input } from "../components/ui/input";
import type { Todo } from "./columns";

export default function UpdateTodo({
  id,
  otext,
  odueDate,
  opriority,
  setRows,
  fetchTodos,
  setTotalPages,
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW" | "">("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting todo...");
    const newDate = date?.toISOString().split("T")[0];
    await updateTodo(
      id,
      {
        text,
        dueDate: newDate,
        priority: priority.toUpperCase(),
      },
      setRows,
      setTotalPages,
      fetchTodos
    );
  };

  useEffect(() => {
    setText(otext);
    setPriority(opriority);
    setDate(odueDate);
  }, []);

  function Submit() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit"}
      </Button>
    );
  }
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-5 w-5 p-3"
          onClick={(e) => {
            setDialogOpen(true);
            e.stopPropagation(); // Prevent row-level click handler from interfering
          }}
        >
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Todo</DialogTitle>
            <DialogDescription>
              Update a todo here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
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
                defaultValue={priority.toUpperCase()}
                type="single"
                onValueChange={(e) => {
                  if (e) setPriority(e.toUpperCase() as any);
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
            <p>{error}</p>
          </div>
          <DialogFooter>
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
