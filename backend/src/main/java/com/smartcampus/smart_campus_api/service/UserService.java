package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.model.Role;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.repository.UserRepository;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User saveOAuthUser(String email, String name) {
        return userRepository.findByEmail(email)
            .orElseGet(() -> userRepository.save(
                User.builder()
                    .email(email)
                    .name(name)
                    .role(Role.USER)
                    .build()
            ));
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new NoSuchElementException("User not found for email: " + email));
    }
}
