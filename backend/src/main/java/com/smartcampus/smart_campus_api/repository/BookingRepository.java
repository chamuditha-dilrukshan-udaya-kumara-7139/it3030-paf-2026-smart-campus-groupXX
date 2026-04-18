package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Booking;
import com.smartcampus.smart_campus_api.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // Get all bookings for a specific user
    List<Booking> findByRequestedById(String userId);

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

    // Find conflicting bookings - same venue, same date, APPROVED status, overlapping time
    @Query("{ 'venue': ?0, 'date': ?1, 'status': 'APPROVED', 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(String venue, LocalDate date, LocalTime startTime, LocalTime endTime);
}
