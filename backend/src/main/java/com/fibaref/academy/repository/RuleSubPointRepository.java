package com.fibaref.academy.repository;

import com.fibaref.academy.model.RuleSubPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RuleSubPointRepository extends JpaRepository<RuleSubPoint, Long> {

    @Query("SELECT sp.article.id, sp FROM RuleSubPoint sp ORDER BY sp.sortOrder ASC")
    List<Object[]> findAllWithArticleIdOrderBySortOrder();
}
