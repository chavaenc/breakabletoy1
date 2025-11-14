package com.example.breakabletoy1.todo.exception;

import com.example.breakabletoy1.todo.controller.TodoController;
import com.example.breakabletoy1.todo.model.Priority;
import com.example.breakabletoy1.todo.model.Todo;
import com.example.breakabletoy1.todo.service.TodoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(TodoController.class)
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TodoService todoService;

    @Test
    void handleTodoNotFoundException_ShouldReturn404() throws Exception {
        Mockito.when(todoService.updateTodo(anyString(), any(Todo.class)))
                .thenThrow(new TodoNotFoundException("test-id"));

        Todo todo = new Todo();
        todo.setText("Update");
        todo.setPriority(Priority.HIGH);

        mockMvc.perform(put("/todos/test-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(todo)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value(containsString("test-id")))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void handleTodoValidationException_ShouldReturn400() throws Exception {
        Mockito.doThrow(new TodoValidationException("The todo name is required."))
                .when(todoService).createTodo(any(Todo.class));

        Todo todo = new Todo();
        todo.setText("");
        todo.setPriority(Priority.HIGH);

        mockMvc.perform(post("/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(todo)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("The todo name is required."))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void handleGenericException_ShouldReturn500_WithoutSensitiveInfo() throws Exception {
        Mockito.when(todoService.updateTodo(anyString(), any(Todo.class)))
                .thenThrow(new RuntimeException("Sensitive internal error"));

        Todo todo = new Todo();
        todo.setText("Update");
        todo.setPriority(Priority.HIGH);

        mockMvc.perform(put("/todos/test-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(todo)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("INTERNAL_SERVER_ERROR"))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred. Please try again later."))
                .andExpect(jsonPath("$.message").value(not(containsString("Sensitive"))))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void handleTodoNotFoundException_OnDelete_ShouldReturn404() throws Exception {
        Mockito.doThrow(new TodoNotFoundException("nonexistent-id"))
                .when(todoService).deleteTodo(anyString());

        mockMvc.perform(delete("/todos/nonexistent-id"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value(containsString("nonexistent-id")));
    }

    @Test
    void handleTodoNotFoundException_OnMarkDone_ShouldReturn404() throws Exception {
        Mockito.doThrow(new TodoNotFoundException("test-id"))
                .when(todoService).markDone(anyString());

        mockMvc.perform(post("/todos/test-id/done"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void handleTodoNotFoundException_OnMarkUndone_ShouldReturn404() throws Exception {
        Mockito.doThrow(new TodoNotFoundException("test-id"))
                .when(todoService).markUndone(anyString());

        mockMvc.perform(put("/todos/test-id/undone"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("NOT_FOUND"));
    }

    @Test
    void handleTodoValidationException_NullPriority_ShouldReturn400() throws Exception {
        Mockito.doThrow(new TodoValidationException("Priority is required."))
                .when(todoService).createTodo(any(Todo.class));

        Todo todo = new Todo();
        todo.setText("Valid text");
        todo.setPriority(null);

        mockMvc.perform(post("/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(todo)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("Priority is required."));
    }

    @Test
    void handleTodoValidationException_TextTooLong_ShouldReturn400() throws Exception {
        Mockito.doThrow(new TodoValidationException("The todo name cannot exceed 120 characters."))
                .when(todoService).createTodo(any(Todo.class));

        Todo todo = new Todo();
        todo.setText("a".repeat(121));
        todo.setPriority(Priority.HIGH);

        mockMvc.perform(post("/todos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(todo)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("The todo name cannot exceed 120 characters."));
    }

    @Test
    void errorResponse_ShouldHaveCorrectStructure() throws Exception {
        Mockito.when(todoService.updateTodo(anyString(), any(Todo.class)))
                .thenThrow(new TodoNotFoundException("test-id"));

        Todo todo = new Todo();
        todo.setText("Update");
        todo.setPriority(Priority.HIGH);

        mockMvc.perform(put("/todos/test-id")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(todo)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").isString())
                .andExpect(jsonPath("$.message").isString())
                .andExpect(jsonPath("$.timestamp").isNotEmpty());
    }
}
