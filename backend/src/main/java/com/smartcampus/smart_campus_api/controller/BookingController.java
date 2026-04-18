package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.dto.BookingRequestDTO;
import com.smartcampus.smart_campus_api.dto.BookingResponseDTO;
import com.smartcampus.smart_campus_api.dto.BookingStatusUpdateDTO;
import com.smartcampus.smart_campus_api.model.BookingStatus;
import com.smartcampus.smart_campus_api.service.BookingService;
import com.smartcampus.smart_campus_api.service.UserService;
import com.smartcampus.smart_campus_api.model.Role;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    public BookingController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    /**
     * POST /api/bookings
     * Create a new booking request
     * Status: 201 Created on success
     * Status: 400 Bad Request on validation error or conflict
     * Status: 401 Unauthorized if not authenticated
     * Status: 404 Not Found if resource doesn't exist
     * Status: 409 Conflict if scheduling conflict detected
     */
    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@Valid @RequestBody BookingRequestDTO requestDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String userId = userService.getUserByEmail(email).getId();

        BookingResponseDTO response = bookingService.createBooking(userId, requestDTO);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * GET /api/bookings
     * Get bookings - returns own bookings for USER, all bookings for ADMIN
     * Status: 200 OK on success
     * Status: 401 Unauthorized if not authenticated
     * Status: 403 Forbidden if access denied
     */
    @GetMapping
    public ResponseEntity<List<BookingResponseDTO>> getBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String venue,
            @RequestParam(required = false) LocalDate date) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userService.getUserByEmail(email);
        String userId = user.getId();
        Role role = user.getRole();

        List<BookingResponseDTO> bookings;

        // If ADMIN or TECHNICIAN and filters provided, return filtered bookings (all bookings)
        if ((role == Role.ADMIN || role == Role.TECHNICIAN) && (status != null || venue != null || date != null)) {
            bookings = bookingService.getFilteredBookings(status, venue, date);
        }
        // If ADMIN or TECHNICIAN and no filters, return all bookings
        else if (role == Role.ADMIN || role == Role.TECHNICIAN) {
            bookings = bookingService.getAllBookings();
        }
        // If USER, return only their own bookings
        else {
            bookings = bookingService.getUserBookings(userId);
        }

        return ResponseEntity.ok(bookings);
    }

    /**
     * GET /api/bookings/{id}
     * Get a specific booking by ID
     * Status: 200 OK on success
     * Status: 401 Unauthorized if not authenticated
     * Status: 403 Forbidden if USER tries to view another user's booking
     * Status: 404 Not Found if booking doesn't exist
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> getBookingById(@PathVariable String id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userService.getUserByEmail(email);
        String userId = user.getId();
        Role role = user.getRole();

        BookingResponseDTO response = bookingService.getBookingById(id, userId, role);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/bookings/{id}
     * Update a booking (edit details)
     * Only the user who created the booking can update it, and only if PENDING
     * Status: 200 OK on success
     * Status: 400 Bad Request on validation error or conflict
     * Status: 401 Unauthorized if not authenticated
     * Status: 403 Forbidden if user tries to update another user's booking
     * Status: 404 Not Found if booking doesn't exist
     * Status: 409 Conflict if scheduling conflict detected
     */
    @PutMapping("/{id}")
    public ResponseEntity<BookingResponseDTO> updateBooking(@PathVariable String id, @Valid @RequestBody BookingRequestDTO requestDTO) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String userId = userService.getUserByEmail(email).getId();

        BookingResponseDTO response = bookingService.updateBooking(id, userId, requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/bookings/{id}/status
     * Update booking status (approve or reject)
     * Only ADMIN can do this
     * Status: 200 OK on success
     * Status: 400 Bad Request on validation error
     * Status: 401 Unauthorized if not authenticated
     * Status: 403 Forbidden if not ADMIN
     * Status: 404 Not Found if booking doesn't exist
     * Status: 409 Conflict if conflict detected when approving
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponseDTO> updateBookingStatus(
            @PathVariable String id,
            @Valid @RequestBody BookingStatusUpdateDTO updateDTO) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String adminId = userService.getUserByEmail(email).getId();

        BookingResponseDTO response = bookingService.updateBookingStatus(id, updateDTO, adminId);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/bookings/{id}/cancel
     * Cancel an approved booking
     * Only the user who created the booking can cancel it
     * Status: 204 No Content on success
     * Status: 400 Bad Request if booking is not APPROVED
     * Status: 401 Unauthorized if not authenticated
     * Status: 403 Forbidden if user tries to cancel another user's booking
     * Status: 404 Not Found if booking doesn't exist
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable String id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String userId = userService.getUserByEmail(email).getId();

        bookingService.cancelBooking(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/bookings/{id}
     * Delete a booking record
     * ADMIN/TECHNICIAN can delete any booking, USER can delete their own PENDING bookings
     * Status: 204 No Content on success
     * Status: 401 Unauthorized if not authenticated
     * Status: 403 Forbidden if not authorized
     * Status: 404 Not Found if booking doesn't exist
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userService.getUserByEmail(email);
        String userId = user.getId();
        Role role = user.getRole();

        bookingService.deleteBooking(id, userId, role);
        return ResponseEntity.noContent().build();
    }
}
