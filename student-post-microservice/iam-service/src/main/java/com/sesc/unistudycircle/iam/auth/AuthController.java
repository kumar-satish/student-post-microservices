package com.sesc.unistudycircle.iam.auth;

import com.sesc.unistudycircle.iam.user.Role;
import com.sesc.unistudycircle.iam.user.UserAccount;
import com.sesc.unistudycircle.iam.user.UserAccountRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserAccountRepository repository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserAccountRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (repository.existsByUsername(request.username())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(java.util.Map.of("error", "Username already exists"));
        }

        if (repository.existsByEmail(request.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(java.util.Map.of("error", "Email already exists"));
        }

        UserAccount user = new UserAccount();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.STUDENT);
        user.setEnabled(true);

        repository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(java.util.Map.of(
                "message", "User registered successfully",
                "username", user.getUsername(),
                "role", user.getRole().name()
            ));
    }

    public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 50) String username,
        @NotBlank @Email @Size(max = 150) String email,
        @NotBlank @Size(min = 8, max = 100) String password
    ) {}
}
