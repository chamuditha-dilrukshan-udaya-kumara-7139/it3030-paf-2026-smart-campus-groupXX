package com.smartcampus.smart_campus_api.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.smartcampus.smart_campus_api.model.Role;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void updateUserRoleAllowsSwitchingBetweenUserAndTechnician() {
        User user = User.builder()
            .id("user-1")
            .name("Campus User")
            .email("user@example.com")
            .role(Role.USER)
            .build();

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);

        User updated = userService.updateUserRole("user-1", Role.TECHNICIAN);

        assertEquals(Role.TECHNICIAN, updated.getRole());
        verify(userRepository).save(user);
    }

    @Test
    void updateUserRoleRejectsPromotingUserToAdmin() {
        User user = User.builder()
            .id("user-1")
            .role(Role.USER)
            .build();

        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.updateUserRole("user-1", Role.ADMIN)
        );

        assertEquals("Admin role cannot be assigned from user management.", exception.getMessage());
        verify(userRepository, never()).save(user);
    }

    @Test
    void updateUserRoleRejectsChangingExistingAdminRole() {
        User admin = User.builder()
            .id("admin-1")
            .role(Role.ADMIN)
            .build();

        when(userRepository.findById("admin-1")).thenReturn(Optional.of(admin));

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> userService.updateUserRole("admin-1", Role.USER)
        );

        assertEquals("Admin accounts cannot be modified from user management.", exception.getMessage());
        verify(userRepository, never()).save(admin);
    }
}
