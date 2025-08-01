package com.example.breakabletoy1.todo.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor

public class Todo {
    private String id;
    private String text;
    private LocalDate dueDate;
    private boolean done = false;
    private LocalDate doneDate;
    private Priority priority;
    private LocalDate creationDate;

    public Todo() {
    }
}
