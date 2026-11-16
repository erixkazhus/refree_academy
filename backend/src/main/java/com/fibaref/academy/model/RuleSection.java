package com.fibaref.academy.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rule_sections")
public class RuleSection {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false)
    private int sortOrder;

    @Column(nullable = false, length = 60)
    private String ruleNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<RuleArticle> articles = new ArrayList<>();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public String getRuleNumber() { return ruleNumber; }
    public void setRuleNumber(String ruleNumber) { this.ruleNumber = ruleNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public List<RuleArticle> getArticles() { return articles; }
    public void setArticles(List<RuleArticle> articles) { this.articles = articles; }
}
