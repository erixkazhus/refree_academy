package com.fibaref.academy.dto;

import com.fibaref.academy.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
            @NotBlank(message = "Full name is required")
            @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
            String fullName,

            @NotBlank(message = "Email is required")
            @Email(message = "Please enter a valid email address")
            @Size(max = 180)
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 10, max = 128, message = "Password must be at least 10 characters")
            @Pattern(
                    regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z\\d]).+$",
                    message = "Password must include uppercase, lowercase, digit, and special character"
            )
            String password
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Please enter a valid email address")
            String email,

            @NotBlank(message = "Password is required")
            @Size(max = 128)
            String password
    ) {}

    public record UserProfileResponse(
            Long id,
            String fullName,
            String email,
            Role role,
            long totalAttempts,
            long correctAttempts
    ) {}
}
