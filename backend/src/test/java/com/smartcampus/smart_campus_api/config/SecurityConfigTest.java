package com.smartcampus.smart_campus_api.config;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.smartcampus.smart_campus_api.model.Role;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.service.ResourceService;
import com.smartcampus.smart_campus_api.service.UserService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ResourceService resourceService;

    @MockitoBean
    private UserService userService;

    @Test
    void unauthenticatedUserCannotAccessProtectedResourceEndpoint() throws Exception {
        mockMvc.perform(get("/api/resources"))
            .andExpect(status().is3xxRedirection());
    }

    @Test
    void authenticatedUserCanAccessNonAdminEndpoint() throws Exception {
        when(resourceService.getAllResources()).thenReturn(List.of());

        mockMvc.perform(get("/api/resources")
                .with(user("user@example.com").roles("USER")))
            .andExpect(status().isOk());
    }

    @Test
    void authenticatedUserCanReadOwnProfile() throws Exception {
        when(userService.getByEmail("user@example.com")).thenReturn(
            User.builder()
                .id(7L)
                .name("Campus User")
                .email("user@example.com")
                .role(Role.USER)
                .build()
        );

        mockMvc.perform(get("/api/auth/me")
                .with(user("user@example.com").roles("USER")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(7))
            .andExpect(jsonPath("$.name").value("Campus User"))
            .andExpect(jsonPath("$.email").value("user@example.com"))
            .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void nonAdminUserCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/status")
                .with(user("user@example.com").roles("USER")))
            .andExpect(status().isForbidden());
    }

    @Test
    void adminUserCanAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/status")
                .with(user("admin@example.com").roles("ADMIN")))
            .andExpect(status().isOk());
    }
}
