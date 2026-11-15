package com.nabhaleam.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * History-API routes are served by the single-page application shell.
 * Only known public routes and the authenticated panel are forwarded; API and
 * asset paths are never handled here.
 */
@Controller
public class SpaController {

    @GetMapping({"/", "/courses", "/about", "/contact", "/login", "/register", "/privacy", "/terms",
            "/app", "/app/**"})
    public String app() {
        return "forward:/index.html";
    }
}
