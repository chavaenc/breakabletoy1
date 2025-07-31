package com.example.breakabletoy1.todo.model;


import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;
@Data
@AllArgsConstructor
public class AverageCompletionTimes {
    private double averageTime;
    private Map<String, Double> byPriority;

    public AverageCompletionTimes() {}
}

