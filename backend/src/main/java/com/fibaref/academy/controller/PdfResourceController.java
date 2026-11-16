package com.fibaref.academy.controller;

import com.fibaref.academy.model.RulebookDocument;
import com.fibaref.academy.repository.RulebookDocumentRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/pdfs")
public class PdfResourceController {

    private static final Pattern SAFE_PDF_FILENAME = Pattern.compile("^[a-zA-Z0-9._-]+\\.pdf$");
    private final RulebookDocumentRepository documentRepository;

    public PdfResourceController(RulebookDocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<PdfDocumentDto> listRulebookPdfs() {
        return documentRepository.findAllMetaOrderByFilename().stream()
                .map(meta -> new PdfDocumentDto(
                        meta.filename(),
                        meta.title(),
                        meta.version(),
                        meta.effectiveDate(),
                        meta.description(),
                        meta.sizeBytes(),
                        meta.sizeBytes() > 0,
                        "/api/pdfs/" + meta.filename()
                ))
                .toList();
    }

    @GetMapping("/{filename:.+}")
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> downloadPdf(@PathVariable String filename) {
        if (filename == null || filename.contains("..") || !SAFE_PDF_FILENAME.matcher(filename).matches()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Requested rulebook PDF not found.");
        }

        RulebookDocument doc = documentRepository.findById(filename)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rulebook PDF file is unavailable."));

        byte[] bytes = doc.getData();
        if (bytes == null || !hasPdfMagicBytes(bytes)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rulebook PDF file is unavailable.");
        }

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(doc.getFilename(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .contentLength(bytes.length)
                .body(new ByteArrayResource(bytes));
    }

    private boolean hasPdfMagicBytes(byte[] bytes) {
        return bytes.length >= 5 && "%PDF-".equals(new String(bytes, 0, 5, StandardCharsets.US_ASCII));
    }

    public record PdfDocumentDto(
            String filename,
            String title,
            String version,
            String effectiveDate,
            String description,
            long sizeBytes,
            boolean available,
            String downloadUrl
    ) {}
}
