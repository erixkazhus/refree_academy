package com.fibaref.academy.controller;

import com.fibaref.academy.dto.QuestionDtos.AdminPagedQuestionsResponse;
import com.fibaref.academy.dto.QuestionDtos.AdminQuestionResponse;
import com.fibaref.academy.dto.QuestionDtos.AdminQuestionUpsertRequest;
import com.fibaref.academy.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/questions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuestionController {

    private final QuestionService questionService;

    public AdminQuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public List<AdminQuestionResponse> listAll() {
        return questionService.listAdminQuestions();
    }

    @GetMapping("/paged")
    public AdminPagedQuestionsResponse listPaged(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return questionService.listPagedAdminQuestions(category, search, page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminQuestionResponse create(@Valid @RequestBody AdminQuestionUpsertRequest req) {
        return questionService.createQuestion(req);
    }

    @PutMapping("/{id}")
    public AdminQuestionResponse update(
            @PathVariable Long id,
            @Valid @RequestBody AdminQuestionUpsertRequest req
    ) {
        return questionService.updateQuestion(id, req);
    }

    @PostMapping(value = "/{id}/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AdminQuestionResponse uploadVideo(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        return questionService.uploadQuestionVideo(id, file);
    }

    @DeleteMapping("/{id}/video")
    public AdminQuestionResponse removeVideo(@PathVariable Long id) {
        return questionService.removeQuestionVideo(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        questionService.deleteQuestion(id);
    }
}
