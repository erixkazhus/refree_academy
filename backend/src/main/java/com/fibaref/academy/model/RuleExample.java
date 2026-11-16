package com.fibaref.academy.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rule_examples")
public class RuleExample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private RuleArticle article;

    @Column(nullable = false)
    private int sortOrder;

    @Column(nullable = false, length = 40)
    private String code;

    @Column(nullable = false, length = 30)
    private String kind;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(columnDefinition = "TEXT")
    private String interpretation;

    public Long getId() { return id; }
    public RuleArticle getArticle() { return article; }
    public void setArticle(RuleArticle article) { this.article = article; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getInterpretation() { return interpretation; }
    public void setInterpretation(String interpretation) { this.interpretation = interpretation; }
}
