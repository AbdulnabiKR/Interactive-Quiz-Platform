package com.example.demo.dto;

import java.time.LocalDateTime;

public class QuizAttemptDTO {
    private Integer userId;
    private Integer quizId;
    private LocalDateTime startedAt;
    private Integer score;

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getQuizId() {
        return quizId;
    }

    public void setQuizId(Integer quizId) {
        this.quizId = quizId;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public Integer getScore() {
        return score;
    } // <--- add getter

    public void setScore(Integer score) {
        this.score = score;
    }
}
