package com.fibaref.academy.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "referee_signals")
public class RefereeSignal {

    @Id
    private Integer signalNumber;

    @Column(nullable = false, length = 120)
    private String category;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String action;

    @Column(nullable = false, length = 80)
    private String contentType = "image/png";

    @Column(nullable = false)
    private long sizeBytes;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(nullable = false, columnDefinition = "BYTEA")
    private byte[] imageData;

    public Integer getSignalNumber() { return signalNumber; }
    public void setSignalNumber(Integer signalNumber) { this.signalNumber = signalNumber; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }
    public byte[] getImageData() { return imageData; }
    public void setImageData(byte[] imageData) { this.imageData = imageData; }
}
