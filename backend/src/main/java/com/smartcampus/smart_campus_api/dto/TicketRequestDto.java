package com.smartcampus.smart_campus_api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import lombok.Data;
import java.util.List;

@Data
public class TicketRequestDto {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    private String description;

    @NotBlank(message = "Category is required")
    @Pattern(regexp = "IT_EQUIPMENT|FURNITURE|HVAC|PLUMBING|OTHER", 
             message = "Category must be one of: IT_EQUIPMENT, FURNITURE, HVAC, PLUMBING, OTHER")
    private String category;

    @NotNull(message = "Priority is required")
    @Pattern(regexp = "LOW|MEDIUM|HIGH", message = "Priority must be LOW, MEDIUM, or HIGH")
    private String priority;

    @NotBlank(message = "Contact details are required")
    @Pattern(regexp = "^\\+?\\d{7,15}$", 
             message = "Contact details must be a valid phone number (7-15 digits, optionally starting with +)")
    private String contactDetails;

    private String resourceId;

    @Size(min = 0, max = 3, message = "Maximum 3 image attachments are allowed")
    private List<String> attachments;
}
