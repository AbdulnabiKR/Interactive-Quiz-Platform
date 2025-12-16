package com.example.demo.controller;

import com.example.demo.model.QuizAttempt;
import com.example.demo.service.QuizAttemptService;
import com.example.demo.dto.QuizAttemptDTO;
import com.example.demo.dto.QuizAttemptSummaryDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quiz-attempts")
public class QuizAttemptController {
    @Autowired
    private QuizAttemptService attemptService;

    @PostMapping
    public QuizAttempt submitAttempt(@RequestBody QuizAttemptDTO dto) {
        return attemptService.saveAttempt(dto);
    }

    @GetMapping
    public List<QuizAttempt> getAttempts() {
        return attemptService.getAllAttempts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizAttempt> getAttemptById(@PathVariable Integer id) {
        QuizAttempt attempt = attemptService.getAttemptById(id);
        if (attempt != null) {
            return ResponseEntity.ok(attempt);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuizAttempt> updateAttempt(@PathVariable Integer id, @RequestBody QuizAttemptDTO dto) {
        QuizAttempt updatedAttempt = attemptService.updateAttempt(id, dto);
        if (updatedAttempt != null) {
            return ResponseEntity.ok(updatedAttempt);
        } else {
            return ResponseEntity.notFound().build(); // 404 if not found
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttempt(@PathVariable Integer id) {
        boolean deleted = attemptService.deleteAttempt(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/summary")
    public QuizAttemptSummaryDTO getSummary(@RequestParam Integer userId,
            @RequestParam Integer quizId) {
        return attemptService.getSummary(userId, quizId);
    }
}
