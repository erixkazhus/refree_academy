package com.fibaref.academy.controller;

import com.fibaref.academy.config.JwtService;
import com.fibaref.academy.dto.AuthDtos.LoginRequest;
import com.fibaref.academy.dto.AuthDtos.RegisterRequest;
import com.fibaref.academy.dto.AuthDtos.UserProfileResponse;
import com.fibaref.academy.model.User;
import com.fibaref.academy.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final String cookieName;
    private final long expirationSeconds;
    private final boolean cookieSecure;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            @Value("${app.jwt.cookie-name}") String cookieName,
            @Value("${app.jwt.expiration-seconds}") long expirationSeconds,
            @Value("${app.jwt.cookie-secure:false}") boolean cookieSecure
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.cookieName = cookieName;
        this.expirationSeconds = expirationSeconds;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping("/register")
    public ResponseEntity<UserProfileResponse> register(
            @Valid @RequestBody RegisterRequest req,
            HttpServletResponse response
    ) {
        User user = authService.register(req);
        attachJwtCookie(response, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.toProfile(user));
    }

    @PostMapping("/login")
    public ResponseEntity<UserProfileResponse> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletResponse response
    ) {
        User user = authService.authenticate(req);
        attachJwtCookie(response, user);
        return ResponseEntity.ok(authService.toProfile(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie clearCookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookie.toString());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.toProfile(currentUser));
    }

    private void attachJwtCookie(HttpServletResponse response, User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole());
        ResponseCookie cookie = ResponseCookie.from(cookieName, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path("/")
                .maxAge(expirationSeconds)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
