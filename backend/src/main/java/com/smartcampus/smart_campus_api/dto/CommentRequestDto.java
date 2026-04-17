package com.smartcampus.smart_campus_api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CommentRequestDto {

    @NotBlank(message = "Content is required")
    private String content;

    @NotBlank(message = "Ticket ID is required")
    private String ticketId;
}
