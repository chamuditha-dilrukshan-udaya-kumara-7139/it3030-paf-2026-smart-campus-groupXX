package com.smartcampus.smart_campus_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class TicketRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Priority is required")
    @Pattern(regexp = "LOW|MEDIUM|HIGH", message = "Priority must be LOW, MEDIUM, or HIGH")
    private String priority;

    @NotBlank(message = "Contact details are required")
    private String contactDetails;

    private String resourceId;

    @Size(max = 3, message = "Maximum 3 image attachments are allowed")
    private List<String> attachments;
}
