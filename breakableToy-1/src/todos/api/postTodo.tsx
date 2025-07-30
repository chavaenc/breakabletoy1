import { API_URL } from "@/config";

export const postTodo = async ({
  setText,
  setPriority,
  setError,
  setDialogOpen,
  setData,
  setTotalPages,
  fetchTodos,
  setDate,
  text,
  priority,
  date,
}) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        dueDate: date?.toISOString().split("T")[0],
        priority: priority || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const result = await response.json();
    console.log("Created:", result);
    setText("");
    setDate(undefined);
    setPriority("");
    setError("");
    setDialogOpen(false);
    const updated = await fetchTodos();
    setData(updated.todos);
    setTotalPages(updated.totalPages);
  } catch (err: any) {
    setError(err.message);
  }
};
