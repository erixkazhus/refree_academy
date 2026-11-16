package com.fibaref.academy.repository;

import com.fibaref.academy.model.RuleSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RuleSectionRepository extends JpaRepository<RuleSection, String> {

    @Query("SELECT DISTINCT s FROM RuleSection s LEFT JOIN FETCH s.articles ORDER BY s.sortOrder ASC")
    List<RuleSection> findAllWithArticlesOrderBySortOrder();
}
