package com.example.breakabletoy1.todo.controller;

import com.example.breakabletoy1.todo.exception.TodoNotFoundException;
import com.example.breakabletoy1.todo.exception.TodoValidationException;
import com.example.breakabletoy1.todo.model.AverageCompletionTimes;
import com.example.breakabletoy1.todo.model.PaginatedTodos;
import com.example.breakabletoy1.todo.model.Priority;
import com.example.breakabletoy1.todo.model.Todo;
import com.example.breakabletoy1.todo.service.TodoService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(
        origins = "${cors.allowed.origins}",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        allowedHeaders = "*"
)
@RestController
@RequestMapping("/todos")
public class TodoController {

    private final TodoService service;

    public TodoController(TodoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> createTodo(@RequestBody Todo todo) {
        service.createTodo(todo);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<PaginatedTodos> getTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) List<Priority> priority,
            @RequestParam(required = false) String text,
            @RequestParam(defaultValue = "creationData") String sortBy
    ) {
        return ResponseEntity.ok(service.getTodos(priority, status, text, page, size, sortBy));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateTodo(@PathVariable String id, @RequestBody Todo updated) {
        service.updateTodo(id, updated);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/done")
    public ResponseEntity<Void> markDone(@PathVariable String id) {
        service.markDone(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/undone")
    public ResponseEntity<Void> markUndone(@PathVariable String id) {
        service.markUndone(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable String id) {
        service.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/averages")
    public ResponseEntity<AverageCompletionTimes> getAverages() {
        return ResponseEntity.ok(service.getAverageCompletionTimes());
    }
}
