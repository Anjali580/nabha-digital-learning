package com.nabhaleam.files;

import com.nabhaleam.common.ApiException;
import com.nabhaleam.security.NabhaUserPrincipal;
import com.nabhaleam.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final StoredFileRepository repository;
    private final FileStorageService storageService;

    @GetMapping("/{fileId}")
    public ResponseEntity<Resource> download(@PathVariable String fileId) {
        StoredFile file = repository.findById(fileId)
                .orElseThrow(() -> ApiException.notFound("File not found."));
        NabhaUserPrincipal principal = SecurityUtils.currentPrincipal();
        boolean staff = "TEACHER".equals(principal.getRoleName()) || "ADMIN".equals(principal.getRoleName());
        boolean owner = principal.getId().equals(file.getOwnerId());
        boolean sharedResource = file.getPurpose() == FilePurpose.ASSIGNMENT_RESOURCE;
        if (!owner && !staff && !sharedResource) {
            throw ApiException.forbidden("You cannot access this file.");
        }

        Resource resource = storageService.load(file);
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(file.getOriginalName())
                .build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .contentLength(file.getSize())
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(resource);
    }
}
