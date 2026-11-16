package com.fibaref.academy.repository;

import com.fibaref.academy.dto.RulebookDtos.PdfMeta;
import com.fibaref.academy.model.RulebookDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RulebookDocumentRepository extends JpaRepository<RulebookDocument, String> {

    @Query("SELECT new com.fibaref.academy.dto.RulebookDtos$PdfMeta(d.filename, d.title, d.version, d.effectiveDate, d.description, d.sizeBytes) " +
            "FROM RulebookDocument d ORDER BY d.filename ASC")
    List<PdfMeta> findAllMetaOrderByFilename();

    @Query("SELECT d.filename FROM RulebookDocument d")
    List<String> findAllFilenames();
}
