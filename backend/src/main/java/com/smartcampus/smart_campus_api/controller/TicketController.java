package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.CommentRequestDto;
import com.smartcampus.smart_campus_api.dto.TicketRequestDto;
import com.smartcampus.smart_campus_api.dto.TicketStatusUpdateDto;
import com.smartcampus.smart_campus_api.dto.TicketUpdateDto;
import com.smartcampus.smart_campus_api.model.Comment;
import com.smartcampus.smart_campus_api.model.Ticket;
import com.smartcampus.smart_campus_api.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody TicketRequestDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Ticket ticket = ticketService.createTicket(dto, email);
        return new ResponseEntity<>(ticket, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ticketService.getAllTickets(email));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getUserTickets(@PathVariable String userId) {
        return ResponseEntity.ok(ticketService.getUserTickets(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(@PathVariable String id, @Valid @RequestBody TicketStatusUpdateDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, dto, email));
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable String ticketId, @Valid @RequestBody CommentRequestDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return new ResponseEntity<>(ticketService.addComment(ticketId, dto, email), HttpStatus.CREATED);
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<Comment>> getCommentsForTicket(@PathVariable String ticketId) {
        return ResponseEntity.ok(ticketService.getCommentsForTicket(ticketId));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable String id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ticketService.deleteComment(id, email);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable String id, @Valid @RequestBody TicketUpdateDto dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(ticketService.updateTicket(id, dto, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ticketService.deleteTicket(id, email);
        return ResponseEntity.noContent().build();
    }
}
