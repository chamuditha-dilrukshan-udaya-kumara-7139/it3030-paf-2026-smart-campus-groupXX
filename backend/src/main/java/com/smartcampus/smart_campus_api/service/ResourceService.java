package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource resource) {
        resource.setId(id);
        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        resourceRepository.deleteById(id);
    }

    /**
     * Dynamic search: any combination of type, location, minCapacity.
     * Null parameters are ignored — passing no params returns all resources.
     */
    public List<Resource> search(String type, String location, Integer minCapacity) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (type != null && !type.isBlank()) {
            criteriaList.add(Criteria.where("type").is(type));
        }
        if (location != null && !location.isBlank()) {
            criteriaList.add(Criteria.where("location").is(location));
        }
        if (minCapacity != null) {
            criteriaList.add(Criteria.where("capacity").gte(minCapacity));
        }

        if (criteriaList.isEmpty()) {
            return resourceRepository.findAll();
        }

        Query query = new Query(
            new Criteria().andOperator(criteriaList.toArray(new Criteria[0]))
        );
        return mongoTemplate.find(query, Resource.class);
    }
}