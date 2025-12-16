package com.example.demo.service;

import com.example.demo.model.QuizAttempt;
import com.example.demo.model.User;
import com.example.demo.model.Quiz;
import com.example.demo.repository.QuizAttemptRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.QuizRepository;
import com.example.demo.dto.QuizAttemptDTO;
import com.example.demo.dto.QuizAttemptSummaryDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QuizAttemptService {
    @Autowired
    QuizAttemptRepository attemptRepository;
    @Autowired
    UserRepository userRepository;
    @Autowired
    QuizRepository quizRepository;

    public QuizAttempt saveAttempt(QuizAttemptDTO dto) {
        User user = userRepository.findById(dto.getUserId()).orElse(null);
        Quiz quiz = quizRepository.findById(dto.getQuizId()).orElse(null);
        if (user == null || quiz == null)
            return null;

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setStartedAt(dto.getStartedAt());
        attempt.setScore(dto.getScore());
        return attemptRepository.save(attempt);
    }

    public List<QuizAttempt> getAllAttempts() {
        return attemptRepository.findAll();
    }

    public QuizAttempt getAttemptById(Integer id) {
        return attemptRepository.findById(id).orElse(null);
    }

    public QuizAttempt updateAttempt(Integer id, QuizAttemptDTO dto) {
        QuizAttempt existing = attemptRepository.findById(id).orElse(null);
        if (existing == null)
            return null; // 404 if not found

        User user = userRepository.findById(dto.getUserId()).orElse(null);
        Quiz quiz = quizRepository.findById(dto.getQuizId()).orElse(null);
        if (user == null || quiz == null)
            return null; // 404 if user/quiz missing

        existing.setUser(user);
        existing.setQuiz(quiz);
        existing.setStartedAt(dto.getStartedAt());
        return attemptRepository.save(existing);
    }

    public boolean deleteAttempt(Integer id) {
        if (attemptRepository.existsById(id)) {
            attemptRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }

    public QuizAttemptSummaryDTO getSummary(Integer userId, Integer quizId) {
        List<QuizAttempt> attempts = attemptRepository.findByUserAndQuizOrderByStartedAtDesc(userId, quizId);
        long count = attempts.size();
        Integer lastScore = null;
        if (!attempts.isEmpty()) {
            lastScore = attempts.get(0).getScore(); // latest attempt
        }
        return new QuizAttemptSummaryDTO(count, lastScore);
    }

}
