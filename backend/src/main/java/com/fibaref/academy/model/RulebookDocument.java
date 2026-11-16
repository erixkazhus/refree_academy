package com.fibaref.academy.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "rulebook_documents")
public class RulebookDocument {

    @Id
    @Column(length = 160)
    private String filename;

    @Column(nullable = false, length = 240)
    private String title;

    @Column(nullable = false, length = 40)
    private String version;

    @Column(nullable = false, length = 60)
    private String effectiveDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private long sizeBytes;

    @Column(nullable = false, length = 80)
    private String contentType = "application/pdf";

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(nullable = false, columnDefinition = "BYTEA")
    private byte[] data;

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getEffectiveDate() { return effectiveDate; }
    public void setEffectiveDate(String effectiveDate) { this.effectiveDate = effectiveDate; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public byte[] getData() { return data; }
    public void setData(byte[] data) { this.data = data; }
}
