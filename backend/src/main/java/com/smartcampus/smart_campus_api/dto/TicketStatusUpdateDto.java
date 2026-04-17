package com.smartcampus.smart_campus_api.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TicketStatusUpdateDto {

    @NotNull(message = "Status is required")
    @Pattern(regexp = "OPEN|IN_PROGRESS|RESOLVED|CLOSED|REJECTED", message = "Status must be OPEN, IN_PROGRESS, RESOLVED, CLOSED, or REJECTED")
    private String status;

    private String scheduledMeetingTime;

    private String meetingMessage;
}
