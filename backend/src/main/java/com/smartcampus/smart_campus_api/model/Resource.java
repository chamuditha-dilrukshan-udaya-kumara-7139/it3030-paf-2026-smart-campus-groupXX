package com.smartcampus.smart_campus_api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String status;
    private String availabilityWindows;
}