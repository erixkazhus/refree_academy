package com.fibaref.academy.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fibaref.academy.model.*;
import com.fibaref.academy.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

import java.io.InputStream;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final RuleSectionRepository ruleSectionRepository;
    private final RefereeSignalRepository signalRepository;
    private final RulebookDocumentRepository documentRepository;
    private final VideoAssetRepository videoAssetRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate transactionTemplate;
    private final String adminEmail;
    private final String adminPassword;
    private final Path pdfDir;
    private final Path seedVideoDir;

    public DataSeeder(
            UserRepository userRepository,
            QuestionRepository questionRepository,
            RuleSectionRepository ruleSectionRepository,
            RefereeSignalRepository signalRepository,
            RulebookDocumentRepository documentRepository,
            VideoAssetRepository videoAssetRepository,
            PasswordEncoder passwordEncoder,
            ObjectMapper objectMapper,
            TransactionTemplate transactionTemplate,
            @Value("${app.seed.admin-email}") String adminEmail,
            @Value("${app.seed.admin-password}") String adminPassword,
            @Value("${app.pdf.dir:../media/rulebook-pdfs}") String pdfDir,
            @Value("${app.video.seed-dir:../media/seed-videos}") String seedVideoDir
    ) {
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
        this.ruleSectionRepository = ruleSectionRepository;
        this.signalRepository = signalRepository;
        this.documentRepository = documentRepository;
        this.videoAssetRepository = videoAssetRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
        this.transactionTemplate = transactionTemplate;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.pdfDir = Paths.get(pdfDir).toAbsolutePath().normalize();
        this.seedVideoDir = Paths.get(seedVideoDir).toAbsolutePath().normalize();
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedRulebook();
        seedSignals();
        seedPdfDocuments();
        seedVideoAssetsRegistry();
        seedQuestions();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            User admin = new User();
            admin.setFullName("FIBA National Instructor");
            admin.setEmail(adminEmail.toLowerCase());
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }

        String demoUserEmail = "referee@fibaref.org";
        if (!userRepository.existsByEmailIgnoreCase(demoUserEmail)) {
            User ref = new User();
            ref.setFullName("Candidate Referee");
            ref.setEmail(demoUserEmail);
            ref.setPasswordHash(passwordEncoder.encode("RefereeFiba#2026!"));
            ref.setRole(Role.USER);
            userRepository.save(ref);
        }
    }

    private void seedRulebook() {
        if (ruleSectionRepository.count() > 0) {
            return;
        }
        ClassPathResource res = new ClassPathResource("seed/rulebook-2026.json");
        if (!res.exists()) {
            log.warn("seed/rulebook-2026.json not found on classpath.");
            return;
        }
        try (InputStream is = res.getInputStream()) {
            List<SeedRuleSection> rawSections = objectMapper.readValue(is, new TypeReference<>() {});
            List<RuleSection> entities = new ArrayList<>();
            for (int si = 0; si < rawSections.size(); si++) {
                SeedRuleSection rawSec = rawSections.get(si);
                RuleSection sec = new RuleSection();
                sec.setId(rawSec.id());
                sec.setSortOrder(si);
                sec.setRuleNumber(rawSec.ruleNumber());
                sec.setTitle(rawSec.title());

                if (rawSec.articles() != null) {
                    for (int ai = 0; ai < rawSec.articles().size(); ai++) {
                        SeedRuleArticle rawArt = rawSec.articles().get(ai);
                        RuleArticle art = new RuleArticle();
                        art.setId(rawArt.id());
                        art.setSection(sec);
                        art.setSortOrder(ai);
                        art.setArticleNumber(rawArt.articleNumber());
                        art.setTitle(rawArt.title());
                        art.setSubtitle(rawArt.subtitle());
                        if (rawArt.signalNumbers() != null && !rawArt.signalNumbers().isEmpty()) {
                            art.setSignalNumbersCsv(
                                    String.join(",", rawArt.signalNumbers().stream().map(String::valueOf).toList())
                            );
                        }

                        if (rawArt.subPoints() != null) {
                            for (int pi = 0; pi < rawArt.subPoints().size(); pi++) {
                                SeedSubPoint rawSp = rawArt.subPoints().get(pi);
                                RuleSubPoint sp = new RuleSubPoint();
                                sp.setArticle(art);
                                sp.setSortOrder(pi);
                                sp.setCode(rawSp.code());
                                sp.setHeading(rawSp.heading());
                                sp.setBody(rawSp.body());
                                if (rawSp.bullets() != null && !rawSp.bullets().isEmpty()) {
                                    sp.setBulletsJson(objectMapper.writeValueAsString(rawSp.bullets()));
                                }
                                art.getSubPoints().add(sp);
                            }
                        }

                        if (rawArt.examples() != null) {
                            for (int ei = 0; ei < rawArt.examples().size(); ei++) {
                                SeedExample rawEx = rawArt.examples().get(ei);
                                RuleExample ex = new RuleExample();
                                ex.setArticle(art);
                                ex.setSortOrder(ei);
                                ex.setCode(rawEx.code());
                                ex.setKind(rawEx.kind());
                                ex.setText(rawEx.text());
                                ex.setInterpretation(rawEx.interpretation());
                                art.getExamples().add(ex);
                            }
                        }
                        sec.getArticles().add(art);
                    }
                }
                entities.add(sec);
            }
            transactionTemplate.executeWithoutResult(status -> ruleSectionRepository.saveAll(entities));
            log.info("Seeded {} FIBA Rulebook chapters into PostgreSQL.", entities.size());
        } catch (Exception ex) {
            log.error("Failed to seed rulebook-2026.json: {}", ex.getMessage(), ex);
        }
    }

    private void seedSignals() {
        ClassPathResource metaRes = new ClassPathResource("seed/signals-2026.json");
        if (!metaRes.exists()) {
            log.warn("seed/signals-2026.json not found on classpath.");
            return;
        }
        try (InputStream is = metaRes.getInputStream()) {
            List<SeedSignal> rawSignals = objectMapper.readValue(is, new TypeReference<>() {});
            Set<Integer> existing = new HashSet<>(signalRepository.findAllSignalNumbers());
            List<RefereeSignal> pending = new ArrayList<>();

            for (SeedSignal rs : rawSignals) {
                if (existing.contains(rs.number())) {
                    continue;
                }
                String fileName = String.format("signal-%02d.png", rs.number());
                ClassPathResource imgRes = new ClassPathResource("seed/signals/" + fileName);
                if (!imgRes.exists()) {
                    continue;
                }
                byte[] imgBytes = imgRes.getContentAsByteArray();
                RefereeSignal sig = new RefereeSignal();
                sig.setSignalNumber(rs.number());
                sig.setCategory(rs.category());
                sig.setName(rs.name());
                sig.setAction(rs.action());
                sig.setContentType("image/png");
                sig.setSizeBytes(imgBytes.length);
                sig.setImageData(imgBytes);
                pending.add(sig);
            }

            if (!pending.isEmpty()) {
                transactionTemplate.executeWithoutResult(status -> signalRepository.saveAll(pending));
                log.info("Seeded {} Referee Signals with PNG binary assets into PostgreSQL.", pending.size());
            }
        } catch (Exception ex) {
            log.error("Failed to seed referee signals: {}", ex.getMessage(), ex);
        }
    }

    private void seedPdfDocuments() {
        if (!Files.isDirectory(pdfDir)) {
            return;
        }
        List<PdfSeedMeta> catalog = List.of(
                new PdfSeedMeta(
                        "FIBA-Official-Basketball-Rules-2026-v1.1.pdf",
                        "2026 Official Basketball Rules & Basketball Equipment",
                        "Version 1.1",
                        "1 October 2026",
                        "Complete 2026 FIBA rulebook covering Rules 1–8 (Articles 1–51), Basketball Equipment specifications, Referees' Signals, Scoresheet, Protest Procedure, and Instant Replay System / Head Coach's Challenge."
                ),
                new PdfSeedMeta(
                        "FIBA-Official-Basketball-Rules-2026-OBRI-Interpretations-v1.0.pdf",
                        "2026 Official Basketball Rules – Official Interpretations (OBRI)",
                        "Version 1.0",
                        "1 October 2026",
                        "Official Basketball Rules Interpretations (OBRI) clarifying game situations, disruptive and flagrant fouls, technical foul categories, cylinder/verticality, shot clock resets, and IRS review scenarios."
                )
        );
        Set<String> existing = new HashSet<>(documentRepository.findAllFilenames());
        for (PdfSeedMeta meta : catalog) {
            if (existing.contains(meta.filename())) {
                continue;
            }
            Path pdfPath = pdfDir.resolve(meta.filename()).normalize();
            if (!pdfPath.startsWith(pdfDir) || !Files.isRegularFile(pdfPath)) {
                continue;
            }
            try {
                byte[] bytes = Files.readAllBytes(pdfPath);
                RulebookDocument doc = new RulebookDocument();
                doc.setFilename(meta.filename());
                doc.setTitle(meta.title());
                doc.setVersion(meta.version());
                doc.setEffectiveDate(meta.effectiveDate());
                doc.setDescription(meta.description());
                doc.setSizeBytes(bytes.length);
                doc.setContentType("application/pdf");
                doc.setData(bytes);
                transactionTemplate.executeWithoutResult(status -> documentRepository.save(doc));
                log.info("Stored PDF '{}' ({} bytes) in PostgreSQL rulebook_documents.", meta.filename(), bytes.length);
            } catch (Exception ex) {
                log.error("Failed to store PDF {} in PostgreSQL: {}", meta.filename(), ex.getMessage());
            }
        }
    }

    private void seedVideoAssetsRegistry() {
        if (!Files.isDirectory(seedVideoDir)) {
            return;
        }
        try {
            Set<String> existing = new HashSet<>(videoAssetRepository.findAllFilenames());
            List<VideoAsset> batch = new ArrayList<>();
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(seedVideoDir, "*.{mp4,webm}")) {
                for (Path file : stream) {
                    String fname = file.getFileName().toString();
                    if (existing.contains(fname)) {
                        continue;
                    }
                    VideoAsset asset = new VideoAsset();
                    asset.setFilename(fname);
                    asset.setContentType(fname.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4");
                    asset.setFileSize(Files.size(file));
                    asset.setStorageSource("SEED_DISK");
                    asset.setData(null);
                    batch.add(asset);
                }
            }
            if (!batch.isEmpty()) {
                final int chunkSize = 400;
                for (int i = 0; i < batch.size(); i += chunkSize) {
                    List<VideoAsset> chunk = batch.subList(i, Math.min(i + chunkSize, batch.size()));
                    transactionTemplate.executeWithoutResult(status -> videoAssetRepository.saveAll(chunk));
                }
                log.info("Registered {} seed video assets in PostgreSQL video_assets table.", batch.size());
            }
        } catch (Exception ex) {
            log.warn("Could not register seed videos in video_assets: {}", ex.getMessage());
        }
    }

    private void seedQuestions() {
        migrateLegacySampleCategories();

        ClassPathResource seedResource = new ClassPathResource("seed/questions-2026.json");
        if (!seedResource.exists()) {
            log.warn("seed/questions-2026.json not found on classpath; skipping bulk FIBA dataset seed.");
            return;
        }

        try (InputStream is = seedResource.getInputStream()) {
            List<SeedQuestionRow> rows = objectMapper.readValue(is, new TypeReference<>() {});
            Map<String, Question> existingByCode = new LinkedHashMap<>();
            for (Question q : questionRepository.findAll()) {
                if (q.getExternalCode() != null) {
                    existingByCode.put(q.getExternalCode(), q);
                }
            }

            List<Question> pending = new ArrayList<>();
            int updatedCount = 0;
            for (SeedQuestionRow row : rows) {
                Question existing = row.externalCode() != null ? existingByCode.get(row.externalCode()) : null;
                if (existing != null) {
                    if (syncExistingSeedQuestion(existing, row)) {
                        pending.add(existing);
                        updatedCount++;
                    }
                    continue;
                }
                List<AnswerOption> opts = new ArrayList<>();
                if (row.options() != null) {
                    for (SeedOptionRow o : row.options()) {
                        opts.add(opt(o.sortOrder(), o.optionLabel(), o.correct(), o.explanation()));
                    }
                }
                Question q = buildQuestion(
                        row.externalCode(),
                        row.title(),
                        row.ruleReference(),
                        row.category(),
                        row.difficulty(),
                        row.prompt(),
                        row.videoFilename(),
                        row.sourceVideoUrl(),
                        opts
                );
                pending.add(q);
            }

            if (pending.isEmpty()) {
                log.info("FIBA 2026 question bank already up to date ({} total questions).", questionRepository.count());
                return;
            }

            final int batchSize = 200;
            for (int i = 0; i < pending.size(); i += batchSize) {
                List<Question> chunk = pending.subList(i, Math.min(i + batchSize, pending.size()));
                transactionTemplate.executeWithoutResult(status -> questionRepository.saveAll(chunk));
            }
            log.info("Synced FIBA 2026 dataset: {} saved/updated ({} updated in-place, {} total in database).",
                    pending.size(), updatedCount, questionRepository.count());
        } catch (Exception ex) {
            log.error("Failed to seed questions-2026.json: {}", ex.getMessage(), ex);
        }
    }

    private boolean syncExistingSeedQuestion(Question existing, SeedQuestionRow row) {
        boolean changed = false;
        if (!Objects.equals(existing.getTitle(), row.title())) {
            existing.setTitle(row.title());
            changed = true;
        }
        if (!Objects.equals(existing.getRuleReference(), row.ruleReference())) {
            existing.setRuleReference(row.ruleReference());
            changed = true;
        }
        if (!Objects.equals(existing.getCategory(), row.category())) {
            existing.setCategory(row.category());
            changed = true;
        }
        if (!Objects.equals(existing.getPrompt(), row.prompt())) {
            existing.setPrompt(row.prompt());
            changed = true;
        }
        List<AnswerOption> currentOpts = existing.getOptions();
        List<SeedOptionRow> targetOpts = row.options();
        if (targetOpts != null && currentOpts.size() == targetOpts.size()) {
            for (int i = 0; i < targetOpts.size(); i++) {
                AnswerOption cur = currentOpts.get(i);
                SeedOptionRow tgt = targetOpts.get(i);
                if (!Objects.equals(cur.getOptionLabel(), tgt.optionLabel())
                        || cur.isCorrect() != tgt.correct()
                        || !Objects.equals(cur.getExplanation(), tgt.explanation())) {
                    cur.setOptionLabel(tgt.optionLabel());
                    cur.setCorrect(tgt.correct());
                    cur.setExplanation(tgt.explanation());
                    changed = true;
                }
            }
        }
        return changed;
    }

    private void migrateLegacySampleCategories() {
        transactionTemplate.executeWithoutResult(status -> {
            List<Question> legacy = questionRepository.findByExternalCodeIsNullOrderByIdAsc();
            List<Question> modified = new ArrayList<>();
            for (Question q : legacy) {
                String cat = q.getCategory();
                if ("Semi-Circle".equals(cat) || "Charge-Block".equals(cat) || "Unsportsmanlike".equals(cat)) {
                    q.setCategory("Rule 6 · Fouls");
                    modified.add(q);
                } else if ("Travelling".equals(cat) || "Shot Clock".equals(cat)) {
                    q.setCategory("Rule 5 · Violations");
                    modified.add(q);
                }
            }
            if (!modified.isEmpty()) {
                questionRepository.saveAll(modified);
                log.info("Migrated {} legacy sample questions into Rulebook sections.", modified.size());
            }
        });
    }

    private Question buildQuestion(
            String externalCode,
            String title,
            String ruleRef,
            String category,
            String difficulty,
            String prompt,
            String videoFilename,
            String sourceVideoUrl,
            List<AnswerOption> options
    ) {
        Question q = new Question();
        q.setExternalCode(externalCode);
        q.setTitle(title);
        q.setRuleReference(ruleRef);
        q.setCategory(category);
        q.setDifficulty(difficulty);
        q.setPrompt(prompt);
        q.setVideoFilename(videoFilename);
        q.setSourceVideoUrl(sourceVideoUrl);
        q.replaceOptions(options);
        return q;
    }

    private AnswerOption opt(int sortOrder, String label, boolean correct, String explanation) {
        AnswerOption o = new AnswerOption();
        o.setSortOrder(sortOrder);
        o.setOptionLabel(label);
        o.setCorrect(correct);
        o.setExplanation(explanation);
        return o;
    }

    private record SeedOptionRow(int sortOrder, String optionLabel, boolean correct, String explanation) {}

    private record SeedQuestionRow(
            String externalCode,
            String title,
            String ruleReference,
            String category,
            String difficulty,
            String prompt,
            String videoFilename,
            String sourceVideoUrl,
            List<SeedOptionRow> options
    ) {}

    private record SeedSubPoint(String code, String heading, String body, List<String> bullets) {}

    private record SeedExample(String code, String kind, String text, String interpretation) {}

    private record SeedRuleArticle(
            String id,
            String articleNumber,
            String title,
            String subtitle,
            List<SeedSubPoint> subPoints,
            List<SeedExample> examples,
            List<Integer> signalNumbers
    ) {}

    private record SeedRuleSection(String id, String ruleNumber, String title, List<SeedRuleArticle> articles) {}

    private record SeedSignal(int number, String category, String name, String action, String imagePath) {}

    private record PdfSeedMeta(String filename, String title, String version, String effectiveDate, String description) {}
}
