package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.service.ResourceService;
import jakarta.validation.Valid; // මේක අලුතින් add වුණා
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    // GET all resources
    @GetMapping
    public List<Resource> getAllResources() {
        return resourceService.getAllResources();
    }

    // GET by ID
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(
            @PathVariable Long id) {
        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST create - @Valid එකතු කර ඇත
    @PostMapping
    public ResponseEntity<Resource> createResource(
            @Valid @RequestBody Resource resource) {
        Resource created = resourceService.createResource(resource);
        return ResponseEntity.status(201).body(created);
    }

    // PUT update - @Valid එකතු කර ඇත
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody Resource resource) {
        return ResponseEntity.ok(
            resourceService.updateResource(id, resource));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    // GET search by type
    @GetMapping("/search")
    public List<Resource> searchResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location) {
        if (type != null) 
            return resourceService.getByType(type);
        if (location != null) 
            return resourceService.getByLocation(location);
        return resourceService.getAllResources();
    }
}