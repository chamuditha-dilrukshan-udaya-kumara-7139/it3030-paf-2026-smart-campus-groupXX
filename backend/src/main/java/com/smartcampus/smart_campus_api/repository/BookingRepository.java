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

    // Get all bookings for a specific resource
    List<Booking> findByResourceId(String resourceId);

    // Get all approved bookings for filtering in conflict detection
    List<Booking> findByResourceIdAndDateAndStatus(String resourceId, LocalDate date, BookingStatus status);

    // Get bookings by status
    List<Booking> findByStatus(BookingStatus status);

    // Get bookings by resource and status
    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);

    // Get bookings by date
    List<Booking> findByDate(LocalDate date);

    // Get bookings by multiple criteria for filtering
    List<Booking> findByStatusAndResourceIdAndDate(BookingStatus status, String resourceId, LocalDate date);

    // Find conflicting bookings - same resource, same date, APPROVED status, overlapping time
    @Query("{ 'resource.$id': ?0, 'date': ?1, 'status': 'APPROVED', 'startTime': { $lt: ?3 }, 'endTime': { $gt: ?2 } }")
    List<Booking> findConflictingBookings(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime);
}
