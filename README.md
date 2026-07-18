# Booking System API

A REST API for service businesses such as salons, barbershops and clinics. It manages accounts, staff schedules, services and customer bookings while preventing schedule conflicts.

## Highlights

- Role-based access control: `ADMIN`, `STAFF` and `CUSTOMER`.
- JWT authentication and bcrypt password hashing.
- Admin service management.
- Staff accounts with weekly working schedules.
- Customer bookings with automatic end-time calculation.
- Validation that a booking is in the future, inside working hours and does not overlap an active booking.
- PostgreSQL transaction with serializable isolation for booking creation.
- Interactive Swagger/OpenAPI documentation.

## Tech stack

- Node.js + TypeScript
- Express 5
- PostgreSQL 17
- Prisma ORM
- Zod
- JWT + bcrypt
- Docker Compose
- Swagger/OpenAPI

## API documentation

With the server running locally, open:

- [Swagger UI](http://localhost:3002/docs)
- [Health check](http://localhost:3002/health)

## Quick start

### 1. Configure environment variables

```powershell
Copy-Item .env.example .env
```

### 2. Start PostgreSQL

```powershell
docker compose up -d
```

### 3. Install dependencies and prepare the database

```powershell
npm install
npm run prisma:migrate -- --name init
```

### 4. Run the API

```powershell
npm run dev
```

The API starts at `http://localhost:3002`.

## Main endpoints

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Public | Register an account |
| `POST` | `/api/v1/auth/login` | Public | Log in and receive a JWT |
| `GET` | `/api/v1/services` | Public | List active services |
| `POST` | `/api/v1/services` | Admin | Create a service |
| `GET` | `/api/v1/staff` | Public | List active staff and schedules |
| `POST` | `/api/v1/staff` | Admin | Create a staff account |
| `PUT` | `/api/v1/staff/:staffProfileId/schedule` | Admin | Set a working schedule |
| `POST` | `/api/v1/bookings` | Customer | Create a conflict-safe booking |
| `GET` | `/api/v1/bookings/me` | Customer | List own bookings |
| `PATCH` | `/api/v1/bookings/:bookingId/cancel` | Customer | Cancel own booking |

## Booking rule

For each new booking, the API calculates the end time from the service duration and rejects requests when:

1. the staff member or service is inactive or missing;
2. the requested time falls outside the staff schedule;
3. the booking overlaps a `PENDING` or `CONFIRMED` booking for that staff member.

## Commands

```powershell
npm run dev
npm run build
npm run typecheck
npm run prisma:generate
npm run prisma:migrate
docker compose up -d
```

## Project status

Core API complete. Next steps include automated tests, Dockerising the API service, CI/CD and public deployment.

See the [project specification](docs/project-specification.md) for the original scope.
