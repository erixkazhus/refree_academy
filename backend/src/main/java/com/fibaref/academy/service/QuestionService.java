package com.fibaref.academy.service;

import com.fibaref.academy.dto.QuestionDtos.CategoryCountResponse;
import com.fibaref.academy.dto.QuestionDtos.PagedQuestionsResponse;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import com.fibaref.academy.dto.QuestionDtos.*;
import com.fibaref.academy.model.AnswerOption;
import com.fibaref.academy.model.Question;
import com.fibaref.academy.model.User;
import com.fibaref.academy.model.UserAttempt;
import com.fibaref.academy.repository.QuestionRepository;
import com.fibaref.academy.repository.UserAttemptRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final UserAttemptRepository attemptRepository;
    private final VideoStorageService videoStorageService;

    public QuestionService(
            QuestionRepository questionRepository,
            UserAttemptRepository attemptRepository,
            VideoStorageService videoStorageService
    ) {
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.videoStorageService = videoStorageService;
    }

    @Transactional(readOnly = true)
    public List<PublicQuestionResponse> listPublicQuestions(String category, String search) {
        String cleanCat = sanitizeCategory(category);
        String cleanSearch = sanitizeLikeTerm(search);

        List<Question> matches;
        if (cleanCat == null && cleanSearch == null) {
            matches = questionRepository.findAllByOrderByIdAsc();
        } else if (cleanCat != null && cleanSearch == null) {
            matches = questionRepository.findByCategoryIgnoreCaseOrderByIdAsc(cleanCat);
        } else if (cleanCat == null) {
            matches = questionRepository.searchAllCategories(cleanSearch);
        } else {
            matches = questionRepository.searchByCategoryAndQuery(cleanCat, cleanSearch);
        }

        return matches.stream()
                .limit(100)
                .map(this::toPublicResponse)
                .toList();
    }

    @Transactional
    public AnswerEvaluationResponse evaluateAnswer(Long questionId, Long selectedOptionId, User currentUser) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found."));

        AnswerOption chosen = question.getOptions().stream()
                .filter(opt -> opt.getId().equals(selectedOptionId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected option does not belong to this question."));

        if (currentUser != null) {
            UserAttempt attempt = new UserAttempt();
            attempt.setUser(currentUser);
            attempt.setQuestion(question);
            attempt.setSelectedOption(chosen);
            attempt.setCorrect(chosen.isCorrect());
            attemptRepository.save(attempt);
        }

        return new AnswerEvaluationResponse(
                question.getId(),
                chosen.getId(),
                chosen.isCorrect(),
                chosen.getExplanation(),
                question.getRuleReference()
        );
    }

    @Transactional(readOnly = true)
    public List<AdminQuestionResponse> listAdminQuestions() {
        return questionRepository.findAllByOrderByIdAsc()
                .stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional
    public AdminQuestionResponse createQuestion(AdminQuestionUpsertRequest req) {
        validateAtLeastOneCorrect(req.options());
        Question question = new Question();
        applyFields(question, req);
        return toAdminResponse(questionRepository.save(question));
    }

    @Transactional
    public AdminQuestionResponse updateQuestion(Long questionId, AdminQuestionUpsertRequest req) {
        validateAtLeastOneCorrect(req.options());
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found."));
        applyFields(question, req);
        return toAdminResponse(questionRepository.save(question));
    }

    @Transactional
    public AdminQuestionResponse uploadQuestionVideo(Long questionId, MultipartFile file) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found."));

        String oldVideo = question.getVideoFilename();
        String newVideo = videoStorageService.storeUploadedVideo(file);
        question.setVideoFilename(newVideo);
        question.setSourceVideoUrl(null);
        Question saved = questionRepository.save(question);

        if (oldVideo != null && !oldVideo.equals(newVideo) && !isSeedVideo(oldVideo)) {
            videoStorageService.deleteIfExists(oldVideo);
        }
        return toAdminResponse(saved);
    }

    @Transactional
    public AdminQuestionResponse removeQuestionVideo(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found."));

        String oldVideo = question.getVideoFilename();
        question.setVideoFilename(null);
        question.setSourceVideoUrl(null);
        Question saved = questionRepository.save(question);

        if (oldVideo != null && !isSeedVideo(oldVideo)) {
            videoStorageService.deleteIfExists(oldVideo);
        }
        return toAdminResponse(saved);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found."));
        String video = question.getVideoFilename();
        attemptRepository.deleteByQuestionId(questionId);
        questionRepository.delete(question);
        if (video != null && !isSeedVideo(video)) {
            videoStorageService.deleteIfExists(video);
        }
    }

    private void validateAtLeastOneCorrect(List<AdminOptionDto> options) {
        long correctCount = options.stream().filter(AdminOptionDto::correct).count();
        if (correctCount != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exactly one answer option must be marked as correct.");
        }
    }

    private void applyFields(Question question, AdminQuestionUpsertRequest req) {
        question.setTitle(req.title().trim());
        question.setRuleReference(req.ruleReference().trim());
        question.setCategory(req.category().trim());
        question.setDifficulty(req.difficulty().trim());
        question.setPrompt(req.prompt().trim());

        List<AnswerOption> mapped = new ArrayList<>();
        for (int i = 0; i < req.options().size(); i++) {
            AdminOptionDto dto = req.options().get(i);
            AnswerOption opt = new AnswerOption();
            opt.setSortOrder(i);
            opt.setOptionLabel(dto.optionLabel().trim());
            opt.setCorrect(dto.correct());
            opt.setExplanation(dto.explanation().trim());
            mapped.add(opt);
        }
        question.replaceOptions(mapped);
    }

    @Transactional(readOnly = true)
    public PagedQuestionsResponse listPagedQuestions(
            String category,
            String search,
            int page,
            int size,
            boolean shuffle,
            Long seed
    ) {
        int safeSize = Math.max(1, Math.min(size, 50));
        int safePage = Math.max(0, page);
        long effectiveSeed = seed != null ? seed : System.currentTimeMillis();

        String cleanCat = sanitizeCategory(category);
        String cleanSearch = sanitizeLikeTerm(search);

        List<Long> matchingIds;
        if (cleanCat != null && cleanSearch != null) {
            matchingIds = questionRepository.findIdsByCategoryAndSearch(cleanCat, cleanSearch);
        } else if (cleanCat != null) {
            matchingIds = questionRepository.findIdsByCategoryIgnoreCaseOrderByIdAsc(cleanCat);
        } else if (cleanSearch != null) {
            matchingIds = questionRepository.findIdsBySearchAllCategories(cleanSearch);
        } else {
            matchingIds = questionRepository.findAllIdsOrderByIdAsc();
        }

        List<Long> orderedIds = new ArrayList<>(matchingIds);
        if (shuffle && orderedIds.size() > 1) {
            Collections.shuffle(orderedIds, new Random(effectiveSeed));
        }

        long totalElements = orderedIds.size();
        int totalPages = totalElements == 0 ? 0 : (int) Math.ceil((double) totalElements / safeSize);
        int fromIdx = Math.min(safePage * safeSize, orderedIds.size());
        int toIdx = Math.min(fromIdx + safeSize, orderedIds.size());

        List<PublicQuestionResponse> items;
        if (fromIdx >= toIdx) {
            items = List.of();
        } else {
            List<Long> pageIds = orderedIds.subList(fromIdx, toIdx);
            List<Question> fetched = questionRepository.findAllWithOptionsByIdIn(pageIds);
            Map<Long, Question> byId = new LinkedHashMap<>();
            for (Question q : fetched) {
                byId.put(q.getId(), q);
            }
            items = pageIds.stream()
                    .map(byId::get)
                    .filter(q -> q != null)
                    .map(this::toPublicResponse)
                    .toList();
        }

        List<CategoryCountResponse> categories = questionRepository.findCategoryCounts().stream()
                .map(row -> new CategoryCountResponse((String) row[0], ((Number) row[1]).longValue()))
                .toList();

        return new PagedQuestionsResponse(items, totalElements, totalPages, safePage, safeSize, effectiveSeed, categories);
    }

    @Transactional(readOnly = true)
    public Optional<String> findSourceVideoUrl(String filename) {
        return questionRepository.findFirstByVideoFilename(filename)
                .map(Question::getSourceVideoUrl)
                .filter(url -> url != null && !url.isBlank());
    }

    private String sanitizeCategory(String category) {
        if (category == null || category.isBlank() || "all".equalsIgnoreCase(category.trim())) {
            return null;
        }
        String trimmed = category.trim();
        return trimmed.length() > 80 ? trimmed.substring(0, 80) : trimmed;
    }

    private String sanitizeLikeTerm(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        String trimmed = search.trim();
        if (trimmed.length() > 100) {
            trimmed = trimmed.substring(0, 100);
        }
        return trimmed
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }

    private boolean isSeedVideo(String filename) {
        return filename.startsWith("basketref_")
                || filename.equals("refree_main_background.mp4")
                || filename.equals("authorized_user_background.mp4")
                || filename.equals("semicircle_5154.mp4")
                || filename.equals("charge_8113.mp4")
                || filename.equals("travel_8420.mp4")
                || filename.equals("unsports_8416.mp4")
                || filename.equals("shotclock_2989.mp4");
    }

    private PublicQuestionResponse toPublicResponse(Question q) {
        String videoUrl = q.getVideoFilename() != null ? "/api/videos/" + q.getVideoFilename() : null;
        List<PublicOptionResponse> opts = q.getOptions().stream()
                .map(o -> new PublicOptionResponse(o.getId(), o.getSortOrder(), o.getOptionLabel()))
                .toList();
        return new PublicQuestionResponse(
                q.getId(), q.getTitle(), q.getRuleReference(), q.getCategory(),
                q.getDifficulty(), q.getPrompt(), videoUrl, opts
        );
    }

    private AdminQuestionResponse toAdminResponse(Question q) {
        String videoUrl = q.getVideoFilename() != null ? "/api/videos/" + q.getVideoFilename() : null;
        List<AdminOptionResponse> opts = q.getOptions().stream()
                .map(o -> new AdminOptionResponse(o.getId(), o.getSortOrder(), o.getOptionLabel(), o.isCorrect(), o.getExplanation()))
                .toList();
        return new AdminQuestionResponse(
                q.getId(), q.getTitle(), q.getRuleReference(), q.getCategory(),
                q.getDifficulty(), q.getPrompt(), videoUrl, opts
        );
    }
}
