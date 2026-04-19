package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.service.UserService;
import com.smartcampus.smart_campus_api.config.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> status() {
        return ResponseEntity.ok(Map.of(
            "message", "Authentication endpoints are available."
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody SignupRequest request) {
        userService.registerLocalUser(request.name().trim(), request.email().trim().toLowerCase(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Account created successfully."));
    }

    @PostMapping("/login")
    public ResponseEntity<UserProfileResponse> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletRequest httpServletRequest
    ) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.email().trim().toLowerCase(),
                    request.password()
                )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtService.generateToken(userDetails);

            User user = userService.getByEmail(request.email().trim().toLowerCase());
            return ResponseEntity.ok(new UserProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getRole().name(), jwt));
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
    }

    @GetMapping("/me")
public ResponseEntity<?> me(Authentication authentication) {

    if (authentication == null || !authentication.isAuthenticated() 
        || authentication.getName().equals("anonymousUser")) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "User not logged in"));
    }

    String email = resolveEmail(authentication);
    User user = userService.getByEmail(email);

    return ResponseEntity.ok(new UserProfileResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole().name(),
        null // Token not needed for /me as it's already provided in header
    ));
}

    private String resolveEmail(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2User oauth2User) {
            String email = oauth2User.getAttribute("email");
            if (email != null && !email.isBlank()) {
                return email;
            }
        }

        if (principal instanceof UserDetails userDetails) {
            String email = userDetails.getUsername();
            if (email != null && !email.isBlank()) {
                return email;
            }
        }

        String name = authentication.getName();
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user email not found.");
        }

        return name;
    }

    public record UserProfileResponse(String id, String name, String email, String role, String token) {
    }

    public record SignupRequest(
        @NotBlank(message = "Name is required.")
        String name,
        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        String email,
        @NotBlank(message = "Password is required.")
        @Size(min = 8, message = "Password must be at least 8 characters.")
        String password
    ) {
    }

    public record LoginRequest(
        @NotBlank(message = "Email is required.")
        @Email(message = "Enter a valid email address.")
        String email,
        @NotBlank(message = "Password is required.")
        String password
    ) {
    }
}
