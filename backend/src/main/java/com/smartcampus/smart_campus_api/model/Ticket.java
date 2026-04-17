package com.smartcampus.smart_campus_api.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "tickets")
@Data
public class Ticket {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Priority is required")
    @Pattern(regexp = "LOW|MEDIUM|HIGH", message = "Priority must be LOW, MEDIUM, or HIGH")
    private String priority;

    @NotNull(message = "Status is required")
    @Pattern(regexp = "OPEN|IN_PROGRESS|RESOLVED|CLOSED|REJECTED", message = "Status must be OPEN, IN_PROGRESS, RESOLVED, CLOSED, or REJECTED")
    private String status;

    private String contactDetails;

    private String resourceId;

    private String authorId; // Automatically set by backend from security context

    private String assigneeId; // Can be set by Admin/Technician

    private String scheduledMeetingTime;

    private String meetingMessage;

    private List<String> attachments; // Base64 encoded strings

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
