package com.smartcampus.smart_campus_api.dto;

import com.smartcampus.smart_campus_api.model.User;

public record AdminUserDto(String id, String name, String email, String role) {

    public static AdminUserDto from(User user) {
        return new AdminUserDto(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name()
        );
    }
}
