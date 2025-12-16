package com.example.demo.service;

import com.example.demo.model.Question;
import com.example.demo.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class QuestionService {
    @Autowired
    private QuestionRepository questionRepository;

    // Create
    public Question addQuestion(Question question) {
        return questionRepository.save(question);
    }

    // List all
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    // Get questions by quiz ID (randomized, limited)
    public List<Question> getQuestionsByQuizId(Integer quizId) {
        List<Question> questions = questionRepository.findByQuizId(quizId);
        Collections.shuffle(questions); // random order every time

        int maxPerAttempt = 10;
        int limit = Math.min(maxPerAttempt, questions.size());
        return questions.subList(0, limit);
    }

    // Get by ID
    public Question getQuestionById(Integer id) {
        return questionRepository.findById(id).orElse(null);
    }

    // Update by ID
    public Question updateQuestion(Integer id, Question updated) {
        return questionRepository.findById(id)
                .map(existing -> {
                    existing.setQuestionText(updated.getQuestionText());
                    existing.setOptionA(updated.getOptionA());
                    existing.setOptionB(updated.getOptionB());
                    existing.setOptionC(updated.getOptionC());
                    existing.setOptionD(updated.getOptionD());
                    existing.setCorrectOption(updated.getCorrectOption());
                    existing.setCreatedAt(updated.getCreatedAt());
                    return questionRepository.save(existing);
                })
                .orElse(null);
    }

    // Delete by ID
    public boolean deleteQuestion(Integer id) {
        try {
            if (questionRepository.existsById(id)) {
                questionRepository.deleteById(id);
                return true;
            } else {
                return false;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
