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
import { Input } from "../components/ui/input";
import type { Todo } from "./columns";
export default function UpdateTodo({ id, otext, odueDate, opriority }) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW" | "">("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting todo...");
    const newDate = date?.toISOString().split("T")[0];
    await updateTodo(id, { text, dueDate: newDate, priority });
  };

  useEffect(() => {
    setText(otext);
    setPriority(opriority);
    setDate(odueDate);
  }, []);

  async function updateTodo(
    id: string,
    updatedTodo: {
      text: string;
      dueDate?: string; // "YYYY-MM-DD"
      priority: "HIGH" | "MEDIUM" | "LOW";
    }
  ) {
    try {
      const response = await fetch(`http://localhost:8080/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update todo: ${errorText}`);
      }

      const result = await response.json();
      console.log("Updated todo:", result);
      return result;
    } catch (err) {
      console.error("Error:", err);
    }
  }

  function Submit() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit"}
      </Button>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={() => {}} variant="outline" className="h-5 w-5 p-3">
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
                defaultValue={priority}
                type="single"
                onValueChange={(e) => {
                  if (e) setPriority(e.toUpperCase() as any);
                }}
              >
                <ToggleGroupItem value="high" aria-label="Toggle high">
                  <p className="text-bold text-red-600"> High </p>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="medium"
                  aria-label="Toggle Medium"
                  className="pl-5 pr-5"
                >
                  <p className="text-bold text-orange-400 "> Medium </p>
                </ToggleGroupItem>
                <ToggleGroupItem value="low" aria-label="Toggle Low">
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
