import React, { useState } from "react";
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
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { postTodo } from "./api/postTodo";
import { useTodos } from "./TodosContext";

export default function CreateTodo({
  isMobileFloating = false,
}: {
  isMobileFloating?: boolean;
}) {
  const { refreshTodos, setTotalPages } = useTodos();
  const [open, setOpen] = React.useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW" | "">("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await postTodo({
        setText,
        setPriority,
        setError,
        setDialogOpen,
        setData: async () => {
          await refreshTodos();
        },
        setTotalPages,
        fetchTodos: refreshTodos,
        setDate,
        date,
        priority,
        text,
      });
      const dueDateStr = date ? ` - Due: ${date.toLocaleDateString()}` : "";
      toast.success(`Todo created: ${text}${dueDateStr}`);
    } catch (err) {
      toast.error("Failed to create todo");
      console.error("Failed to create todo:", err);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {isMobileFloating ? (
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <PlusIcon className="h-6 w-6" />
          </Button>
        ) : (
          <Button variant="secondary">+ New Todo</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Todo</DialogTitle>
            <DialogDescription>
              Create a new todo here. Click save when you&apos;re done.
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
                type="single"
                onValueChange={(e) => {
                  if (e)
                    setPriority(e.toUpperCase() as "HIGH" | "MEDIUM" | "LOW");
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
                      defaultMonth={date}
                      mode="single"
                      selected={date}
                      toYear={2100}
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
