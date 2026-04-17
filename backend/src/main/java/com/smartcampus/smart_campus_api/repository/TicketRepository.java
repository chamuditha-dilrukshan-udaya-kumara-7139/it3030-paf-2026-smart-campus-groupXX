package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByAuthorId(String authorId);
    List<Ticket> findByResourceId(String resourceId);
    List<Ticket> findByStatus(String status);
}
