import { DataTable } from "./data-table";
import { TodosProvider } from "./TodosContext";
import { ModeToggle } from "@/components/mode-toggle";

export default function DemoPage() {
  return (
    <TodosProvider>
      <div className="container mx-auto py-4 px-4 sm:py-10">
        <div className="flex justify-end mb-4">
          <ModeToggle />
        </div>
        <DataTable />
      </div>
    </TodosProvider>
  );
}
