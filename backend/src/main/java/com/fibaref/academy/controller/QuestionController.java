package com.fibaref.academy.controller;

import com.fibaref.academy.dto.QuestionDtos.AnswerEvaluationResponse;
import com.fibaref.academy.dto.QuestionDtos.AnswerSubmissionRequest;
import com.fibaref.academy.dto.QuestionDtos.PagedQuestionsResponse;
import com.fibaref.academy.dto.QuestionDtos.PublicQuestionResponse;
import com.fibaref.academy.model.User;
import com.fibaref.academy.service.QuestionService;
import com.fibaref.academy.service.VideoStorageService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api")
public class QuestionController {

    private final QuestionService questionService;
    private final VideoStorageService videoStorageService;

    public QuestionController(QuestionService questionService, VideoStorageService videoStorageService) {
        this.questionService = questionService;
        this.videoStorageService = videoStorageService;
    }

    @GetMapping("/questions")
    public List<PublicQuestionResponse> getQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        return questionService.listPublicQuestions(category, search);
    }

    @GetMapping("/questions/paged")
    public PagedQuestionsResponse getQuestionsPaged(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1") int size,
            @RequestParam(defaultValue = "false") boolean shuffle,
            @RequestParam(required = false) Long seed
    ) {
        return questionService.listPagedQuestions(category, search, page, size, shuffle, seed);
    }

    @PostMapping("/questions/{id}/answer")
    public AnswerEvaluationResponse submitAnswer(
            @PathVariable Long id,
            @Valid @RequestBody AnswerSubmissionRequest req,
            @AuthenticationPrincipal User currentUser
    ) {
        return questionService.evaluateAnswer(id, req.selectedOptionId(), currentUser);
    }

    @GetMapping("/videos/{filename:.+}")
    public ResponseEntity<Resource> streamVideo(@PathVariable String filename) {
        String fallbackUrl = questionService.findSourceVideoUrl(filename).orElse(null);
        Resource resource = videoStorageService.loadAsResource(filename, fallbackUrl);
        MediaType mediaType = videoStorageService.resolveMediaType(filename);
        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic())
                .body(resource);
    }
}
