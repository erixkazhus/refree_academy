package com.fibaref.academy.model;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "video_assets")
public class VideoAsset {

    @Id
    @Column(length = 255)
    private String filename;

    @Column(nullable = false, length = 80)
    private String contentType;

    @Column(nullable = false)
    private long fileSize;

    /**
     * DATABASE = video bytes stored directly in PostgreSQL BYTEA (Admin uploads)
     * SEED_DISK = bulk read-only clip tracked & allowlisted via PostgreSQL metadata
     */
    @Column(nullable = false, length = 30)
    private String storageSource;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(columnDefinition = "BYTEA")
    private byte[] data;

    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    public String getStorageSource() { return storageSource; }
    public void setStorageSource(String storageSource) { this.storageSource = storageSource; }
    public byte[] getData() { return data; }
    public void setData(byte[] data) { this.data = data; }
}
