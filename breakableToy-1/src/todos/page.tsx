import { columns, Todo } from "./columns";
import { DataTable } from "./data-table";

function getData(): Todo[] {
  // fetch data from api here
  const todos: Todo[] = [
    {
      id: "1",
      text: "Buy groceries",
      creationDate: new Date("2025-07-15"),
      dueDate: new Date("2025-07-20"),
      status: "pending",
      priority: "medium",
      doneDate: null,
    },
    {
      id: "2",
      text: "Finish report",
      creationDate: new Date("2025-07-10"),
      dueDate: new Date("2025-07-18"),
      status: "done",
      priority: "high",
      doneDate: new Date("2025-07-17"),
    },
    {
      id: "3",
      text: "Call plumber",
      creationDate: new Date("2025-07-12"),
      dueDate: null,
      status: "pending",
      priority: "low",
      doneDate: null,
    },
    {
      id: "4",
      text: "Submit taxes",
      creationDate: new Date("2025-07-01"),
      dueDate: null,
      status: "done",
      priority: "high",
      doneDate: new Date("2025-07-14"),
    },
    {
      id: "5",
      text: "Submit taxes",
      creationDate: new Date("2025-07-01"),
      dueDate: new Date("2025-07-29"),
      status: "done",
      priority: "high",
      doneDate: new Date("2025-07-14"),
    },
    {
      id: "6",
      text: "Submit taxes",
      creationDate: new Date("2025-07-01"),
      dueDate: new Date("2025-07-30"),
      status: "done",
      priority: "high",
      doneDate: new Date("2025-07-14"),
    },
    {
      id: "7",
      text: "Submit taxes",
      creationDate: new Date("2025-07-01"),
      dueDate: new Date("2025-08-04"),
      status: "done",
      priority: "high",
      doneDate: new Date("2025-07-14"),
    },
    {
      id: "8",
      text: "Submit taxes",
      creationDate: new Date("2025-07-01"),
      dueDate: new Date("2025-08-20"),
      status: "done",
      priority: "high",
      doneDate: new Date("2025-07-14"),
    },
    {
      id: "9",
      text: "Submit taxes",
      creationDate: new Date("2025-07-01"),
      dueDate: new Date("2025-08-20"),
      status: "done",
      priority: "high",
      doneDate: new Date("2025-07-14"),
    },
    {
      id: "10",
      text: "Submit taxes",
      creationDate: new Date("2025-07-01"),
      dueDate: new Date("2025-08-20"),
      status: "done",
      priority: "high",
      doneDate: new Date("2025-07-14"),
    },
    {
      id: "11",
      text: "Submit taxes",
      creationDate: new Date("2025-07-01"),
      dueDate: new Date("2025-08-20"),
      status: "done",
      priority: "high",
      doneDate: new Date("2025-07-14"),
    },
    {
      id: "12",
      text: "Submit taxes",
      creationDate: new Date("2025-07-01"),
      dueDate: new Date("2025-08-20"),
      status: "done",
      priority: "high",
      doneDate: new Date("2025-07-14"),
    },
  ];

  return todos;
}

export default function DemoPage() {
  const data = getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
