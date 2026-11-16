package com.fibaref.academy.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rule_sub_points")
public class RuleSubPoint {

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

    @Column(nullable = false, length = 240)
    private String heading;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(columnDefinition = "TEXT")
    private String bulletsJson;

    public Long getId() { return id; }
    public RuleArticle getArticle() { return article; }
    public void setArticle(RuleArticle article) { this.article = article; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getHeading() { return heading; }
    public void setHeading(String heading) { this.heading = heading; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getBulletsJson() { return bulletsJson; }
    public void setBulletsJson(String bulletsJson) { this.bulletsJson = bulletsJson; }
}
