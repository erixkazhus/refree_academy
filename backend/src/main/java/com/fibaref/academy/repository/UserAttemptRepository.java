package com.fibaref.academy.repository;

import com.fibaref.academy.model.UserAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAttemptRepository extends JpaRepository<UserAttempt, Long> {
    long countByUserIdAndCorrectTrue(Long userId);
    long countByUserId(Long userId);
    void deleteByQuestionId(Long questionId);
}
