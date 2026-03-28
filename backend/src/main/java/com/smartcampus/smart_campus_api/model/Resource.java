package com.smartcampus.smart_campus_api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Data
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotBlank(message = "Resource type is required")
    private String type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "ACTIVE|OUT_OF_SERVICE|UNDER_MAINTENANCE", 
             message = "Status must be ACTIVE, OUT_OF_SERVICE or UNDER_MAINTENANCE")
    private String status;

    private String availabilityWindows;
}