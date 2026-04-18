package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.AdminUserDto;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.smart_campus_api.model.Role;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.service.UserService;
import java.util.List;
import java.util.Comparator;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> status() {
        return ResponseEntity.ok(Map.of("message", "Admin access granted."));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        List<AdminUserDto> users = userService.getAllUsers().stream()
            .sorted(Comparator.comparing(User::getName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
            .map(AdminUserDto::from)
            .toList();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<AdminUserDto> updateUserRole(@PathVariable String userId, @RequestBody Role role) {
        return ResponseEntity.ok(AdminUserDto.from(userService.updateUserRole(userId, role)));
    }
}
