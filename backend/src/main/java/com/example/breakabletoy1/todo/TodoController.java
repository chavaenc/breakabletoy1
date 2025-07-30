package com.example.breakabletoy1.todo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@CrossOrigin(
        origins = "http://localhost:5173",
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
    public ResponseEntity<?> createTodo(@RequestBody Todo todo) {
        String error = service.validateTodo(todo);
        if (error != null) return ResponseEntity.badRequest().body(error);

        Todo created = service.createTodo(todo);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping
    public ResponseEntity<?> getTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) List<Todo.Priority> priority,
            @RequestParam(required = false) String text,
            @RequestParam(defaultValue = "creationDate") String sortBy
    ) {
        return ResponseEntity.ok(service.getTodos(priority, status, text, page, size, sortBy));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTodo(@PathVariable String id, @RequestBody Todo updated) {
        String error = service.validateTodo(updated);
        if (error != null) return ResponseEntity.badRequest().body(error);

        Todo result = service.updateTodo(id, updated);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/done")
    public ResponseEntity<Void> markDone(@PathVariable String id) {
        return service.markDone(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/undone")
    public ResponseEntity<Void> markUndone(@PathVariable String id) {
        return service.markUndone(id) ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable String id) {
        return service.deleteTodo(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/averages")
    public ResponseEntity<Map<String, Object>> getAverages() {
        return ResponseEntity.ok(service.getAverageCompletionTimes());
    }
}
