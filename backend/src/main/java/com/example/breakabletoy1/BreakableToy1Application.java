package com.example.breakabletoy1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class BreakableToy1Application {

	public static void main(String[] args) {
		SpringApplication.run(BreakableToy1Application.class, args);
	}

}
