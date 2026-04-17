package com.smartcampus.smart_campus_api.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "comments")
@Data
public class Comment {

    @Id
    private String id;

    @NotBlank(message = "Ticket ID is required")
    private String ticketId;

    private String authorId; // Automatically set by backend

    @NotBlank(message = "Content is required")
    private String content;

    @CreatedDate
    private Instant createdAt;
}
