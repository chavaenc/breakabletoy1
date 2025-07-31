package com.example.breakabletoy1.todo.model;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PaginatedTodos {
    private List<Todo> todos;
    private int page;
    private int size;
    private int total;
    private int totalPages;

    public PaginatedTodos() {}


}

