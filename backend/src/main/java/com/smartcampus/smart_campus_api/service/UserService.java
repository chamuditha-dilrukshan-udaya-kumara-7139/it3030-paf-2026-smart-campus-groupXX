package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.model.Role;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.repository.UserRepository;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User saveOAuthUser(String email, String name) {
        return userRepository.findByEmail(email)
            .orElseGet(() -> userRepository.save(
                User.builder()
                    .email(email)
                    .name(name)
                    .password(null)
                    .role(Role.USER)
                    .build()
            ));
    }

    public User registerLocalUser(String name, String email, String rawPassword) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("An account already exists for this email.");
        }

        return userRepository.save(
            User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.USER)
                .build()
        );
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new NoSuchElementException("User not found for email: " + email));
    }

    public User getUserByEmail(String email) {
        return getByEmail(email);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRole(String userId, Role role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new java.util.NoSuchElementException("User not found for id: " + userId));
        user.setRole(role);
        return userRepository.save(user);
    }
}
