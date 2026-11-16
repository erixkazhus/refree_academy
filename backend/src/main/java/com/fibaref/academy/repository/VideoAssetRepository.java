package com.fibaref.academy.repository;

import com.fibaref.academy.model.VideoAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VideoAssetRepository extends JpaRepository<VideoAsset, String> {

    @Query("SELECT v.storageSource FROM VideoAsset v WHERE v.filename = :filename")
    Optional<String> findStorageSourceByFilename(@Param("filename") String filename);

    @Query("SELECT v.filename FROM VideoAsset v")
    List<String> findAllFilenames();
}
