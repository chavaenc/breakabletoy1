package com.example.breakabletoy1.todo.service;

import com.example.breakabletoy1.todo.exception.TodoNotFoundException;
import com.example.breakabletoy1.todo.exception.TodoValidationException;
import com.example.breakabletoy1.todo.model.AverageCompletionTimes;
import com.example.breakabletoy1.todo.model.PaginatedTodos;
import com.example.breakabletoy1.todo.model.Priority;
import com.example.breakabletoy1.todo.model.Todo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TodoServiceTest {

    private TodoService service;

    @BeforeEach
    void setUp() {
        service = new TodoService();
    }

    @Test
    void testGetTodos_WithFilters() {
        Todo todo1 = new Todo();
        todo1.setText("Task 1");
        todo1.setPriority(Priority.HIGH);
        service.createTodo(todo1);

        Todo todo2 = new Todo();
        todo2.setText("Task 2");
        todo2.setPriority(Priority.LOW);
        service.createTodo(todo2);

        List<Priority> priorities = List.of(Priority.HIGH);
        PaginatedTodos result = service.getTodos(priorities, List.of("undone"), "", 0, 10, "priority");

        assertEquals(1, result.getTodos().size());
        assertEquals("Task 1", result.getTodos().get(0).getText());
    }

    @Test
    void createTodo() {
        Todo todo = new Todo();
        todo.setText("Buy groceries");
        todo.setPriority(Priority.MEDIUM);

        Todo result = service.createTodo(todo);

        assertNotNull(result.getId());
        assertEquals("Buy groceries", result.getText());
        assertFalse(result.isDone());
    }

    @Test
    void updateTodo_shouldUpdateExistingTodo() {
        Todo original = new Todo(null, "Clean room", null, false, null, Priority.LOW, LocalDate.now());
        TodoService service = new TodoService();
        service.createTodo(original);

        Todo updated = new Todo(null, "Clean kitchen", null, false, null, Priority.HIGH, null);
        Todo result = service.updateTodo(original.getId(), updated);

        assertNotNull(result);
        assertEquals("Clean kitchen", result.getText());
        assertEquals(Priority.HIGH, result.getPriority());
    }

    @Test
    void updateTodo_shouldThrowExceptionIfNotFound() {
        Todo updated = new Todo(null, "Update nothing", null, false, null, Priority.MEDIUM, null);
        TodoService service = new TodoService();

        assertThrows(TodoNotFoundException.class, () -> {
            service.updateTodo("nonexistent-id", updated);
        });
    }

    @Test
    void deleteTodo_shouldRemoveTodoById() {
        TodoService service = new TodoService();
        Todo todo = new Todo(null, "Delete me", null, false, null, Priority.MEDIUM, LocalDate.now());
        service.createTodo(todo);

        assertDoesNotThrow(() -> service.deleteTodo(todo.getId()));
        
        // Verify it was actually deleted
        PaginatedTodos result = service.getTodos(null, List.of("done", "undone"), null, 0, 10, "creationDate");
        assertEquals(0, result.getTodos().size());
    }

    @Test
    void testValidateTodo_Valid() {
        Todo todo = new Todo();
        todo.setText("Valid task");
        todo.setPriority(Priority.LOW);

        assertDoesNotThrow(() -> service.validateTodo(todo));
    }

    @Test
    void testValidateTodo_InvalidText() {
        Todo todo = new Todo();
        todo.setText("  ");
        todo.setPriority(Priority.HIGH);

        TodoValidationException exception = assertThrows(TodoValidationException.class, () -> {
            service.validateTodo(todo);
        });
        assertEquals("The todo name is required.", exception.getMessage());
    }

    @Test
    void testMarkDoneAndUndone() {
        Todo todo = new Todo();
        todo.setText("Complete task");
        todo.setPriority(Priority.HIGH);
        Todo created = service.createTodo(todo);

        assertDoesNotThrow(() -> service.markDone(created.getId()));
        assertTrue(created.isDone());

        assertDoesNotThrow(() -> service.markUndone(created.getId()));
        assertFalse(created.isDone());
    }

    @Test
    void testMarkDone_shouldThrowExceptionIfNotFound() {
        assertThrows(TodoNotFoundException.class, () -> {
            service.markDone("nonexistent-id");
        });
    }

    @Test
    void testMarkUndone_shouldThrowExceptionIfNotFound() {
        assertThrows(TodoNotFoundException.class, () -> {
            service.markUndone("nonexistent-id");
        });
    }

    @Test
    void testDeleteTodo_shouldThrowExceptionIfNotFound() {
        assertThrows(TodoNotFoundException.class, () -> {
            service.deleteTodo("nonexistent-id");
        });
    }

    @Test
    void testValidateTodo_NullText() {
        Todo todo = new Todo();
        todo.setText(null);
        todo.setPriority(Priority.HIGH);

        TodoValidationException exception = assertThrows(TodoValidationException.class, () -> {
            service.validateTodo(todo);
        });
        assertEquals("The todo name is required.", exception.getMessage());
    }

    @Test
    void testValidateTodo_TextTooLong() {
        Todo todo = new Todo();
        todo.setText("a".repeat(121)); // 121 characters
        todo.setPriority(Priority.HIGH);

        TodoValidationException exception = assertThrows(TodoValidationException.class, () -> {
            service.validateTodo(todo);
        });
        assertEquals("The todo name cannot exceed 120 characters.", exception.getMessage());
    }

    @Test
    void testValidateTodo_NullPriority() {
        Todo todo = new Todo();
        todo.setText("Valid text");
        todo.setPriority(null);

        TodoValidationException exception = assertThrows(TodoValidationException.class, () -> {
            service.validateTodo(todo);
        });
        assertEquals("Priority is required.", exception.getMessage());
    }

    @Test
    void testGetTodos_WithStatusFilter_DoneOnly() {
        Todo todo1 = new Todo();
        todo1.setText("Task 1");
        todo1.setPriority(Priority.HIGH);
        Todo created1 = service.createTodo(todo1);
        service.markDone(created1.getId());

        Todo todo2 = new Todo();
        todo2.setText("Task 2");
        todo2.setPriority(Priority.LOW);
        service.createTodo(todo2);

        PaginatedTodos result = service.getTodos(null, List.of("done"), null, 0, 10, "creationDate");

        assertEquals(1, result.getTodos().size());
        assertTrue(result.getTodos().get(0).isDone());
    }

    @Test
    void testGetTodos_WithStatusFilter_UndoneOnly() {
        Todo todo1 = new Todo();
        todo1.setText("Task 1");
        todo1.setPriority(Priority.HIGH);
        Todo created1 = service.createTodo(todo1);
        service.markDone(created1.getId());

        Todo todo2 = new Todo();
        todo2.setText("Task 2");
        todo2.setPriority(Priority.LOW);
        service.createTodo(todo2);

        PaginatedTodos result = service.getTodos(null, List.of("undone"), null, 0, 10, "creationDate");

        assertEquals(1, result.getTodos().size());
        assertFalse(result.getTodos().get(0).isDone());
    }

    @Test
    void testGetTodos_WithTextFilter() {
        Todo todo1 = new Todo();
        todo1.setText("Buy groceries");
        todo1.setPriority(Priority.HIGH);
        service.createTodo(todo1);

        Todo todo2 = new Todo();
        todo2.setText("Clean house");
        todo2.setPriority(Priority.LOW);
        service.createTodo(todo2);

        PaginatedTodos result = service.getTodos(null, List.of("done", "undone"), "groceries", 0, 10, "creationDate");

        assertEquals(1, result.getTodos().size());
        assertEquals("Buy groceries", result.getTodos().get(0).getText());
    }

    @Test
    void testGetTodos_Pagination() {
        // Create 15 todos
        for (int i = 0; i < 15; i++) {
            Todo todo = new Todo();
            todo.setText("Task " + i);
            todo.setPriority(Priority.MEDIUM);
            service.createTodo(todo);
        }

        // Get first page (size 10)
        PaginatedTodos page1 = service.getTodos(null, List.of("done", "undone"), null, 0, 10, "creationDate");
        assertEquals(10, page1.getTodos().size());
        assertEquals(15, page1.getTotal());
        assertEquals(2, page1.getTotalPages());

        // Get second page
        PaginatedTodos page2 = service.getTodos(null, List.of("done", "undone"), null, 1, 10, "creationDate");
        assertEquals(5, page2.getTodos().size());
        assertEquals(15, page2.getTotal());
    }

    @Test
    void testGetTodos_EmptyResult() {
        PaginatedTodos result = service.getTodos(null, List.of("done", "undone"), "nonexistent", 0, 10, "creationDate");

        assertEquals(0, result.getTodos().size());
        assertEquals(0, result.getTotal());
        assertEquals(0, result.getTotalPages());
    }

    @Test
    void testGetTodos_SortByPriority() {
        Todo low = new Todo();
        low.setText("Low priority task");
        low.setPriority(Priority.LOW);
        service.createTodo(low);

        Todo high = new Todo();
        high.setText("High priority task");
        high.setPriority(Priority.HIGH);
        service.createTodo(high);

        Todo medium = new Todo();
        medium.setText("Medium priority task");
        medium.setPriority(Priority.MEDIUM);
        service.createTodo(medium);

        PaginatedTodos result = service.getTodos(null, List.of("done", "undone"), null, 0, 10, "priority");

        assertEquals(3, result.getTodos().size());
        assertEquals(Priority.HIGH, result.getTodos().get(0).getPriority());
        assertEquals(Priority.MEDIUM, result.getTodos().get(1).getPriority());
        assertEquals(Priority.LOW, result.getTodos().get(2).getPriority());
    }

    @Test
    void testGetTodos_SortByPriorityDescending() {
        Todo low = new Todo();
        low.setText("Low priority task");
        low.setPriority(Priority.LOW);
        service.createTodo(low);

        Todo high = new Todo();
        high.setText("High priority task");
        high.setPriority(Priority.HIGH);
        service.createTodo(high);

        PaginatedTodos result = service.getTodos(null, List.of("done", "undone"), null, 0, 10, "priority_desc");

        assertEquals(Priority.LOW, result.getTodos().get(0).getPriority());
        assertEquals(Priority.HIGH, result.getTodos().get(result.getTodos().size() - 1).getPriority());
    }

    @Test
    void testGetAverageCompletionTimes_WithCompletedTodos() {
        Todo todo1 = new Todo();
        todo1.setText("Task 1");
        todo1.setPriority(Priority.HIGH);
        Todo created1 = service.createTodo(todo1);
        service.markDone(created1.getId());

        Todo todo2 = new Todo();
        todo2.setText("Task 2");
        todo2.setPriority(Priority.LOW);
        Todo created2 = service.createTodo(todo2);
        service.markDone(created2.getId());

        AverageCompletionTimes averages = service.getAverageCompletionTimes();

        assertNotNull(averages);
        assertTrue(averages.getAverageTime() >= 0);
        assertNotNull(averages.getByPriority());
    }

    @Test
    void testGetAverageCompletionTimes_NoCompletedTodos() {
        Todo todo = new Todo();
        todo.setText("Incomplete task");
        todo.setPriority(Priority.MEDIUM);
        service.createTodo(todo);

        AverageCompletionTimes averages = service.getAverageCompletionTimes();

        assertEquals(0.0, averages.getAverageTime());
    }

    @Test
    void testMarkDone_SetsCorrectDoneDate() {
        Todo todo = new Todo();
        todo.setText("Task");
        todo.setPriority(Priority.HIGH);
        Todo created = service.createTodo(todo);

        service.markDone(created.getId());

        assertNotNull(created.getDoneDate());
        assertEquals(LocalDate.now(), created.getDoneDate());
    }

    @Test
    void testMarkUndone_ClearsDoneDate() {
        Todo todo = new Todo();
        todo.setText("Task");
        todo.setPriority(Priority.HIGH);
        Todo created = service.createTodo(todo);

        service.markDone(created.getId());
        assertNotNull(created.getDoneDate());

        service.markUndone(created.getId());
        assertNull(created.getDoneDate());
    }

}