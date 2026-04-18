# Booking Management System - Testing Guide

## Prerequisites
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:5173`
- MongoDB running
- User authenticated with JWT token

## API Testing with cURL/Postman

### 1. Create a Booking
```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "resource-id-here",
    "date": "2024-04-20",
    "startTime": "10:00",
    "endTime": "11:00",
    "purpose": "Team meeting",
    "expectedAttendees": 10
  }'
```
**Expected:** 201 Created

### 2. Get My Bookings
```bash
curl http://localhost:8080/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200 OK, list of user's bookings

### 3. Get All Bookings (Admin Only)
```bash
curl http://localhost:8080/api/bookings \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
**Expected:** 200 OK, all bookings

### 4. Filter Bookings (Admin)
```bash
curl "http://localhost:8080/api/bookings?status=PENDING&resourceId=123&date=2024-04-20" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
**Expected:** 200 OK, filtered list

### 5. Get Specific Booking
```bash
curl http://localhost:8080/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 200 OK or 403 if not owner

### 6. Approve Booking (Admin Only)
```bash
curl -X PATCH http://localhost:8080/api/bookings/BOOKING_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED"
  }'
```
**Expected:** 200 OK

### 7. Reject Booking (Admin Only)
```bash
curl -X PATCH http://localhost:8080/api/bookings/BOOKING_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "reason": "Resource not available"
  }'
```
**Expected:** 200 OK

### 8. Cancel Booking (User)
```bash
curl -X PATCH http://localhost:8080/api/bookings/BOOKING_ID/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Expected:** 204 No Content

### 9. Delete Booking (Admin Only)
```bash
curl -X DELETE http://localhost:8080/api/bookings/BOOKING_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```
**Expected:** 204 No Content

## Conflict Detection Test Cases

### Case 1: Back-to-back Bookings (Should NOT conflict)
```
Booking 1: 10:00 - 11:00
Booking 2: 11:00 - 12:00
Result: ✅ Should be allowed
```

### Case 2: Overlapping Bookings (Should conflict)
```
Booking 1: 10:00 - 12:00
Booking 2: 11:00 - 13:00
Result: ❌ Should return 409 Conflict
```

### Case 3: Same Start Time (Should conflict)
```
Booking 1: 10:00 - 11:00 (APPROVED)
Booking 2: 10:00 - 12:00 (Creating)
Result: ❌ Should return 409 Conflict
```

### Case 4: Full Overlap (Should conflict)
```
Booking 1: 10:00 - 13:00 (APPROVED)
Booking 2: 11:00 - 12:00 (Creating)
Result: ❌ Should return 409 Conflict
```

## Status Code Validation

| Scenario | Expected Code |
|----------|--------------|
| Create booking successfully | 201 |
| Get bookings | 200 |
| Scheduling conflict | 409 |
| Missing required field | 400 |
| Not authenticated | 401 |
| User views another user's booking | 403 |
| User tries to approve booking | 403 |
| Delete with user role | 403 |
| Booking not found | 404 |
| Cancel pending booking | 400 |
| Delete successful | 204 |

## React UI Testing

### My Bookings Page (`/hub/bookings`)
- [ ] User sees only their own bookings
- [ ] Can create new booking (form validation works)
- [ ] See status badges (PENDING/APPROVED/REJECTED/CANCELLED)
- [ ] Sees conflict error message
- [ ] Can cancel APPROVED bookings
- [ ] Stats show correct counts
- [ ] Date and time pickers work correctly

### Admin Bookings Page (`/hub/admin/bookings`)
- [ ] Admin sees all bookings
- [ ] Filters work (status, resource, date)
- [ ] Can review pending bookings
- [ ] Approve button works
- [ ] Reject button requires reason
- [ ] Rejection reason field shows/hides properly
- [ ] Notifications show after actions
- [ ] Status counts are accurate

### Booking Form
- [ ] Date validation (future dates only)
- [ ] Time validation (start < end)
- [ ] Attendees minimum 1
- [ ] All fields required (show error if missing)
- [ ] Success message after creation
- [ ] Form clears after submission
- [ ] Conflict error shown clearly

## Authentication & Authorization
- [ ] Unauthenticated user → 401 redirects to login
- [ ] Admin-only endpoints reject regular users (403)
- [ ] Users cannot see other users' bookings
- [ ] SecurityConfig rules enforced

## Notification Testing
- [ ] Notification created when booking approved
- [ ] Notification created when booking rejected
- [ ] Notification created when booking cancelled
- [ ] Message includes relevant details (resource name, status)
- [ ] Rejection reason included in notification

## Database Verification (MongoDB)

Check collections:
```javascript
// View all bookings
db.bookings.find()

// Check conflict detection works
db.bookings.find({
  resource: ObjectId("..."),
  date: ISODate("2024-04-20"),
  status: "APPROVED"
})

// View notifications
db.notifications.find().sort({createdAt: -1}).limit(10)
```

## Performance Checks
- [ ] Conflict query performs well (creates index on resource, date, status)
- [ ] Filter query with date/time picker is responsive
- [ ] UI updates immediately after actions
- [ ] No n+1 queries in logs

## Edge Cases
- [ ] Very long purpose text
- [ ] Large attendee numbers
- [ ] Booking far in future
- [ ] Multiple concurrent bookings by different users
- [ ] Rapid approve/reject actions
- [ ] Cancel after approval but before another approval
