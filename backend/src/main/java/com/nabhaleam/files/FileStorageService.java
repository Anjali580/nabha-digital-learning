package com.nabhaleam.files;

import com.nabhaleam.common.ApiException;
import com.nabhaleam.config.AppProperties;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private static final Map<String, String> EXTENSIONS = Map.of(
            "application/pdf", "pdf",
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp");

    private final AppProperties properties;
    private final StoredFileRepository repository;
    private final Path root;

    public FileStorageService(AppProperties properties, StoredFileRepository repository) {
        this.properties = properties;
        this.repository = repository;
        this.root = Paths.get(properties.getUpload().getDir()).toAbsolutePath().normalize();
    }

    @PostConstruct
    void initialize() {
        try {
            Files.createDirectories(root);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not create upload directory " + root, ex);
        }
    }

    public StoredFile store(MultipartFile file, String ownerId, FilePurpose purpose) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Please choose a file to upload.");
        }
        if (file.getSize() > properties.getUpload().getMaxSizeBytes()) {
            throw ApiException.badRequest("The file is too large. Maximum size is 5 MB.");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!properties.getUpload().getAllowedContentTypes().contains(contentType)) {
            throw ApiException.badRequest("Only PDF, JPG, PNG or WEBP files are allowed.");
        }
        if (purpose == FilePurpose.AVATAR && !contentType.startsWith("image/")) {
            throw ApiException.badRequest("A profile photo must be a JPG, PNG or WEBP image.");
        }
        verifyMagicBytes(file, contentType);

        String storedName = LocalDate.now().getYear() + "/" + String.format("%02d", LocalDate.now().getMonthValue())
                + "/" + UUID.randomUUID().toString().replace("-", "") + "." + EXTENSIONS.get(contentType);
        Path target = root.resolve(storedName).normalize();
        if (!target.startsWith(root)) {
            throw ApiException.badRequest("Invalid file path.");
        }

        try {
            Files.createDirectories(target.getParent());
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            log.error("Failed to store uploaded file", ex);
            throw new IllegalStateException("The file could not be stored. Please try again.");
        }

        StoredFile stored = StoredFile.builder()
                .ownerId(ownerId)
                .originalName(sanitizeName(file.getOriginalFilename()))
                .storedName(storedName)
                .contentType(contentType)
                .size(file.getSize())
                .purpose(purpose)
                .build();
        return repository.save(stored);
    }

    public Resource load(StoredFile file) {
        try {
            Path path = root.resolve(file.getStoredName()).normalize();
            if (!path.startsWith(root)) {
                throw ApiException.forbidden("Invalid file location.");
            }
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw ApiException.notFound("File not found.");
            }
            return resource;
        } catch (IOException ex) {
            throw ApiException.notFound("File not found.");
        }
    }

    public void deleteQuietly(StoredFile file) {
        if (file == null) {
            return;
        }
        try {
            Files.deleteIfExists(root.resolve(file.getStoredName()).normalize());
        } catch (IOException ex) {
            log.warn("Could not delete stored file {}", file.getId());
        }
        repository.deleteById(file.getId());
    }

    private void verifyMagicBytes(MultipartFile file, String contentType) {
        byte[] header = new byte[12];
        try (InputStream input = file.getInputStream()) {
            int read = input.read(header);
            if (read < 4) {
                throw ApiException.badRequest("The uploaded file appears to be empty or corrupted.");
            }
        } catch (IOException ex) {
            throw ApiException.badRequest("The uploaded file could not be read.");
        }

        boolean valid = switch (contentType) {
            case "application/pdf" -> header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46;
            case "image/jpeg" -> (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8
                    && (header[2] & 0xFF) == 0xFF;
            case "image/png" -> (header[0] & 0xFF) == 0x89 && header[1] == 0x50 && header[2] == 0x4E
                    && header[3] == 0x47;
            case "image/webp" -> header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F';
            default -> false;
        };
        if (!valid) {
            throw ApiException.badRequest("The file content does not match its declared type.");
        }
    }

    private String sanitizeName(String original) {
        if (original == null || original.isBlank()) {
            return "upload";
        }
        String name = Paths.get(original).getFileName().toString();
        return name.replaceAll("[^A-Za-z0-9._ -]", "_").substring(0, Math.min(name.length(), 120));
    }
}
