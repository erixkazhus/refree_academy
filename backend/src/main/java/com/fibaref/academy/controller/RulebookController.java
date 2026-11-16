package com.fibaref.academy.controller;

import com.fibaref.academy.dto.RulebookDtos.RulebookBundleResponse;
import com.fibaref.academy.model.RefereeSignal;
import com.fibaref.academy.service.RulebookService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/rulebook")
public class RulebookController {

    private final RulebookService rulebookService;

    public RulebookController(RulebookService rulebookService) {
        this.rulebookService = rulebookService;
    }

    @GetMapping
    public ResponseEntity<RulebookBundleResponse> getRulebook() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(15)).cachePublic())
                .body(rulebookService.getRulebookBundle());
    }

    @GetMapping("/signals/{signalNumber}/image")
    public ResponseEntity<byte[]> getSignalImage(@PathVariable int signalNumber) {
        RefereeSignal signal = rulebookService.loadSignalImage(signalNumber);
        MediaType mediaType = MediaType.parseMediaType(
                signal.getContentType() != null ? signal.getContentType() : "image/png"
        );
        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePublic())
                .body(signal.getImageData());
    }
}
