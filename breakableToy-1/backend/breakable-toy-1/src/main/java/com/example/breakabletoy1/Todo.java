package com.example.breakabletoy1;

import java.time.LocalDate;
import java.util.Objects;

public class Todo {
    private String id;
    private String text;
    private LocalDate dueDate;
    private boolean done = false;
    private LocalDate doneDate;
    private Priority priority;
    private LocalDate creationDate;
    public enum Priority {
        HIGH, MEDIUM, LOW
    }

    public Todo(LocalDate creationDate, Priority priority,
                boolean done, LocalDate dueDate, String text,
                String id) {
        this.creationDate = creationDate;
        this.priority = priority;
        this.done = done;
        this.dueDate = dueDate;
        this.text = text;
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public LocalDate getDoneDate() {
        return doneDate;
    }

    public void setDoneDate(LocalDate doneDate) {
        this.doneDate = doneDate;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public LocalDate getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDate creationDate) {
        this.creationDate = creationDate;
    }
}