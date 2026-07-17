# Project specification — Booking System

## 1. Purpose

Booking System manages services, professionals, customer accounts, and
appointments for a service business. It is designed as a portfolio project that
demonstrates business rules, time-based data, authentication, relational data,
testing, and deployment.

## 2. Core principle

A professional cannot have overlapping active bookings. The API calculates an
appointment's end time from the selected service duration and rejects a new
appointment when its time interval overlaps an existing pending or confirmed
booking for the same professional.

## 3. Roles

| Role | Permissions |
| --- | --- |
| `ADMIN` | Manage services, professionals, schedules, and all bookings. |
| `STAFF` | View their own schedule and update the status of their appointments. |
| `CUSTOMER` | View availability and create, view, or cancel their own bookings. |

## 4. Data model

### User

- `id`
- `name`
- `email` (unique)
- `passwordHash`
- `role`
- timestamps

### Service

- `id`
- `name`
- `description` (optional)
- `durationMinutes`
- `price`
- `isActive`
- timestamps

### Staff profile

- `id`
- user reference
- `isActive`
- timestamps

### Working schedule

- `id`
- staff profile reference
- day of week
- start time
- end time

### Booking

- `id`
- customer reference
- staff profile reference
- service reference
- `startAt`
- `endAt`
- status (`PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`)
- optional cancellation reason
- timestamps

## 5. Business rules

- A service duration must be greater than zero.
- A booking cannot start in the past.
- A booking must fit inside the professional's working schedule.
- A booking cannot overlap another pending or confirmed booking for the same
  professional.
- The API calculates `endAt`; clients do not send it.
- Customers can only see and modify their own bookings.
- Only administrators can create services, professionals, and work schedules.
- Cancellation does not delete a booking; it preserves the record and updates
  its status.

## 6. Version 1 endpoints

| Area | Endpoints |
| --- | --- |
| Authentication | Register, login, current user. |
| Services | Create, list, update, deactivate. |
| Professionals | Create, list, activate/deactivate, manage schedules. |
| Availability | Query available slots for a service, professional, and date. |
| Bookings | Create, list own bookings, get by ID, cancel, update status. |
| Administration | List all bookings with filters and pagination. |

## 7. Quality requirements

- PostgreSQL and Prisma migrations define the database schema.
- Every API input is validated before business logic.
- Critical overlap and permission rules have automated integration tests.
- Swagger documents all public endpoints.
- Docker Compose runs the application and database locally.
- GitHub Actions run typecheck, build, and tests on every push.
- The API is deployed publicly when version 1 is complete.

## 8. Not included in version 1

- Payments
- Calendar synchronisation (Google Calendar, Outlook)
- SMS notifications
- Multiple locations
- Recurring appointments

## 9. Definition of done

Version 1 is complete when customers can create valid bookings, administrators
can manage the catalogue and schedules, overlapping appointments are rejected,
and the system is tested, documented, containerised, and deployed.
