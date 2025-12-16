package com.example.demo.dto;

public class QuizAttemptSummaryDTO {
    private long attemptsCount;
    private Integer lastScore; // optional

    public QuizAttemptSummaryDTO(long attemptsCount, Integer lastScore) {
        this.attemptsCount = attemptsCount;
        this.lastScore = lastScore;
    }

    public long getAttemptsCount() {
        return attemptsCount;
    }

    public void setAttemptsCount(long attemptsCount) {
        this.attemptsCount = attemptsCount;
    }

    public Integer getLastScore() {
        return lastScore;
    }

    public void setLastScore(Integer lastScore) {
        this.lastScore = lastScore;
    }
}
