package com.example.breakabletoy1;

import ch.qos.logback.core.net.SyslogOutputStream;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.sql.SQLOutput;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
@RequestMapping("/todos")
public class TodoController {

    private final Map<String, Todo> todos = new ConcurrentHashMap<>();

    @PostMapping
    public ResponseEntity<?> createTodo(@RequestBody Todo todo) {
        String validationError = validateTodo(todo);
        if (validationError != null) {
            System.out.println("validationError: " + validationError);
            return ResponseEntity.badRequest().body(validationError);
        }

        String id = UUID.randomUUID().toString();
        todo.setId(id);
        todo.setCreationDate(LocalDate.now());
        todo.setDone(false);
        todo.setDoneDate(null);

        todos.put(id, todo);
        return ResponseEntity.status(201).body(todo);
    }

    @GetMapping
    public ResponseEntity<?> getTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean done,
            @RequestParam(required = false) String text,
            @RequestParam(required = false) Todo.Priority priority,
            @RequestParam(defaultValue = "creationDate") String sortBy
    ) {
        List<Todo> filtered = todos.values().stream()
                .filter(todo -> done == null || todo.isDone() == done)
                .filter(todo -> text == null || todo.getText().toLowerCase().contains(text.toLowerCase()))
                .filter(todo -> priority == null || todo.getPriority() == priority)
                .sorted(getComparator(sortBy))
                .collect(Collectors.toList());

        int total = filtered.size();
        int totalPages = (int) Math.ceil((double) total / size);

        List<Todo> paged = filtered.stream()
                .skip((long) page * size)
                .limit(size)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("todos", paged);
        response.put("page", page);
        response.put("size", size);
        response.put("total", total);
        response.put("totalPages", totalPages);

        return ResponseEntity.ok(response);

    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTodo(@PathVariable String id, @RequestBody Todo updated) {
        Todo existing = todos.get(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        String validationError = validateTodo(updated);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(validationError);
        }

        existing.setText(updated.getText());
        existing.setDueDate(updated.getDueDate());
        existing.setPriority(updated.getPriority());

        return ResponseEntity.ok(existing);
    }

    @PostMapping("/{id}/done")
    public ResponseEntity<Void> markDone(@PathVariable String id) {
        Todo todo = todos.get(id);
        if (todo != null && !todo.isDone()) {
            todo.setDone(true);
            todo.setDoneDate(LocalDate.now());
        }
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/undone")
    public ResponseEntity<Void> markUndone(@PathVariable String id) {
        Todo todo = todos.get(id);
        if (todo != null && todo.isDone()) {
            todo.setDone(false);
            todo.setDoneDate(null);
        }
        return ResponseEntity.ok().build();
    }

    private String validateTodo(Todo todo) {
        if (todo.getText() == null || todo.getText().trim().isEmpty()) {
            return "Text is required.";
        }
        if (todo.getText().length() > 120) {
            return "Text cannot exceed 120 characters.";
        }
        if (todo.getPriority() == null) {
            return "Priority is required.";
        }
        return null;
    }

    private Comparator<Todo> getComparator(String sortBy) {
        switch (sortBy) {
            case "dueDate":
                return Comparator.comparing(Todo::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()));
            case "priority":
                return Comparator.comparing(Todo::getPriority);
            case "creationDate":
                return Comparator.comparing(Todo::getCreationDate, Comparator.nullsLast(Comparator.naturalOrder()));
            default:
                return Comparator.comparing(Todo::getCreationDate);
        }
    }
}