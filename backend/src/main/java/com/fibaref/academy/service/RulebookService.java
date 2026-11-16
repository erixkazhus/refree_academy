package com.fibaref.academy.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fibaref.academy.dto.RulebookDtos.*;
import com.fibaref.academy.model.*;
import com.fibaref.academy.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class RulebookService {

    private final RuleSectionRepository sectionRepository;
    private final RuleSubPointRepository subPointRepository;
    private final RuleExampleRepository exampleRepository;
    private final RefereeSignalRepository signalRepository;
    private final ObjectMapper objectMapper;

    public RulebookService(
            RuleSectionRepository sectionRepository,
            RuleSubPointRepository subPointRepository,
            RuleExampleRepository exampleRepository,
            RefereeSignalRepository signalRepository,
            ObjectMapper objectMapper
    ) {
        this.sectionRepository = sectionRepository;
        this.subPointRepository = subPointRepository;
        this.exampleRepository = exampleRepository;
        this.signalRepository = signalRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public RulebookBundleResponse getRulebookBundle() {
        List<RuleSection> sections = sectionRepository.findAllWithArticlesOrderBySortOrder();

        Map<String, List<SubPointDto>> subPointsByArticle = new LinkedHashMap<>();
        for (Object[] row : subPointRepository.findAllWithArticleIdOrderBySortOrder()) {
            String articleId = (String) row[0];
            RuleSubPoint sp = (RuleSubPoint) row[1];
            subPointsByArticle
                    .computeIfAbsent(articleId, k -> new ArrayList<>())
                    .add(new SubPointDto(sp.getCode(), sp.getHeading(), sp.getBody(), parseBullets(sp.getBulletsJson())));
        }

        Map<String, List<ExampleDto>> examplesByArticle = new LinkedHashMap<>();
        for (Object[] row : exampleRepository.findAllWithArticleIdOrderBySortOrder()) {
            String articleId = (String) row[0];
            RuleExample ex = (RuleExample) row[1];
            examplesByArticle
                    .computeIfAbsent(articleId, k -> new ArrayList<>())
                    .add(new ExampleDto(ex.getCode(), ex.getKind(), ex.getText(), ex.getInterpretation()));
        }

        List<SectionDto> sectionDtos = new ArrayList<>();
        for (RuleSection sec : sections) {
            List<ArticleDto> artDtos = new ArrayList<>();
            for (RuleArticle art : sec.getArticles()) {
                artDtos.add(new ArticleDto(
                        art.getId(),
                        art.getArticleNumber(),
                        art.getTitle(),
                        art.getSubtitle(),
                        subPointsByArticle.getOrDefault(art.getId(), List.of()),
                        examplesByArticle.getOrDefault(art.getId(), List.of()),
                        parseSignalsCsv(art.getSignalNumbersCsv())
                ));
            }
            sectionDtos.add(new SectionDto(sec.getId(), sec.getRuleNumber(), sec.getTitle(), artDtos));
        }

        List<SignalDto> signals = signalRepository.findAllMetaOrderBySignalNumber().stream()
                .map(m -> new SignalDto(
                        m.number(),
                        m.category(),
                        m.name(),
                        m.action(),
                        "/api/rulebook/signals/" + m.number() + "/image"
                ))
                .toList();

        return new RulebookBundleResponse(sectionDtos, signals);
    }

    @Transactional(readOnly = true)
    public RefereeSignal loadSignalImage(int signalNumber) {
        if (signalNumber < 1 || signalNumber > 200) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid signal number.");
        }
        return signalRepository.findById(signalNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Signal image not found."));
    }

    private List<String> parseBullets(String bulletsJson) {
        if (bulletsJson == null || bulletsJson.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(bulletsJson, new TypeReference<>() {});
        } catch (Exception ex) {
            return List.of();
        }
    }

    private List<Integer> parseSignalsCsv(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        List<Integer> nums = new ArrayList<>();
        for (String part : csv.split(",")) {
            try {
                String trimmed = part.trim();
                if (!trimmed.isEmpty()) {
                    nums.add(Integer.parseInt(trimmed));
                }
            } catch (NumberFormatException ignored) {
            }
        }
        return nums;
    }
}
