package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Booking;
import com.smartcampus.smart_campus_api.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // Get all bookings for a specific user
    List<Booking> findByRequestedBy_Id(String userId);

    // Get all bookings for a specific venue
    List<Booking> findByVenue(String venue);

    // Get all approved bookings for filtering in conflict detection
    List<Booking> findByVenueAndDateAndStatus(String venue, LocalDate date, BookingStatus status);

    // Get bookings by status
    List<Booking> findByStatus(BookingStatus status);

    // Get bookings by venue and status
    List<Booking> findByVenueAndStatus(String venue, BookingStatus status);

    // Get bookings by date
    List<Booking> findByDate(LocalDate date);

    // Get bookings by multiple criteria for filtering
    List<Booking> findByStatusAndVenueAndDate(BookingStatus status, String venue, LocalDate date);

    // Find conflicting active bookings - same venue, same date, overlapping time.
    // PENDING and APPROVED bookings both block the slot.
    @Query("{ 'venue': ?0, 'date': ?1, 'status': { $in: ['PENDING', 'APPROVED'] }, 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findActiveConflictingBookings(String venue, LocalDate date, LocalTime startTime, LocalTime endTime);

    // Find conflicting active bookings excluding a specific booking ID
    @Query("{ '_id': { $ne: ?0 }, 'venue': ?1, 'date': ?2, 'status': { $in: ['PENDING', 'APPROVED'] }, 'startTime': { $lt: ?4 }, 'endTime': { $gt: ?3 } }")
    List<Booking> findActiveConflictingBookingsExcludingId(String excludeId, String venue, LocalDate date, LocalTime startTime, LocalTime endTime);
}
