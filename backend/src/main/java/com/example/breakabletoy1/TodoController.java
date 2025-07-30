package com.example.breakabletoy1;

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

    private final Map<String, Todo> todos = new ConcurrentHashMap<>();

    @PostMapping
    public ResponseEntity<?> createTodo(@RequestBody Todo todo) {
        String validationError = validateTodo(todo);
        if (validationError != null) {
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
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) List<Todo.Priority> priority,
            @RequestParam(required = false) String text,
            @RequestParam(defaultValue = "creationDate") String sortBy
    ) {
        Stream<Todo> stream = todos.values().stream();
        if (priority != null) {
            if (priority.isEmpty()) {
                stream = Stream.empty();
            } else {
                stream = stream.filter(todo -> priority.contains(todo.getPriority()));
            }
        } else {
            stream = Stream.empty();
        }
        if (status != null) {
            boolean wantsDone = status.contains("done");
            boolean wantsUndone = status.contains("undone");

            if (wantsDone && wantsUndone) {
c            } else if (wantsDone) {
                stream = stream.filter(Todo::isDone);
            } else if (wantsUndone) {
                stream = stream.filter(todo -> !todo.isDone());
            } else {
c                stream = Stream.empty();
            }
        } else {
            stream = Stream.empty();
        }
        if (text != null && !text.isBlank()) {
            String lowerText = text.toLowerCase();
            stream = stream.filter(todo -> todo.getText().toLowerCase().contains(lowerText));
        }

        List<Todo> sortedFiltered = stream
                .sorted(getComparator(sortBy))
                .collect(Collectors.toList());

        int total = sortedFiltered.size();
        int totalPages = (int) Math.ceil((double) total / size);

        List<Todo> paged = sortedFiltered.stream()
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable String id) {
        todos.remove(id);
        return ResponseEntity.noContent().build();
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
        return switch (sortBy) {
            case "dueDate" -> Comparator.comparing(
                    Todo::getDueDate,
                    Comparator.nullsLast(Comparator.naturalOrder())
            );
            case "priority" -> Comparator.comparing(Todo::getPriority);
            case "creationDate", "created", "date" -> Comparator.comparing(
                    Todo::getCreationDate,
                    Comparator.nullsLast(Comparator.naturalOrder())
            );
            default -> Comparator.comparing(Todo::getCreationDate);
        };
    }
}
