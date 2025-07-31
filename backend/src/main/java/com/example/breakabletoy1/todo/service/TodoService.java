package com.example.breakabletoy1.todo.service;

import com.example.breakabletoy1.todo.model.AverageCompletionTimes;
import com.example.breakabletoy1.todo.model.PaginatedTodos;
import com.example.breakabletoy1.todo.model.Todo;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.*;

@Service
public class TodoService {
    private final List<Todo> todos = new ArrayList<>();

    public PaginatedTodos getTodos(List<Todo.Priority> priority,
                                   List<String> status,
                                   String text,
                                   int page,
                                   int size,
                                   String sortBy) {
        List<Todo> filtered = new ArrayList<>();

        for (Todo todo : todos) {
            boolean matchesPriority = true;
            if (priority != null && !priority.isEmpty()) {
                matchesPriority = priority.contains(todo.getPriority());
            } else {
                matchesPriority = false;
            }

            boolean matchesStatus = true;
            if (status != null) {
                boolean wantsDone = status.contains("done");
                boolean wantsUndone = status.contains("undone");

                if (wantsDone && wantsUndone) {
                    matchesStatus = true;
                } else if (wantsDone) {
                    matchesStatus = todo.isDone();
                } else if (wantsUndone) {
                    matchesStatus = !todo.isDone();
                } else {
                    matchesStatus = false;
                }
            } else {
                matchesStatus = false;
            }

            boolean matchesText = true;
            if (text != null && !text.isBlank()) {
                matchesText = todo.getText().toLowerCase().contains(text.toLowerCase());
            }

            if (matchesPriority && matchesStatus && matchesText) {
                filtered.add(todo);
            }
        }

        filtered.sort(getComparator(sortBy));

        int total = filtered.size();
        int totalPages = (int) Math.ceil((double) total / size);

        int start = page * size;
        int end = Math.min(start + size, total);
        List<Todo> paged = (start >= total) ? Collections.emptyList() : filtered.subList(start, end);

        return new PaginatedTodos(paged, page, size, total, totalPages);
    }

    public Todo createTodo(Todo todo) {
        String id = UUID.randomUUID().toString();
        int randomDaysAgo = new Random().nextInt(30);
        LocalDate randomCreationDate = LocalDate.now().minusDays(randomDaysAgo);

        todo.setId(id);
        todo.setCreationDate(randomCreationDate);
        todo.setDone(false);
        todo.setDoneDate(null);

        todos.add(todo);
        return todo;
    }

    public Todo updateTodo(String id, Todo updated) {
        for (Todo existing : todos) {
            if (existing.getId().equals(id)) {
                existing.setText(updated.getText());
                existing.setDueDate(updated.getDueDate());
                existing.setPriority(updated.getPriority());
                return existing;
            }
        }
        return null;
    }

    public boolean markDone(String id) {
        for (Todo todo : todos) {
            if (todo.getId().equals(id) && !todo.isDone()) {
                todo.setDone(true);
                todo.setDoneDate(LocalDate.now());
                return true;
            }
        }
        return false;
    }

    public boolean markUndone(String id) {
        for (Todo todo : todos) {
            if (todo.getId().equals(id) && todo.isDone()) {
                todo.setDone(false);
                todo.setDoneDate(null);
                return true;
            }
        }
        return false;
    }

    public boolean deleteTodo(String id) {
        return todos.removeIf(todo -> todo.getId().equals(id));
    }

    public AverageCompletionTimes getAverageCompletionTimes() {
        List<Todo> doneTodos = new ArrayList<>();
        for (Todo todo : todos) {
            if (todo.isDone() && todo.getCreationDate() != null && todo.getDoneDate() != null) {
                doneTodos.add(todo);
            }
        }

        long totalMinutes = 0;
        Map<Todo.Priority, Long> prioritySums = new EnumMap<>(Todo.Priority.class);
        Map<Todo.Priority, Long> priorityCounts = new EnumMap<>(Todo.Priority.class);

        for (Todo todo : doneTodos) {
            long minutes = Duration.between(
                    todo.getCreationDate().atStartOfDay(),
                    todo.getDoneDate().atStartOfDay()
            ).toMinutes();

            totalMinutes += minutes;

            Todo.Priority priority = todo.getPriority();
            prioritySums.put(priority, prioritySums.getOrDefault(priority, 0L) + minutes);
            priorityCounts.put(priority, priorityCounts.getOrDefault(priority, 0L) + 1);
        }

        double average = doneTodos.isEmpty() ? 0 : (double) totalMinutes / doneTodos.size();

        Map<String, Double> averagesByPriority = new HashMap<>();
        for (Todo.Priority p : Todo.Priority.values()) {
            long sum = prioritySums.getOrDefault(p, 0L);
            long count = priorityCounts.getOrDefault(p, 0L);
            double avg = (count == 0) ? 0 : (double) sum / count;
            averagesByPriority.put(p.name().toLowerCase(), avg);
        }

        return new AverageCompletionTimes(average, averagesByPriority);

    }


    private Comparator<Todo> getComparator(String sortBy) {
        boolean descending = false;

        if (sortBy == null) {
            sortBy = "creationDate";
        }

        if (sortBy.endsWith("_desc")) {
            descending = true;
            sortBy = sortBy.substring(0, sortBy.length() - 5);
        }

        Comparator<Todo> comparator = switch (sortBy) {
            case "dueDate" -> Comparator.comparing(Todo::getDueDate, Comparator.nullsLast(Comparator.naturalOrder()));
            case "priority" -> Comparator.comparing(Todo::getPriority);
            case "creationDate" -> Comparator.comparing(Todo::getCreationDate, Comparator.nullsLast(Comparator.naturalOrder()));
            default -> Comparator.comparing(Todo::getCreationDate, Comparator.nullsLast(Comparator.naturalOrder()));
        };

        return descending ? comparator.reversed() : comparator;
    }


    public String validateTodo(Todo todo) {
        if (todo.getText() == null || todo.getText().trim().isEmpty()) return "Text is required.";
        if (todo.getText().length() > 120) return "Text cannot exceed 120 characters.";
        if (todo.getPriority() == null) return "Priority is required.";
        return null;
    }
}
