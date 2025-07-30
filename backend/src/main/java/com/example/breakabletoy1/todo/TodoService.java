package com.example.breakabletoy1.todo;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class TodoService {
    private final Map<String, Todo> todos = new ConcurrentHashMap<>();

    public Map<String, Object> getTodos(List<Todo.Priority> priority,
                                        List<String> status,
                                        String text,
                                        int page,
                                        int size,
                                        String sortBy) {
        Stream<Todo> stream = todos.values().stream();

        if (priority != null) {
            if (priority.isEmpty()) {
                stream = Stream.empty();
            } else {
                stream = stream.filter(todo -> priority.contains(todo.getPriority()));
            }
        }

        if (status != null) {
            boolean wantsDone = status.contains("done");
            boolean wantsUndone = status.contains("undone");

            if (!(wantsDone && wantsUndone)) {
                if (wantsDone) stream = stream.filter(Todo::isDone);
                else if (wantsUndone) stream = stream.filter(todo -> !todo.isDone());
                else stream = Stream.empty();
            }
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

        return response;
    }

    public Todo createTodo(Todo todo) {
        String id = UUID.randomUUID().toString();
        int randomDaysAgo = new Random().nextInt(30);
        LocalDate randomCreationDate = LocalDate.now().minusDays(randomDaysAgo);

        todo.setId(id);
        todo.setCreationDate(randomCreationDate);
        todo.setDone(false);
        todo.setDoneDate(null);

        todos.put(id, todo);
        return todo;
    }

    public Todo updateTodo(String id, Todo updated) {
        Todo existing = todos.get(id);
        if (existing != null) {
            existing.setText(updated.getText());
            existing.setDueDate(updated.getDueDate());
            existing.setPriority(updated.getPriority());
        }
        return existing;
    }

    public boolean markDone(String id) {
        Todo todo = todos.get(id);
        if (todo != null && !todo.isDone()) {
            todo.setDone(true);
            todo.setDoneDate(LocalDate.now());
            return true;
        }
        return false;
    }

    public boolean markUndone(String id) {
        Todo todo = todos.get(id);
        if (todo != null && todo.isDone()) {
            todo.setDone(false);
            todo.setDoneDate(null);
            return true;
        }
        return false;
    }

    public boolean deleteTodo(String id) {
        return todos.remove(id) != null;
    }

    public Map<String, Object> getAverageCompletionTimes() {
        List<Todo> doneTodos = todos.values().stream()
                .filter(Todo::isDone)
                .filter(todo -> todo.getCreationDate() != null && todo.getDoneDate() != null)
                .toList();

        long totalMinutes = 0;
        Map<Todo.Priority, Long> prioritySums = new EnumMap<>(Todo.Priority.class);
        Map<Todo.Priority, Long> priorityCounts = new EnumMap<>(Todo.Priority.class);

        for (Todo todo : doneTodos) {
            long minutes = Duration.between(todo.getCreationDate().atStartOfDay(), todo.getDoneDate().atStartOfDay()).toMinutes();
            totalMinutes += minutes;
            prioritySums.merge(todo.getPriority(), minutes, Long::sum);
            priorityCounts.merge(todo.getPriority(), 1L, Long::sum);
        }

        double average = doneTodos.isEmpty() ? 0 : (double) totalMinutes / doneTodos.size();

        Map<String, Double> averagesByPriority = new HashMap<>();
        for (Todo.Priority p : Todo.Priority.values()) {
            long sum = prioritySums.getOrDefault(p, 0L);
            long count = priorityCounts.getOrDefault(p, 0L);
            averagesByPriority.put(p.name().toLowerCase(), count == 0 ? 0 : (double) sum / count);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("averageTime", average);
        response.put("byPriority", averagesByPriority);
        return response;
    }

    private Comparator<Todo> getComparator(String sortBy) {
        return switch (sortBy) {
            case "dueDate" -> Comparator.comparing(Todo::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()));
            case "priority" -> Comparator.comparing(Todo::getPriority);
            default -> Comparator.comparing(Todo::getCreationDate, Comparator.nullsLast(Comparator.naturalOrder()));
        };
    }

    public String validateTodo(Todo todo) {
        if (todo.getText() == null || todo.getText().trim().isEmpty()) return "Text is required.";
        if (todo.getText().length() > 120) return "Text cannot exceed 120 characters.";
        if (todo.getPriority() == null) return "Priority is required.";
        return null;
    }
}
