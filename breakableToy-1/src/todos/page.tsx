import { useEffect, useState } from "react";
import { getColumns, Todo } from "./columns";
import { DataTable } from "./data-table";
import { fetchTodos } from "./api/fetchTodos";

export default function DemoPage() {
  const [rows, setRows] = useState<Todo[]>([]);
  const [page, setPage] = useState();
  const [priority, setPriority] = useState(["HIGH", "MEDIUM", "LOW"]);
  const [total, setTotal] = useState();
  const [totalPages, setTotalPages] = useState();
  const [status, setStatus] = useState(["done", "undone"]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetchTodos({ page, status, priority, text }).then((data) => {
      setRows(data.todos);
    });
  }, []);

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={getColumns}
        rows={rows}
        setRows={setRows}
        page={page}
        priority={priority}
        setPriority={setPriority}
        status={status}
        setStatus={setStatus}
        text={text}
        setText={setText}
        total={total}
        totalPages={totalPages}
        setTotalPages={setTotalPages}
        fetchTodos={fetchTodos}
      />
    </div>
  );
}
