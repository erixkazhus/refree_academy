package com.fibaref.academy.repository;

import com.fibaref.academy.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findAllByOrderByIdAsc();

    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.options ORDER BY q.id ASC")
    List<Question> findAllWithOptionsOrderByIdAsc();

    List<Question> findByCategoryIgnoreCaseOrderByIdAsc(String category);

    @Query("SELECT q FROM Question q WHERE LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' " +
            "OR LOWER(q.ruleReference) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' " +
            "OR LOWER(q.prompt) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' ORDER BY q.id ASC")
    List<Question> searchAllCategories(@Param("search") String search);

    @Query("SELECT q FROM Question q WHERE LOWER(q.category) = LOWER(:category) AND (" +
            "LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' " +
            "OR LOWER(q.ruleReference) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' " +
            "OR LOWER(q.prompt) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\') ORDER BY q.id ASC")
    List<Question> searchByCategoryAndQuery(@Param("category") String category, @Param("search") String search);

    @Query("SELECT q.id FROM Question q ORDER BY q.id ASC")
    List<Long> findAllIdsOrderByIdAsc();

    @Query("SELECT q.id FROM Question q WHERE LOWER(q.category) = LOWER(:category) ORDER BY q.id ASC")
    List<Long> findIdsByCategoryIgnoreCaseOrderByIdAsc(@Param("category") String category);

    @Query("SELECT q.id FROM Question q WHERE LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' " +
            "OR LOWER(q.ruleReference) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' " +
            "OR LOWER(q.prompt) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' ORDER BY q.id ASC")
    List<Long> findIdsBySearchAllCategories(@Param("search") String search);

    @Query("SELECT q.id FROM Question q WHERE LOWER(q.category) = LOWER(:category) AND (" +
            "LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' " +
            "OR LOWER(q.ruleReference) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\' " +
            "OR LOWER(q.prompt) LIKE LOWER(CONCAT('%', :search, '%')) ESCAPE '\\') ORDER BY q.id ASC")
    List<Long> findIdsByCategoryAndSearch(@Param("category") String category, @Param("search") String search);

    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.options WHERE q.id IN :ids")
    List<Question> findAllWithOptionsByIdIn(@Param("ids") List<Long> ids);

    @Query("SELECT q.category, COUNT(q) FROM Question q GROUP BY q.category ORDER BY q.category ASC")
    List<Object[]> findCategoryCounts();

    Optional<Question> findFirstByVideoFilename(String videoFilename);

    @Query("SELECT q.externalCode FROM Question q WHERE q.externalCode IS NOT NULL")
    List<String> findAllExternalCodes();

    List<Question> findByExternalCodeIsNullOrderByIdAsc();
}
