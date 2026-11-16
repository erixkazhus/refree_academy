package com.fibaref.academy.service;

import com.fibaref.academy.model.VideoAsset;
import com.fibaref.academy.repository.VideoAssetRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.Duration;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Semaphore;
import java.util.regex.Pattern;

@Service
public class VideoStorageService {

    private static final Pattern SAFE_FILENAME = Pattern.compile("^[a-zA-Z0-9._-]+$");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("video/mp4", "video/webm");

    private final Path storageDir;
    private final Path seedDir;
    private final VideoAssetRepository videoAssetRepository;
    private final Semaphore remoteFetchLimiter = new Semaphore(4);
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    public VideoStorageService(String storageDir, String seedDir) {
        this(storageDir, seedDir, null);
    }

    @Autowired
    public VideoStorageService(
            @Value("${app.video.storage-dir}") String storageDir,
            @Value("${app.video.seed-dir}") String seedDir,
            VideoAssetRepository videoAssetRepository
    ) {
        this.storageDir = Paths.get(storageDir).toAbsolutePath().normalize();
        this.seedDir = Paths.get(seedDir).toAbsolutePath().normalize();
        this.videoAssetRepository = videoAssetRepository;
    }

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(storageDir);
    }

    @Transactional
    public String storeUploadedVideo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Video file cannot be empty.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only MP4 and WebM videos are permitted.");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read uploaded video.");
        }

        String ext = verifyMagicBytesAndGetExtension(bytes);
        String safeName = "foul-" + UUID.randomUUID() + ext;

        if (videoAssetRepository != null) {
            VideoAsset asset = new VideoAsset();
            asset.setFilename(safeName);
            asset.setContentType(ext.equals(".webm") ? "video/webm" : "video/mp4");
            asset.setFileSize(bytes.length);
            asset.setStorageSource("DATABASE");
            asset.setData(bytes);
            videoAssetRepository.save(asset);
        }

        return safeName;
    }

    @Transactional(readOnly = true)
    public Resource loadAsResource(String filename) {
        return loadAsResource(filename, null);
    }

    @Transactional(readOnly = true)
    public Resource loadAsResource(String filename, String remoteFallbackUrl) {
        if (filename == null || filename.contains("..") || !SAFE_FILENAME.matcher(filename).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid video filename.");
        }

        if (videoAssetRepository != null) {
            Optional<String> sourceType = videoAssetRepository.findStorageSourceByFilename(filename);
            if (sourceType.isPresent() && "DATABASE".equals(sourceType.get())) {
                VideoAsset dbAsset = videoAssetRepository.findById(filename).orElse(null);
                if (dbAsset != null && dbAsset.getData() != null && dbAsset.getData().length > 0) {
                    return new ByteArrayResource(dbAsset.getData());
                }
            }
        }

        Path inStorage = storageDir.resolve(filename).normalize();
        if (inStorage.startsWith(storageDir) && isValidReadableVideo(inStorage)) {
            return new FileSystemResource(inStorage);
        }
        Path inSeed = seedDir.resolve(filename).normalize();
        if (inSeed.startsWith(seedDir) && isValidReadableVideo(inSeed)) {
            return new FileSystemResource(inSeed);
        }
        if (isAllowedRemoteVideoUrl(remoteFallbackUrl)) {
            Path downloaded = fetchAndCacheRemoteVideo(filename, remoteFallbackUrl, inStorage);
            if (downloaded != null) {
                return new FileSystemResource(downloaded);
            }
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Video clip not found.");
    }

    public MediaType resolveMediaType(String filename) {
        if (filename != null && filename.toLowerCase().endsWith(".webm")) {
            return MediaType.parseMediaType("video/webm");
        }
        return MediaType.parseMediaType("video/mp4");
    }

    @Transactional
    public void deleteIfExists(String filename) {
        if (filename == null || filename.contains("..") || !SAFE_FILENAME.matcher(filename).matches()) {
            return;
        }
        if (videoAssetRepository != null) {
            videoAssetRepository.findStorageSourceByFilename(filename).ifPresent(src -> {
                if ("DATABASE".equals(src)) {
                    videoAssetRepository.deleteById(filename);
                }
            });
        }
        Path resolved = storageDir.resolve(filename).normalize();
        if (resolved.startsWith(storageDir)) {
            try {
                Files.deleteIfExists(resolved);
            } catch (IOException ignored) {
            }
        }
    }

    private boolean isAllowedRemoteVideoUrl(String remoteUrl) {
        if (remoteUrl == null || remoteUrl.isBlank()) {
            return false;
        }
        try {
            URI uri = URI.create(remoteUrl);
            return "https".equalsIgnoreCase(uri.getScheme())
                    && "www.basketref.com".equalsIgnoreCase(uri.getHost())
                    && uri.getPort() == -1
                    && uri.getPath() != null
                    && uri.getPath().startsWith("/media/")
                    && !uri.getPath().contains("..");
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private boolean isValidReadableVideo(Path path) {
        try {
            return Files.isRegularFile(path) && Files.size(path) > 4096;
        } catch (IOException ex) {
            return false;
        }
    }

    private synchronized Path fetchAndCacheRemoteVideo(String filename, String remoteUrl, Path dest) {
        if (isValidReadableVideo(dest)) {
            return dest;
        }
        if (!dest.startsWith(storageDir) || !remoteFetchLimiter.tryAcquire()) {
            return null;
        }
        Path temp = storageDir.resolve(filename + ".part").normalize();
        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create(remoteUrl))
                    .timeout(Duration.ofSeconds(30))
                    .header("User-Agent", "Mozilla/5.0")
                    .header("Referer", "https://www.basketref.com/hun_file/media_pubplayer.php?param=&filter=&tip=")
                    .GET()
                    .build();
            HttpResponse<Path> res = httpClient.send(req, HttpResponse.BodyHandlers.ofFile(temp));
            if (res.statusCode() >= 200 && res.statusCode() < 300 && Files.size(temp) > 4096) {
                Files.move(temp, dest, StandardCopyOption.REPLACE_EXISTING);
                return dest;
            }
            Files.deleteIfExists(temp);
        } catch (Exception ex) {
            try {
                Files.deleteIfExists(temp);
            } catch (IOException ignored) {
            }
        } finally {
            remoteFetchLimiter.release();
        }
        return null;
    }

    private String verifyMagicBytesAndGetExtension(byte[] header) {
        if (header.length >= 8) {
            String box = new String(header, 4, 4, StandardCharsets.US_ASCII);
            if ("ftyp".equals(box)) {
                return ".mp4";
            }
        }
        if (header.length >= 4
                && (header[0] & 0xFF) == 0x1A
                && (header[1] & 0xFF) == 0x45
                && (header[2] & 0xFF) == 0xDF
                && (header[3] & 0xFF) == 0xA3) {
            return ".webm";
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uploaded file failed MP4/WebM binary signature validation.");
    }
}
