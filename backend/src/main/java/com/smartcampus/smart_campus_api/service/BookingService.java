package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.dto.BookingRequestDTO;
import com.smartcampus.smart_campus_api.dto.BookingResponseDTO;
import com.smartcampus.smart_campus_api.dto.BookingStatusUpdateDTO;
import com.smartcampus.smart_campus_api.exception.BookingConflictException;
import com.smartcampus.smart_campus_api.exception.ResourceNotFoundException;
import com.smartcampus.smart_campus_api.exception.UnauthorizedAccessException;
import com.smartcampus.smart_campus_api.model.Booking;
import com.smartcampus.smart_campus_api.model.BookingStatus;
import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.model.Role;
import com.smartcampus.smart_campus_api.model.User;
import com.smartcampus.smart_campus_api.repository.BookingRepository;
import com.smartcampus.smart_campus_api.repository.ResourceRepository;
import com.smartcampus.smart_campus_api.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                         ResourceRepository resourceRepository,
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * Create a new booking request
     * - Checks for resource existence
     * - Detects scheduling conflicts with APPROVED bookings
     * - Sets status as PENDING by default
     */
    public BookingResponseDTO createBooking(String userId, BookingRequestDTO requestDTO) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // Validate time range
        if (requestDTO.getStartTime().isAfter(requestDTO.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Validate date is not in the past
        LocalDate today = LocalDate.now();
        if (requestDTO.getDate().isBefore(today)) {
            throw new IllegalArgumentException("Cannot book for past dates");
        }

        // Validate time is between 8am and 8pm
        LocalTime businessStart = LocalTime.of(8, 0);
        LocalTime businessEnd = LocalTime.of(20, 0);
        if (requestDTO.getStartTime().isBefore(businessStart) || requestDTO.getStartTime().isAfter(businessEnd) ||
            requestDTO.getEndTime().isBefore(businessStart) || requestDTO.getEndTime().isAfter(businessEnd)) {
            throw new IllegalArgumentException("Booking time must be between 8:00 AM and 8:00 PM");
        }

        // Check for scheduling conflicts with APPROVED bookings
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                requestDTO.getVenue(),
                requestDTO.getDate(),
                requestDTO.getStartTime(),
                requestDTO.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Scheduling conflict detected. This venue is already booked during the requested time on " + requestDTO.getDate()
            );
        }

        // Create new booking with PENDING status
        Booking booking = Booking.builder()
                .venue(requestDTO.getVenue())
                .requestedBy(user)
                .date(requestDTO.getDate())
                .startTime(requestDTO.getStartTime())
                .endTime(requestDTO.getEndTime())
                .purpose(requestDTO.getPurpose())
                .expectedAttendees(requestDTO.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return convertToResponseDTO(savedBooking);
    }

    /**
     * Get all bookings for a user (their own bookings only)
     */
    public List<BookingResponseDTO> getUserBookings(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        return bookingRepository.findByRequestedById(userId).stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all bookings (admin only)
     */
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get filtered bookings (admin only)
     * Can filter by status, resourceId, and/or date
     */
    public List<BookingResponseDTO> getFilteredBookings(BookingStatus status, String venue, LocalDate date) {
        List<Booking> bookings = bookingRepository.findAll();

        if (status != null) {
            bookings = bookings.stream()
                    .filter(b -> b.getStatus() == status)
                    .collect(Collectors.toList());
        }

        if (venue != null && !venue.isEmpty()) {
            bookings = bookings.stream()
                    .filter(b -> b.getVenue().equalsIgnoreCase(venue))
                    .collect(Collectors.toList());
        }

        if (date != null) {
            bookings = bookings.stream()
                    .filter(b -> b.getDate().equals(date))
                    .collect(Collectors.toList());
        }

        return bookings.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific booking by ID
     */
    public BookingResponseDTO getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        return convertToResponseDTO(booking);
    }

    /**
     * Get a specific booking by ID with role validation
     * USER can only see their own bookings, ADMIN can see all
     */
    public BookingResponseDTO getBookingById(String bookingId, String userId, Role userRole) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        // Check authorization
        if (userRole == Role.USER && !booking.getRequestedBy().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to view this booking");
        }

        return convertToResponseDTO(booking);
    }

    /**
     * Update booking status (approve or reject)
     * Only ADMIN can do this
     */
    public BookingResponseDTO updateBookingStatus(String bookingId, BookingStatusUpdateDTO updateDTO, String adminId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        // Validate that the user is actually an admin or technician
        if (admin.getRole() != Role.ADMIN && admin.getRole() != Role.TECHNICIAN) {
            throw new UnauthorizedAccessException("Only admins and technicians can update booking status");
        }

        // Can only transition from PENDING to APPROVED or REJECTED
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be approved or rejected. Current status: " + booking.getStatus());
        }

        // If rejecting, reason is required
        if (updateDTO.getStatus() == BookingStatus.REJECTED) {
            if (updateDTO.getReason() == null || updateDTO.getReason().trim().isEmpty()) {
                throw new IllegalArgumentException("Rejection reason is required when rejecting a booking");
            }
            booking.setRejectionReason(updateDTO.getReason());
        }

        // If approving, check for conflicts again (in case another booking was approved in between)
        if (updateDTO.getStatus() == BookingStatus.APPROVED) {
            List<Booking> conflicts = bookingRepository.findConflictingBookings(
                    booking.getVenue(),
                    booking.getDate(),
                    booking.getStartTime(),
                    booking.getEndTime()
            );

            if (!conflicts.isEmpty()) {
                throw new BookingConflictException(
                        "Cannot approve booking. A conflict was detected with another approved booking."
                );
            }
        }

        booking.setStatus(updateDTO.getStatus());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);

        // Send notification to the user
        try {
            notificationService.createNotification(
                    updatedBooking.getRequestedBy().getId(),
                    "Your booking for " + updatedBooking.getVenue() +
                    " has been " + updatedBooking.getStatus().toString().toLowerCase() +
                    (updateDTO.getReason() != null ? ". Reason: " + updateDTO.getReason() : "")
            );
        } catch (Exception e) {
            // Log but don't fail the request if notification fails
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return convertToResponseDTO(updatedBooking);
    }

    /**
     * Cancel an approved booking
     * Only the user who created the booking can cancel it
     */
    public void cancelBooking(String bookingId, String userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        // Check authorization - only the user who created it can cancel
        if (!booking.getRequestedBy().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to cancel this booking");
        }

        // Can only cancel APPROVED bookings
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Only APPROVED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(LocalDateTime.now());

        bookingRepository.save(booking);

        // Send notification
        try {
            notificationService.createNotification(
                    userId,
                    "Your booking for " + booking.getVenue() + " has been cancelled"
            );
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    /**
     * Delete a booking (admin only)
     */
    public void deleteBooking(String bookingId, String adminId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        if (admin.getRole() != Role.ADMIN && admin.getRole() != Role.TECHNICIAN) {
            throw new UnauthorizedAccessException("Only admins and technicians can delete bookings");
        }

        bookingRepository.deleteById(bookingId);
    }

    /**
     * Convert Booking entity to BookingResponseDTO
     */
    private BookingResponseDTO convertToResponseDTO(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .venue(booking.getVenue())
                .requestedById(booking.getRequestedBy().getId())
                .requestedByName(booking.getRequestedBy().getName())
                .requestedByEmail(booking.getRequestedBy().getEmail())
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .rejectionReason(booking.getRejectionReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
