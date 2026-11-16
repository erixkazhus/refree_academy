package com.fibaref.academy.dto;

import java.util.List;

public final class RulebookDtos {

    private RulebookDtos() {}

    public record SubPointDto(
            String code,
            String heading,
            String body,
            List<String> bullets
    ) {}

    public record ExampleDto(
            String code,
            String kind,
            String text,
            String interpretation
    ) {}

    public record ArticleDto(
            String id,
            String articleNumber,
            String title,
            String subtitle,
            List<SubPointDto> subPoints,
            List<ExampleDto> examples,
            List<Integer> signalNumbers
    ) {}

    public record SectionDto(
            String id,
            String ruleNumber,
            String title,
            List<ArticleDto> articles
    ) {}

    public record SignalMeta(
            Integer number,
            String category,
            String name,
            String action
    ) {}

    public record SignalDto(
            int number,
            String category,
            String name,
            String action,
            String imagePath
    ) {}

    public record RulebookBundleResponse(
            List<SectionDto> sections,
            List<SignalDto> signals
    ) {}

    public record PdfMeta(
            String filename,
            String title,
            String version,
            String effectiveDate,
            String description,
            long sizeBytes
    ) {}
}
