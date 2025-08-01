package com.example.breakabletoy1.todo.service;

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
    void updateTodo_shouldReturnNullIfNotFound() {
        Todo updated = new Todo(null, "Update nothing", null, false, null, Priority.MEDIUM, null);
        TodoService service = new TodoService();

        Todo result = service.updateTodo("nonexistent-id", updated);

        assertNull(result);
    }

    @Test
    void deleteTodo_shouldRemoveTodoById() {
        TodoService service = new TodoService();
        Todo todo = new Todo(null, "Delete me", null, false, null, Priority.MEDIUM, LocalDate.now());
        service.createTodo(todo);

        boolean deleted = service.deleteTodo(todo.getId());

        assertTrue(deleted);
    }

    @Test
    void testValidateTodo_Valid() {
        Todo todo = new Todo();
        todo.setText("Valid task");
        todo.setPriority(Priority.LOW);

        String error = service.validateTodo(todo);
        assertNull(error);
    }

    @Test
    void testValidateTodo_InvalidText() {
        Todo todo = new Todo();
        todo.setText("  ");
        todo.setPriority(Priority.HIGH);

        String error = service.validateTodo(todo);
        assertEquals("Text is required.", error);
    }

    @Test
    void testMarkDoneAndUndone() {
        Todo todo = new Todo();
        todo.setText("Complete task");
        todo.setPriority(Priority.HIGH);
        service.createTodo(todo);

        boolean done = service.markDone(todo.getId());
        assertTrue(done);
        assertTrue(todo.isDone());

        boolean undone = service.markUndone(todo.getId());
        assertTrue(undone);
        assertFalse(todo.isDone());
    }

}