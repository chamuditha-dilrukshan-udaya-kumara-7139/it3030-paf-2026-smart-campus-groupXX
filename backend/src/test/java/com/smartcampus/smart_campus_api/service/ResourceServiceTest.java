package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.repository.ResourceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    @Test
    public void testGetResourceById_Success() {
        Resource resource = new Resource();
        resource.setId("123");
        resource.setName("Main Hall");
        when(resourceRepository.findById("123")).thenReturn(Optional.of(resource));

        Optional<Resource> found = resourceService.getResourceById("123");

        assertTrue(found.isPresent());
        assertEquals("Main Hall", found.get().getName());
    }
}