import { API_URL } from "@/config";

export const deleteTodo = async (
  fetchTodos,
  setRows,
  setTotalPages,
  id,
  status,
  priority,
  page,
  text,
  sortBy
) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Failed to delete");
    }

    const updated = await fetchTodos({ status, priority, page, text, sortBy });
    setRows(updated.todos);
    setTotalPages(updated.totalPages);
  } catch (err) {
    console.error("Delete failed:", err);
  }
};
