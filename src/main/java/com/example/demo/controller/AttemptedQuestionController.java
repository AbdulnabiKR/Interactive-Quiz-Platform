package com.example.demo.controller;

import com.example.demo.model.AttemptedQuestion;
import com.example.demo.service.AttemptedQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/attempted-questions")
public class AttemptedQuestionController {
    @Autowired
    private AttemptedQuestionService service;

    // Create AttemptedQuestion
    @PostMapping
    public ResponseEntity<AttemptedQuestion> save(@RequestBody AttemptedQuestion q) {
        AttemptedQuestion saved = service.save(q);
        return ResponseEntity.ok(saved);
    }

    // List all AttemptedQuestions
    @GetMapping
    public ResponseEntity<List<AttemptedQuestion>> all() {
        List<AttemptedQuestion> list = service.getAll();
        return ResponseEntity.ok(list);
    }

    // Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<AttemptedQuestion> getById(@PathVariable Integer id) {
        AttemptedQuestion found = service.getById(id);
        if (found != null) {
            return ResponseEntity.ok(found);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE by ID (optional)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        boolean deleted = service.delete(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
