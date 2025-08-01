package com.example.breakabletoy1.todo.controller;

import com.example.breakabletoy1.todo.model.AverageCompletionTimes;
import com.example.breakabletoy1.todo.model.PaginatedTodos;
import com.example.breakabletoy1.todo.model.Priority;
import com.example.breakabletoy1.todo.model.Todo;
import com.example.breakabletoy1.todo.service.TodoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(
        origins = "http://localhost:8080",
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
    public ResponseEntity<String> createTodo(@RequestBody Todo todo) {
        String error = service.validateTodo(todo);
        if (error != null) return ResponseEntity.badRequest().body(error);

        boolean createdSuccessfully = service.createTodo(todo) != null;
        return createdSuccessfully
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
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
    public ResponseEntity<String> updateTodo(@PathVariable String id, @RequestBody Todo updated) {
        String error = service.validateTodo(updated);
        if (error != null) return ResponseEntity.badRequest().body(error);

        boolean updatedSuccessfully = service.updateTodo(id, updated) != null;
        return updatedSuccessfully
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
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
    public ResponseEntity<AverageCompletionTimes> getAverages() {
        return ResponseEntity.ok(service.getAverageCompletionTimes());
    }
}
