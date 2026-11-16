package com.fibaref.academy;

import com.fibaref.academy.service.VideoStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SecurityAndValidationTest {

    @Test
    void rejectsDisguisedScriptUploadedAsMp4(@TempDir Path tempDir) {
        VideoStorageService service = new VideoStorageService(tempDir.toString(), tempDir.resolve("missing").toString());
        MockMultipartFile fakeMp4 = new MockMultipartFile(
                "file",
                "evil.mp4",
                "video/mp4",
                "<script>alert(1)</script>".getBytes()
        );
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.storeUploadedVideo(fakeMp4));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void rejectsPathTraversalOnVideoLoad(@TempDir Path tempDir) {
        VideoStorageService service = new VideoStorageService(tempDir.toString(), tempDir.resolve("missing").toString());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.loadAsResource("../application.yml"));
        assertEquals(400, ex.getStatusCode().value());
    }
}
