package com.fibaref.academy.service;

import com.fibaref.academy.dto.AuthDtos.LoginRequest;
import com.fibaref.academy.dto.AuthDtos.RegisterRequest;
import com.fibaref.academy.dto.AuthDtos.UserProfileResponse;
import com.fibaref.academy.model.Role;
import com.fibaref.academy.model.User;
import com.fibaref.academy.repository.UserAttemptRepository;
import com.fibaref.academy.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 8;
    private static final long LOCKOUT_WINDOW_MS = 5 * 60_000L;
    private static final int MAX_TRACKED_ACCOUNTS = 10_000;

    private final UserRepository userRepository;
    private final UserAttemptRepository attemptRepository;
    private final PasswordEncoder passwordEncoder;
    private final ConcurrentHashMap<String, FailedAttemptState> failedLogins = new ConcurrentHashMap<>();

    public AuthService(
            UserRepository userRepository,
            UserAttemptRepository attemptRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.attemptRepository = attemptRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest req) {
        String normalizedEmail = req.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        User user = new User();
        user.setFullName(req.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        // Role is strictly assigned server-side to prevent privilege escalation
        user.setRole(Role.USER);
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User authenticate(LoginRequest req) {
        String normalizedEmail = req.email().trim().toLowerCase();
        long now = System.currentTimeMillis();

        FailedAttemptState state = failedLogins.get(normalizedEmail);
        if (state != null && state.isLocked(now)) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many failed login attempts. Please try again later."
            );
        }

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
        if (user == null || !passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            recordFailure(normalizedEmail, now);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        failedLogins.remove(normalizedEmail);
        return user;
    }

    private void recordFailure(String email, long now) {
        if (failedLogins.size() > MAX_TRACKED_ACCOUNTS) {
            failedLogins.entrySet().removeIf(e -> !e.getValue().isRecent(now));
        }
        failedLogins.compute(email, (k, existing) -> {
            if (existing == null || !existing.isRecent(now)) {
                return new FailedAttemptState(1, now);
            }
            int nextCount = existing.failures + 1;
            long lockUntil = nextCount >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_WINDOW_MS : existing.lockedUntilMs;
            return new FailedAttemptState(nextCount, now, lockUntil);
        });
    }

    @Transactional(readOnly = true)
    public UserProfileResponse toProfile(User user) {
        long total = attemptRepository.countByUserId(user.getId());
        long correct = attemptRepository.countByUserIdAndCorrectTrue(user.getId());
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                total,
                correct
        );
    }

    private record FailedAttemptState(int failures, long lastFailureMs, long lockedUntilMs) {
        FailedAttemptState(int failures, long now) {
            this(failures, now, 0L);
        }

        boolean isLocked(long now) {
            return lockedUntilMs > now;
        }

        boolean isRecent(long now) {
            return now - lastFailureMs < LOCKOUT_WINDOW_MS * 2;
        }
    }
}
