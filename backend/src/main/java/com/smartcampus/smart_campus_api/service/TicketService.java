package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.CommentRequestDto;
import com.smartcampus.smart_campus_api.dto.TicketRequestDto;
import com.smartcampus.smart_campus_api.dto.TicketStatusUpdateDto;
import com.smartcampus.smart_campus_api.dto.TicketUpdateDto;
import com.smartcampus.smart_campus_api.exception.ResourceNotFoundException;
import com.smartcampus.smart_campus_api.exception.UnauthorizedAccessException;
import com.smartcampus.smart_campus_api.model.Comment;
import com.smartcampus.smart_campus_api.model.Role;
import com.smartcampus.smart_campus_api.model.Ticket;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.repository.CommentRepository;

import com.smartcampus.smart_campus_api.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private NotificationService notificationService;



    public Ticket createTicket(TicketRequestDto dto, String authorEmail) {
        User author = userService.getByEmail(authorEmail);



        Ticket ticket = new Ticket();
        ticket.setTitle(dto.getTitle());
        ticket.setDescription(dto.getDescription());
        ticket.setCategory(dto.getCategory());
        ticket.setPriority(dto.getPriority());
        ticket.setContactDetails(dto.getContactDetails());
        ticket.setResourceId(dto.getResourceId());
        ticket.setAttachments(dto.getAttachments());
        ticket.setAuthorId(author.getId());
        ticket.setStatus("OPEN");

        Ticket savedTicket = ticketRepository.save(ticket);

        // Notify admins and technicians about the new ticket
        java.util.List<User> staff = userService.getAllUsers().stream()
                .filter(u -> u.getRole() == Role.ADMIN || u.getRole() == Role.TECHNICIAN)
                .toList();

        for (User u : staff) {
            try {
                notificationService.createNotification(
                        u.getId(),
                        "A new ticket was submitted: " + ticket.getTitle(),
                        "TICKET"
                );
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }
        }

        return savedTicket;
    }

    public List<Ticket> getAllTickets(String userEmail) {
        User user = userService.getByEmail(userEmail);
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.TECHNICIAN) {
            throw new UnauthorizedAccessException("You do not have access to view all tickets.");
        }
        return ticketRepository.findAll();
    }

    public List<Ticket> getUserTickets(String userId) {
        return ticketRepository.findByAuthorId(userId);
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    public Ticket updateTicketStatus(String id, TicketStatusUpdateDto dto, String updaterEmail) {
        User updater = userService.getByEmail(updaterEmail);

        if (updater.getRole() != Role.ADMIN && updater.getRole() != Role.TECHNICIAN) {
            throw new UnauthorizedAccessException("You do not have permission to update ticket status.");
        }

        Ticket ticket = getTicketById(id);
        ticket.setStatus(dto.getStatus());
        ticket.setScheduledMeetingTime(dto.getScheduledMeetingTime());
        ticket.setMeetingMessage(dto.getMeetingMessage());
        
        // Auto assign to the technician who took in progress
        if ("IN_PROGRESS".equals(dto.getStatus()) && ticket.getAssigneeId() == null) {
            ticket.setAssigneeId(updater.getId());
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        try {
            notificationService.createNotification(
                    ticket.getAuthorId(),
                    "Your ticket '" + ticket.getTitle() + "' status has been updated to " + dto.getStatus(),
                    "TICKET"
            );
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return savedTicket;
    }

    public Comment addComment(String ticketId, CommentRequestDto dto, String authorEmail) {
        User author = userService.getByEmail(authorEmail);
        Ticket ticket = getTicketById(ticketId);

        Comment comment = new Comment();
        comment.setTicketId(ticket.getId());
        comment.setAuthorId(author.getId());
        comment.setContent(dto.getContent());

        Comment savedComment = commentRepository.save(comment);

        if (!author.getId().equals(ticket.getAuthorId())) {
            try {
                notificationService.createNotification(
                        ticket.getAuthorId(),
                        "A new comment was added to your ticket '" + ticket.getTitle() + "'",
                        "TICKET"
                );
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }
        }

        return savedComment;
    }

    public List<Comment> getCommentsForTicket(String ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    public void deleteComment(String commentId, String userEmail) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
        User user = userService.getByEmail(userEmail);

        if (!comment.getAuthorId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedAccessException("You can only delete your own comments.");
        }

        commentRepository.delete(comment);
    }

    public Ticket updateTicket(String id, TicketUpdateDto dto, String userEmail) {
        Ticket ticket = getTicketById(id);
        User user = userService.getByEmail(userEmail);

        if (!ticket.getAuthorId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedAccessException("You can only edit your own tickets.");
        }

        if (!ticket.getStatus().equals("OPEN") && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedAccessException("You can only edit tickets that are still OPEN.");
        }

        ticket.setTitle(dto.getTitle());
        ticket.setDescription(dto.getDescription());
        ticket.setCategory(dto.getCategory());
        ticket.setPriority(dto.getPriority());
        ticket.setContactDetails(dto.getContactDetails());

        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String id, String userEmail) {
        Ticket ticket = getTicketById(id);
        User user = userService.getByEmail(userEmail);

        if (!ticket.getAuthorId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new UnauthorizedAccessException("You can only delete your own tickets.");
        }

        List<Comment> comments = commentRepository.findByTicketId(id);
        commentRepository.deleteAll(comments);
        ticketRepository.delete(ticket);
    }
}
