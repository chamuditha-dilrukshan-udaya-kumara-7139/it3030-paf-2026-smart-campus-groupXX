package com.smartcampus.smart_campus_api.config;

import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.service.UserService;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final UserService userService;

    public AppUserDetailsService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userService.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("No user found for email: " + email));

        String password = user.getPassword();
        if (password == null || password.isBlank()) {
            throw new UsernameNotFoundException("Password login is not enabled for this account.");
        }

        return org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(password)
            .authorities(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
            .build();
    }
}
