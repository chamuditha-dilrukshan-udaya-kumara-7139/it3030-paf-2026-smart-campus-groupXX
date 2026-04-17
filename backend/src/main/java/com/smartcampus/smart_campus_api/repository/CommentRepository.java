package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByTicketId(String ticketId);
}
