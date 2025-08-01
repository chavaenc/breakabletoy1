import { API_URL } from "@/config";

export async function updateTodo(
  id: string,
  updatedTodo: {
    text: string;
    dueDate?: string; // "YYYY-MM-DD"
    priority: "HIGH" | "MEDIUM" | "LOW";
  },
  setRows,
  setTotalPages,
  fetchTodos,
  status,
  priorityFilter,
  text,
  page,
  sortBy
) {
  try {
    console.log("ola");
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTodo),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(":c");
      throw new Error(`Failed to update todo: ${errorText}`);
    }
    // setDialogOpen(false);
    const updated = await fetchTodos({
      status: status,
      priority: priorityFilter,
      page: page,
      text: text,
      sortBy: sortBy,
    });

    setRows(updated.todos);
    setTotalPages(updated.totalPages);
  } catch (err) {
    console.error("Error:", err);
  }
}

export async function markDone(id: string) {
  await fetch(`${API_URL}/${id}/done`, {
    method: "POST",
  });
}

export async function markUndone(id: string) {
  await fetch(`${API_URL}/${id}/undone`, {
    method: "PUT",
  });
}
