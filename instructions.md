# IT3030 PAF Assignment 2026 – Member 2 Guide
## Module B: Booking Management + Conflict Checking

---

## Important Details

| Item | Detail |
|------|--------|
| **Weight** | 30% of final IT3030 mark |
| **Submission Deadline** | 27th April 2026, 11:45 PM (GMT +5:30) |
| **Stack** | Spring Boot REST API + React Client |
| **Version Control** | GitHub + GitHub Actions required |
| **Individual Requirement** | Minimum 4 REST endpoints using different HTTP methods |

---

## Your Responsibility

You are responsible for **Module B – Booking Management** in the Smart Campus Operations Hub system. This includes:

- Allowing users to request bookings for campus resources
- Implementing the full booking status workflow
- Detecting and preventing scheduling conflicts
- Admin controls for approving and rejecting bookings
- Filtering and listing bookings based on role

---

## Booking Workflow

```
PENDING → APPROVED → CANCELLED
       → REJECTED
```

- All new bookings start as **PENDING**
- Only **ADMIN** can move to APPROVED or REJECTED (with a reason)
- Only the **USER** who owns the booking can CANCEL it (only if APPROVED)

---

## REST API Endpoints (Minimum 4 Required)

| # | Method | Endpoint | Description | Role |
|---|--------|----------|-------------|------|
| 1 | `POST` | `/api/bookings` | Create a new booking request | USER |
| 2 | `GET` | `/api/bookings` | Get bookings (own for USER, all for ADMIN) | USER / ADMIN |
| 3 | `GET` | `/api/bookings/{id}` | Get a specific booking by ID | USER / ADMIN |
| 4 | `PATCH` | `/api/bookings/{id}/status` | Approve or reject a booking with reason | ADMIN only |
| 5 | `PATCH` | `/api/bookings/{id}/cancel` | Cancel an approved booking | USER |
| 6 | `DELETE` | `/api/bookings/{id}` | Delete a booking record | ADMIN only |
| 7 | `GET` | `/api/bookings?resourceId=&date=&status=` | Filtered booking list | ADMIN |

> You must use GET, POST, PUT/PATCH, and DELETE across your endpoints.

---

## HTTP Status Codes to Use

| Situation | Status Code |
|-----------|-------------|
| Booking created successfully | `201 Created` |
| Fetched successfully | `200 OK` |
| Cancelled / Deleted | `204 No Content` |
| Validation error | `400 Bad Request` |
| Not authenticated | `401 Unauthorized` |
| Access denied (wrong role) | `403 Forbidden` |
| Booking not found | `404 Not Found` |
| Scheduling conflict detected | `409 Conflict` |

---

## Database Entity

```java
@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Resource resource;           // From Member 1

    @ManyToOne
    private AppUser requestedBy;         // From Member 4

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    private String purpose;
    private int expectedAttendees;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;        // PENDING, APPROVED, REJECTED, CANCELLED

    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

```java
public enum BookingStatus {
    PENDING, APPROVED, REJECTED, CANCELLED
}
```

---

## Conflict Detection Logic (Critical)

Prevent two approved bookings from overlapping on the same resource.

```java
// BookingRepository.java
@Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
       "AND b.date = :date " +
       "AND b.status = 'APPROVED' " +
       "AND b.startTime < :endTime " +
       "AND b.endTime > :startTime")
List<Booking> findConflictingBookings(
    Long resourceId,
    LocalDate date,
    LocalTime startTime,
    LocalTime endTime
);
```

- If any result is returned → throw `BookingConflictException` → return `409 Conflict`
- Only check against **APPROVED** bookings (ignore PENDING / REJECTED / CANCELLED)
- Test edge cases: back-to-back times, same start time, full overlap

---

## DTOs

### BookingRequestDTO (User sends this to create a booking)

```java
public class BookingRequestDTO {

    @NotNull
    private Long resourceId;

    @NotNull
    private LocalDate date;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    @NotBlank
    private String purpose;

    @Min(1)
    private int expectedAttendees;
}
```

### BookingStatusUpdateDTO (Admin sends this to approve/reject)

```java
public class BookingStatusUpdateDTO {

    @NotNull
    private BookingStatus status;    // APPROVED or REJECTED

    private String reason;           // Required if REJECTED
}
```

---

## Spring Boot File Structure

```
src/
├── controller/
│   └── BookingController.java
├── service/
│   └── BookingService.java
├── repository/
│   └── BookingRepository.java
├── model/
│   ├── Booking.java
│   └── BookingStatus.java
├── dto/
│   ├── BookingRequestDTO.java
│   ├── BookingResponseDTO.java
│   └── BookingStatusUpdateDTO.java
├── exception/
│   └── BookingConflictException.java
```

---

## Role-Based Access Rules

| Endpoint | USER | ADMIN |
|----------|------|-------|
| `POST /bookings` | ✅ Own only | ✅ |
| `GET /bookings` | ✅ Own only | ✅ All + filters |
| `GET /bookings/{id}` | ✅ Own only | ✅ Any |
| `PATCH /bookings/{id}/status` | ❌ | ✅ Only |
| `PATCH /bookings/{id}/cancel` | ✅ Own only | ✅ |
| `DELETE /bookings/{id}` | ❌ | ✅ Only |

---

## React Components to Build

```
src/
├── pages/
│   ├── MyBookings.jsx              ← User's booking list page
│   └── AdminBookings.jsx           ← Admin view with filters
├── components/
│   ├── BookingForm.jsx             ← Create booking form
│   ├── BookingCard.jsx             ← Booking item with status + actions
│   ├── BookingStatusBadge.jsx      ← Colour-coded status label
│   └── AdminApprovalPanel.jsx      ← Approve/reject with reason input
├── services/
│   └── bookingService.js           ← All Axios API calls for bookings
```

---

## Marking Breakdown

### REST API – 30 Marks (Individual)

| Criteria | Marks | How to Score Full Marks |
|----------|-------|------------------------|
| Proper Endpoint Naming | 5 | Use `/bookings`, `/bookings/{id}`, `/bookings/{id}/status` — clean, consistent, RESTful |
| Follow 6 REST Architectural Styles | 10 | Stateless requests, layered Spring architecture, uniform interface, proper HTTP verbs |
| Correct HTTP Methods + Status Codes | 10 | Use `201`, `200`, `204`, `400`, `403`, `404`, `409` correctly and consistently |
| Code Quality | 5 | Clean service/controller separation, DTOs, validation annotations, proper naming |
| Satisfying All Requirements | 5 | Full workflow works, conflict detection solid, filters functional |

### Client Web Application – 15 Marks (Individual)

| Criteria | Marks | How to Score Full Marks |
|----------|-------|------------------------|
| Proper Architectural Design | 5 | Modular components, separate API service layer, reusable hooks |
| Satisfying All Requirements | 5 | Booking form, status badges, admin approval panel, cancel button all working |
| Good UI/UX | 10 | Date/time picker, colour-coded status flow, conflict error shown clearly, clean admin view |

### Version Control – 10 Marks (Group)

| Criteria | Marks | How to Score Full Marks |
|----------|-------|------------------------|
| Proper Git Usage | 5 | Meaningful commits, branching (`feature/booking-management`), no bulk commits |
| GitHub Actions Workflow | 5 | Build + test pipeline configured and passing |

---

## Team Coordination

| Member | What You Need From Them |
|--------|------------------------|
| **Member 1** | `Resource` entity and its ID — required for booking creation |
| **Member 4** | `AppUser` entity and JWT auth — required to link user to booking |
| **Member 4** | Call `NotificationService.notify()` after approve/reject to trigger user notification |

> Agree on the `Resource` and `AppUser` entity structure with Members 1 and 4 early — you depend on both.

---

## Notification Trigger (Coordinate with Member 4)

After you approve or reject a booking, call Member 4's notification service:

```java
// Inside BookingService.java after status update
notificationService.send(
    booking.getRequestedBy().getId(),
    "Your booking for " + booking.getResource().getName() +
    " has been " + newStatus.toString().toLowerCase()
);
```

---

## Complete Implementation Checklist

### Spring Boot API
- [ ] `Booking` entity with all fields and JPA annotations
- [ ] `BookingStatus` enum defined (PENDING, APPROVED, REJECTED, CANCELLED)
- [ ] `BookingRequestDTO` with proper validation annotations
- [ ] `BookingStatusUpdateDTO` with validation
- [ ] `BookingResponseDTO` for clean API responses
- [ ] `POST /api/bookings` — creates booking with status PENDING
- [ ] `GET /api/bookings` — returns own bookings for USER, all for ADMIN
- [ ] `GET /api/bookings/{id}` — returns specific booking
- [ ] `PATCH /api/bookings/{id}/status` — Admin approves or rejects
- [ ] `PATCH /api/bookings/{id}/cancel` — User cancels approved booking
- [ ] `DELETE /api/bookings/{id}` — Admin deletes booking
- [ ] Conflict detection query implemented and tested
- [ ] `409 Conflict` returned when time overlaps
- [ ] Role-based access enforced on all endpoints
- [ ] All correct HTTP status codes applied
- [ ] Notification triggered after status change

### React Client
- [ ] `BookingForm.jsx` with date + time range picker
- [ ] `MyBookings.jsx` — user's booking list with status badges
- [ ] `AdminBookings.jsx` — admin view with filters (status, date, resource)
- [ ] `AdminApprovalPanel.jsx` — approve/reject with reason input field
- [ ] Cancel button visible only on APPROVED bookings
- [ ] Conflict error message displayed clearly on form
- [ ] `bookingService.js` — all Axios calls centralised
- [ ] Protected routes (only accessible when logged in)

### Version Control
- [ ] Work on a dedicated branch: `feature/booking-management`
- [ ] Commit progressively — at least a few commits per work session
- [ ] No single-day bulk commits
- [ ] Meaningful commit messages (e.g., `feat: add conflict detection query`)

---

## Tips for the Viva

- Be ready to explain the **conflict detection SQL/JPQL query** in detail
- Know your **status transition rules** — why a USER cannot approve their own booking
- Be able to explain every HTTP status code you used and why
- Show your **commit history** as proof of individual work
- Walk through the full booking flow live: create → approve → cancel

---

*End of Member 2 Instructions*