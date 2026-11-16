package com.fibaref.academy.repository;

import com.fibaref.academy.model.RuleExample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RuleExampleRepository extends JpaRepository<RuleExample, Long> {

    @Query("SELECT ex.article.id, ex FROM RuleExample ex ORDER BY ex.sortOrder ASC")
    List<Object[]> findAllWithArticleIdOrderBySortOrder();
}
