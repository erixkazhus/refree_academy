package com.fibaref.academy.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rule_articles")
public class RuleArticle {

    @Id
    @Column(length = 40)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private RuleSection section;

    @Column(nullable = false)
    private int sortOrder;

    @Column(nullable = false, length = 60)
    private String articleNumber;

    @Column(nullable = false, length = 240)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String signalNumbersCsv;

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<RuleSubPoint> subPoints = new ArrayList<>();

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<RuleExample> examples = new ArrayList<>();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public RuleSection getSection() { return section; }
    public void setSection(RuleSection section) { this.section = section; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public String getArticleNumber() { return articleNumber; }
    public void setArticleNumber(String articleNumber) { this.articleNumber = articleNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
    public String getSignalNumbersCsv() { return signalNumbersCsv; }
    public void setSignalNumbersCsv(String signalNumbersCsv) { this.signalNumbersCsv = signalNumbersCsv; }
    public List<RuleSubPoint> getSubPoints() { return subPoints; }
    public void setSubPoints(List<RuleSubPoint> subPoints) { this.subPoints = subPoints; }
    public List<RuleExample> getExamples() { return examples; }
    public void setExamples(List<RuleExample> examples) { this.examples = examples; }
}
