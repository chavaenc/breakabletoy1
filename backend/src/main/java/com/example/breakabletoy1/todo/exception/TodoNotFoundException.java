package com.example.breakabletoy1.todo.exception;

public class TodoNotFoundException extends RuntimeException {
    public TodoNotFoundException(String id) {
        super("Todo not found with id: " + id);
    }
}
