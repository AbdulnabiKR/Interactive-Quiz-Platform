package com.example.demo.repository;

import com.example.demo.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Integer> {

    @Query("SELECT a FROM QuizAttempt a " +
            "WHERE a.user.id = :userId AND a.quiz.id = :quizId " +
            "ORDER BY a.startedAt DESC")
    List<QuizAttempt> findByUserAndQuizOrderByStartedAtDesc(@Param("userId") Integer userId,
            @Param("quizId") Integer quizId);
}
