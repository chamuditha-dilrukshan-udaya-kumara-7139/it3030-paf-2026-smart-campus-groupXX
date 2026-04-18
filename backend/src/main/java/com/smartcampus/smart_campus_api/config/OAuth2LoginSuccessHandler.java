package com.smartcampus.smart_campus_api.config;

import com.smartcampus.smart_campus_api.service.UserService;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtService jwtService;
    private final AppUserDetailsService appUserDetailsService;

    public OAuth2LoginSuccessHandler(
            @Lazy UserService userService, 
            @Lazy JwtService jwtService, 
            @Lazy AppUserDetailsService appUserDetailsService
    ) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.appUserDetailsService = appUserDetailsService;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        
        if (email == null) {
            response.sendRedirect("http://localhost:5177/login?error=email_not_provided");
            return;
        }

        // Fetch user details for JWT generation
        UserDetails userDetails = appUserDetailsService.loadUserByUsername(email);
        String token = jwtService.generateToken(userDetails);

        // redirect to frontend with token
        response.sendRedirect("http://localhost:5177/login?token=" + token);
    }
}