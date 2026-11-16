package com.fibaref.academy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class QuestionDtos {

    private QuestionDtos() {}

    public record PublicOptionResponse(
            Long id,
            int sortOrder,
            String optionLabel
    ) {}

    public record PublicQuestionResponse(
            Long id,
            String title,
            String ruleReference,
            String category,
            String difficulty,
            String prompt,
            String videoUrl,
            List<PublicOptionResponse> options
    ) {}

    public record CategoryCountResponse(
            String category,
            long count
    ) {}

    public record PagedQuestionsResponse(
            List<PublicQuestionResponse> items,
            long totalElements,
            int totalPages,
            int page,
            int size,
            long seed,
            List<CategoryCountResponse> categories
    ) {}

    public record AnswerSubmissionRequest(
            @NotNull(message = "selectedOptionId is required")
            Long selectedOptionId
    ) {}

    public record AnswerEvaluationResponse(
            Long questionId,
            Long selectedOptionId,
            boolean correct,
            String explanation,
            String ruleReference
    ) {}

    public record AdminOptionDto(
            @NotBlank(message = "Option label is required")
            @Size(max = 500)
            String optionLabel,

            boolean correct,

            @NotBlank(message = "Explanation is required for every answer option")
            @Size(max = 4000)
            String explanation
    ) {}

    public record AdminQuestionUpsertRequest(
            @NotBlank(message = "Title is required")
            @Size(max = 180)
            String title,

            @NotBlank(message = "Rule reference is required")
            @Size(max = 120)
            String ruleReference,

            @NotBlank(message = "Category is required")
            @Size(max = 80)
            String category,

            @NotBlank(message = "Difficulty is required")
            @Size(max = 40)
            String difficulty,

            @NotBlank(message = "Prompt is required")
            @Size(max = 4000)
            String prompt,

            @NotEmpty(message = "At least 2 answer options are required")
            @Size(min = 2, max = 6)
            List<@Valid AdminOptionDto> options
    ) {}

    public record AdminOptionResponse(
            Long id,
            int sortOrder,
            String optionLabel,
            boolean correct,
            String explanation
    ) {}

    public record AdminQuestionResponse(
            Long id,
            String title,
            String ruleReference,
            String category,
            String difficulty,
            String prompt,
            String videoUrl,
            List<AdminOptionResponse> options
    ) {}

    public record AdminPagedQuestionsResponse(
            List<AdminQuestionResponse> items,
            long totalElements,
            int totalPages,
            int page,
            int size,
            List<CategoryCountResponse> categories
    ) {}
}
