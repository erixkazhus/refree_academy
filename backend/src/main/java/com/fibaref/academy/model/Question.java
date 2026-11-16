package com.fibaref.academy.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions", indexes = {
        @Index(name = "idx_questions_category", columnList = "category")
})
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 120)
    private String ruleReference;

    @Column(nullable = false, length = 80)
    private String category;

    @Column(nullable = false, length = 40)
    private String difficulty = "FIBA Level 2";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String prompt;

    @Column(length = 255)
    private String videoFilename;

    @Column(length = 500)
    private String sourceVideoUrl;

    @Column(length = 120, unique = true)
    private String externalCode;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sortOrder ASC")
    private List<AnswerOption> options = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void touch() {
        this.updatedAt = Instant.now();
    }

    public void replaceOptions(List<AnswerOption> newOptions) {
        this.options.clear();
        for (AnswerOption option : newOptions) {
            option.setQuestion(this);
            this.options.add(option);
        }
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getRuleReference() { return ruleReference; }
    public void setRuleReference(String ruleReference) { this.ruleReference = ruleReference; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public String getVideoFilename() { return videoFilename; }
    public void setVideoFilename(String videoFilename) { this.videoFilename = videoFilename; }
    public String getSourceVideoUrl() { return sourceVideoUrl; }
    public void setSourceVideoUrl(String sourceVideoUrl) { this.sourceVideoUrl = sourceVideoUrl; }
    public String getExternalCode() { return externalCode; }
    public void setExternalCode(String externalCode) { this.externalCode = externalCode; }
    public List<AnswerOption> getOptions() { return options; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
