package com.example.breakabletoy1.todo.controller;

import com.example.breakabletoy1.todo.model.Priority;
import com.example.breakabletoy1.todo.model.Todo;
import com.example.breakabletoy1.todo.service.TodoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(TodoController.class)
class TodoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TodoService todoService;

    private Todo testTodo;

    @BeforeEach
    void setUp() {
        testTodo = new Todo();
        testTodo.setId("test-id-123");
        testTodo.setText("Test Todo");
        testTodo.setPriority(Priority.HIGH);
        testTodo.setDueDate(LocalDate.now().plusDays(7));
        testTodo.setCreationDate(LocalDate.now());
        testTodo.setDone(false);
    }

    @Test
    void createTodo_ShouldReturnCreated() throws Exception {
        Todo newTodo = new Todo();
        newTodo.setText("New Todo");
        newTodo.setPriority(Priority.MEDIUM);

        mockMvc.perform(post("/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newTodo)))
                .andExpect(status().isCreated());
    }

    @Test
    void createTodo_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        Todo invalidTodo = new Todo();
        invalidTodo.setText(""); // Empty text should trigger validation error

        mockMvc.perform(post("/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidTodo)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getTodos_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/todos")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    void getTodos_WithFilters_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/todos")
                .param("page", "0")
                .param("size", "10")
                .param("status", "done")
                .param("priority", "HIGH")
                .param("text", "search"))
                .andExpect(status().isOk());
    }

    @Test
    void updateTodo_ShouldReturnOk() throws Exception {
        Todo updatedTodo = new Todo();
        updatedTodo.setText("Updated Todo");
        updatedTodo.setPriority(Priority.LOW);

        mockMvc.perform(put("/todos/test-id-123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedTodo)))
                .andExpect(status().isOk());
    }

    @Test
    void updateTodo_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        Todo invalidTodo = new Todo();
        invalidTodo.setText(""); // Empty text

        mockMvc.perform(put("/todos/test-id-123")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidTodo)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateTodo_NotFound_ShouldReturnNotFound() throws Exception {
        Todo updatedTodo = new Todo();
        updatedTodo.setText("Updated Todo");
        updatedTodo.setPriority(Priority.LOW);

        mockMvc.perform(put("/todos/nonexistent-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedTodo)))
                .andExpect(status().isNotFound());
    }

    @Test
    void markDone_ShouldReturnOk() throws Exception {
        mockMvc.perform(post("/todos/test-id-123/done"))
                .andExpect(status().isOk());
    }

    @Test
    void markDone_NotFound_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(post("/todos/nonexistent-id/done"))
                .andExpect(status().isNotFound());
    }

    @Test
    void markUndone_ShouldReturnOk() throws Exception {
        mockMvc.perform(put("/todos/test-id-123/undone"))
                .andExpect(status().isOk());
    }

    @Test
    void markUndone_NotFound_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(put("/todos/nonexistent-id/undone"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteTodo_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/todos/test-id-123"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteTodo_NotFound_ShouldReturnNotFound() throws Exception {
        mockMvc.perform(delete("/todos/nonexistent-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAverages_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/todos/averages"))
                .andExpect(status().isOk());
    }

    @Test
    void createTodo_WithNullPriority_ShouldReturnBadRequest() throws Exception {
        Todo invalidTodo = new Todo();
        invalidTodo.setText("Valid text");
        invalidTodo.setPriority(null);

        mockMvc.perform(post("/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidTodo)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createTodo_WithTextTooLong_ShouldReturnBadRequest() throws Exception {
        Todo invalidTodo = new Todo();
        invalidTodo.setText("a".repeat(121)); // 121 characters
        invalidTodo.setPriority(Priority.HIGH);

        mockMvc.perform(post("/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidTodo)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void corsHeaders_ShouldBePresent() throws Exception {
        mockMvc.perform(options("/todos")
                .header("Origin", "http://localhost:8080")
                .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk());
    }
}
