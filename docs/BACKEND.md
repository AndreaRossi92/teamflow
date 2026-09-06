# TeamFlow API — Backend Documentation

TeamFlow is a REST backend for managing projects, tickets, and users, built with **NestJS** and **TypeORM** (PostgreSQL), using **JWT authentication via httpOnly cookies**.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Setup and Configuration](#setup-and-configuration)
4. [Authentication and Security](#authentication-and-security)
5. [Roles and Permissions (RBAC)](#roles-and-permissions-rbac)
6. [Data Model](#data-model)
7. [Application Modules](#application-modules)
   - [Auth](#auth-module)
   - [Users](#users-module)
   - [Projects](#projects-module)
   - [Tickets](#tickets-module)
   - [AI](#ai-module)
   - [Seed](#seed-module)
8. [Pagination](#pagination)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)
11. [CLI Scripts (seed / clear)](#cli-scripts-seed--clear)

---

## Tech Stack

| Component         | Technology                                  |
| ----------------- | ------------------------------------------- |
| Framework         | NestJS                                      |
| ORM               | TypeORM (PostgreSQL)                        |
| Authentication    | Passport + `@nestjs/jwt`, httpOnly cookies  |
| Validation        | `class-validator` / `class-transformer`     |
| API Documentation | Swagger (`@nestjs/swagger`) at `/api/docs`  |
| Rate limiting     | `@nestjs/throttler`                         |
| Password hashing  | `bcrypt`                                    |
| AI                | Google GenAI (Gemini) for ticket generation |
| Demo data seeding | `@faker-js/faker`                           |

---

## Project Structure

The app is organized by **feature module**, following standard NestJS conventions:

```
src/
├── app.module.ts              # Root module, DB and Throttler configuration
├── app-error.codes.ts         # Centralized enum of error codes
├── paginated-response.dto.ts  # Generic factory for paginated responses
├── main.ts                    # Application bootstrap
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── refresh-token.entity.ts
│   ├── token-cleanup.service.ts
│   ├── strategies/jwt.strategy.ts
│   ├── guards/jwt.guard.ts
│   ├── guards/jwt-refresh.guard.ts
│   ├── guards/roles.guard.ts
│   ├── decorators/auth.decorators.ts
│   └── dto/ (login, change-password)
│
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── user.entity.ts
│   └── dto/ (create, update, list, reset-password, user-dashboard)
│
├── projects/
│   ├── project.module.ts
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   ├── project.entity.ts
│   └── dto/ (create, update, list, assign-users, project-dashboard, ...)
│
├── tickets/
│   ├── tickets.module.ts
│   ├── tickets.controller.ts
│   ├── tickets.service.ts
│   ├── ticket.entity.ts
│   └── dto/ (create, update, update-status, assign-users, list, ...)
│
├── ai/
│   ├── ai.module.ts
│   ├── ai.controller.ts
│   ├── ai.service.ts
│   └── ai.prompts.ts
│
└── seed/
    ├── seed.module.ts
    ├── seed.service.ts
    ├── seeders/admin-user.seeder.ts
    ├── seeders/demo-data.seeder.ts
    ├── seeders/clear-data.seeder.ts
    └── cli/demo.ts, cli/clear.ts
```

---

## Setup and Configuration

The bootstrap (`main.ts`) configures:

- **Cookie parser** (`cookie-parser`) to read authentication cookies.
- **CORS** with `credentials: true`, origin configurable via `CORS_ORIGIN` (default `http://localhost:5173`).
- **Global ValidationPipe** with `whitelist: true` and `forbidNonWhitelisted: true` (DTOs strip/reject any undeclared field).
- **Swagger**, exposed at `/api/docs`, authenticated via cookie (`addCookieAuth`).
- Listens on port **3000**.

### Main environment variables

| Variable          | Default                 | Purpose                                 |
| ----------------- | ----------------------- | --------------------------------------- |
| `DB_HOST`         | `localhost`             | PostgreSQL host                         |
| `DB_PORT`         | `5432`                  | PostgreSQL port                         |
| `DB_USERNAME`     | `teamflow`              | DB user                                 |
| `DB_PASSWORD`     | `teamflow`              | DB password                             |
| `DB_NAME`         | `teamflow`              | Database name                           |
| `JWT_SECRET`      | `dev-secret`            | Access token signing key                |
| `CORS_ORIGIN`     | `http://localhost:5173` | Allowed CORS origin                     |
| `GEMINI_API_KEY`  | —                       | API key for the AI module               |
| `ADMIN_EMAIL`     | `admin@teamflow.com`    | Email of the admin created at bootstrap |
| `ADMIN_PASSWORD`  | `admin123`              | Initial admin password                  |
| `ADMIN_FULL_NAME` | `Admin`                 | Admin display name                      |
| `NODE_ENV`        | `development`           | Blocks seed/clear scripts in production |

> ⚠️ TypeORM's `synchronize: true` is enabled: fine for development, **should be disabled in production** in favor of explicit migrations.

---

## Authentication and Security

Authentication is based on **access/refresh JWT token pairs**, carried via **httpOnly cookies** rather than an `Authorization` header.

### Login flow

1. `POST /auth/login` with `{ email, password }` (protected by `ThrottlerGuard`).
2. `AuthService.login` looks up the user by email and compares the password with `bcrypt.compare`.
   - To **mitigate timing attacks**, `bcrypt.compare` is always executed, even if the user doesn't exist (using a precomputed "dummy" hash, `DUMMY_HASH`).
   - If the user doesn't exist, is inactive, or the password doesn't match, the **same** `UnauthorizedException(INVALID_CREDENTIALS)` is thrown in every case, so the client can't tell which condition failed.
3. On valid credentials, `issueTokens` generates:
   - a signed **access token JWT** (payload: `sub`, `email`, `role`, `fullName`), expiring in **15 minutes**;
   - an **opaque random refresh token** (`crypto.randomBytes(64)`), of which only the **SHA-256 hash** is persisted in the `refresh_tokens` table, expiring in **7 days**.
4. Both tokens are set as httpOnly cookies by the controller:

   | Cookie          | Duration | Path        | Notes                                              |
   | --------------- | -------- | ----------- | -------------------------------------------------- |
   | `access_token`  | 15 min   | `/`         | read by `JwtStrategy`                              |
   | `refresh_token` | 7 days   | `/api/auth` | read by `JwtRefreshGuard`, scoped to the auth path |

   Both cookies are `httpOnly`, `sameSite: strict`, and `secure` in production (`NODE_ENV === 'production'`).

### Refresh token rotation

`POST /auth/refresh` (guarded by `JwtRefreshGuard`, which extracts the `refresh_token` cookie):

- The raw token is hashed and used in an **atomic DELETE** (`createQueryBuilder().delete().where('tokenHash = :hash AND expiresAt > :now').returning(['userId'])`).
- This guarantees that **a refresh token can only be consumed once**: if two concurrent requests try to refresh with the same token, only one gets `affected = 1`; the other receives `401 INVALID_OR_EXPIRED_REFRESH_TOKEN` — a protection against replay attacks.
- If the delete succeeds, the associated user is reloaded and, if active, a new token pair is issued (full rotation).

### Logout

`POST /auth/logout` deletes the matching refresh token (by hash) from the DB and clears the client-side cookies.

### Password change

`POST /auth/change-password` (guarded by `JwtGuard`):

- Verifies the current password with `bcrypt.compare`.
- Updates the password, **deletes all of the user's refresh tokens** (invalidating every other active session), and issues a fresh token pair for the current session.

### Admin-triggered password reset

`PATCH /users/:id/reset-password` (ADMIN only): sets a new password and calls `authService.revokeAllUserSessions(id)`, which deletes all of that user's refresh tokens, forcing a logout everywhere.

### Automatic cleanup of expired tokens

`TokenCleanupService` runs a **daily cron job at midnight** (`@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`) that deletes every row in `refresh_tokens` with `expiresAt < now`.

### Authentication guards

| Guard             | Purpose                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `JwtGuard`        | Extends `AuthGuard('jwt')`; validates the access token read from the `access_token` cookie via `JwtStrategy`. |
| `JwtRefreshGuard` | Manually extracts the `refresh_token` cookie; throws `401 REFRESH_TOKEN_MISSING` if absent.                   |
| `RolesGuard`      | Reads the metadata set by `@Roles(...)` and checks whether `request.user.role` is among the allowed ones.     |

---

## Roles and Permissions (RBAC)

Three roles are defined in the `Role` enum (on `User`):

- **ADMIN** — full access to all resources.
- **MANAGER** — manages the projects/tickets they are a member of.
- **DEV** — limited access to tickets assigned to them and projects they belong to.

Role checks are performed through the `@Roles(...)` decorator combined with `RolesGuard`, applied either at the controller level or on individual routes.

### Core visibility rules

- **Projects**: ADMIN sees all projects; MANAGER and DEV only see projects they are `members` of.
- **Tickets**: ADMIN sees all tickets; MANAGER sees tickets belonging to projects they're a member of; DEV only sees tickets assigned to them.
- **Editing/creating tickets or projects**: requires at least the MANAGER role (DEVs can only update the _status_ of tickets assigned to them).
- **User management** (`/users`): entirely restricted to ADMIN, except `GET /users/me/workload` (visible to all authenticated roles) and `GET /users/breakdown`.

---

## Data Model

### `User`

| Field                 | Type    | Notes                          |
| --------------------- | ------- | ------------------------------ |
| id                    | uuid    | PK                             |
| email                 | string  | unique                         |
| fullName              | string  |                                |
| passwordHash          | string  | never exposed in API responses |
| role                  | enum    | `admin` \| `manager` \| `dev`  |
| isActive              | boolean | default `true`                 |
| createdAt / updatedAt | Date    |                                |

### `RefreshToken`

| Field         | Type     | Notes                                      |
| ------------- | -------- | ------------------------------------------ |
| id            | uuid     | PK                                         |
| tokenHash     | string   | SHA-256 of the raw token, indexed          |
| user / userId | relation | `ManyToOne` to `User`, `onDelete: CASCADE` |
| expiresAt     | Date     |                                            |
| createdAt     | Date     |                                            |

### `Project`

| Field       | Type                                             | Notes          |
| ----------- | ------------------------------------------------ | -------------- |
| id          | uuid                                             | PK             |
| name        | string                                           |                |
| description | string \| null                                   |                |
| isActive    | boolean                                          | default `true` |
| createdBy   | `ManyToOne User`                                 |                |
| members     | `ManyToMany User` (join table `project_members`) |                |

### `Ticket`

| Field                 | Type                                              | Notes                                            |
| --------------------- | ------------------------------------------------- | ------------------------------------------------ |
| id                    | uuid                                              | PK                                               |
| title                 | string                                            |                                                  |
| description           | string \| null                                    |                                                  |
| status                | enum                                              | `open` \| `inProgress` \| `resolved` \| `closed` |
| priority              | enum                                              | `low` \| `medium` \| `high`                      |
| project               | `ManyToOne Project`                               |                                                  |
| createdBy             | `ManyToOne User`                                  |                                                  |
| assignees             | `ManyToMany User` (join table `ticket_assignees`) |                                                  |
| createdAt / updatedAt | Date                                              |                                                  |

**Relevant many-to-many relations**: `project_members` (Project ↔ User) and `ticket_assignees` (Ticket ↔ User), used throughout several aggregate queries to compute "workload" dashboards.

---

## Application Modules

### Auth Module

Routes (`/auth`, no controller-wide guard):

| Method | Route                   | Guard             | Description                                 |
| ------ | ----------------------- | ----------------- | ------------------------------------------- |
| POST   | `/auth/login`           | `ThrottlerGuard`  | Login, sets access/refresh cookies          |
| POST   | `/auth/refresh`         | `JwtRefreshGuard` | Rotates the token pair                      |
| POST   | `/auth/logout`          | —                 | Revokes the current refresh token           |
| POST   | `/auth/change-password` | `JwtGuard`        | Changes password and revokes other sessions |

### Users Module

Routes (`/users`, globally guarded by `JwtGuard, RolesGuard` + `@Roles(ADMIN)`, with a few exceptions):

| Method | Route                       | Allowed roles       | Description                                                  |
| ------ | --------------------------- | ------------------- | ------------------------------------------------------------ |
| GET    | `/users`                    | ADMIN               | Paginated list, filterable by `fullName`, `role`, `isActive` |
| GET    | `/users/me/workload`        | ADMIN, MANAGER, DEV | Workload (tickets by status/priority) for the logged-in user |
| GET    | `/users/breakdown`          | ADMIN               | Active/inactive user counts per role                         |
| GET    | `/users/:id`                | ADMIN               | User detail                                                  |
| POST   | `/users`                    | ADMIN               | Creates a user (password hashed with bcrypt, 10 rounds)      |
| PATCH  | `/users/:id`                | ADMIN               | Updates user data                                            |
| PATCH  | `/users/:id/deactivate`     | ADMIN               | Deactivates (error if already inactive)                      |
| PATCH  | `/users/:id/reactivate`     | ADMIN               | Reactivates (error if already active)                        |
| PATCH  | `/users/:id/reset-password` | ADMIN               | Resets password + revokes all of the user's sessions         |
| DELETE | `/users/:id`                | ADMIN               | Hard-delete, **only if the user is already inactive**        |

The service also implements `getUsersWorkload()` (aggregated workload for all active users) and `getUsersBreakdown()` (counts per role/status), via grouped queries against `ticket_assignees`.

### Projects Module

Routes (`/projects`, global `JwtGuard`):

| Method | Route                            | Allowed roles            | Description                                                           |
| ------ | -------------------------------- | ------------------------ | --------------------------------------------------------------------- |
| GET    | `/projects`                      | all                      | Paginated list: ADMIN sees everything, others only their own projects |
| GET    | `/projects/workload`             | all                      | Tickets per project grouped by status/priority                        |
| GET    | `/projects/members-workload`     | ADMIN, MANAGER           | Workload of members across visible projects                           |
| GET    | `/projects/:id`                  | all (membership checked) | Project detail                                                        |
| POST   | `/projects`                      | ADMIN, MANAGER           | Creates a project (creator auto-added as member)                      |
| PATCH  | `/projects/:id`                  | ADMIN, MANAGER           | Updates (membership required if not admin)                            |
| PATCH  | `/projects/:id/assign`           | ADMIN, MANAGER           | Replaces the entire member list                                       |
| GET    | `/projects/:id/assignable-users` | ADMIN, MANAGER           | Active users with an `isMember` flag                                  |
| PATCH  | `/projects/:id/deactivate`       | ADMIN, MANAGER           | Deactivates (error if already inactive)                               |
| PATCH  | `/projects/:id/reactivate`       | ADMIN, MANAGER           | Reactivates (error if already active)                                 |
| DELETE | `/projects/:id`                  | ADMIN, MANAGER           | Hard-delete, only if already inactive                                 |

> Note: the `/projects/workload` and `/projects/members-workload` routes are declared **before** the `/projects/:id` route so Express doesn't try to match "workload" as a UUID.

### Tickets Module

Routes (`/tickets`, global `JwtGuard`):

| Method | Route                           | Allowed roles        | Description                                                                                                                                                   |
| ------ | ------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/tickets`                      | all                  | Paginated list, scoped by role (admin: all; manager: by project; dev: assigned only) + filters (`title`, `status`, `priority`, `projectName`, `assignedToMe`) |
| GET    | `/tickets/:id`                  | all (access checked) | Ticket detail                                                                                                                                                 |
| POST   | `/tickets`                      | ADMIN, MANAGER       | Creates a ticket with status `OPEN`, creator auto-assigned                                                                                                    |
| PATCH  | `/tickets/:id`                  | ADMIN, MANAGER       | Updates; if the project changes, assignees are reset to the requester                                                                                         |
| PATCH  | `/tickets/:id/status`           | all (access checked) | A DEV can do this only if they are among the assignees                                                                                                        |
| PATCH  | `/tickets/:id/assign`           | ADMIN, MANAGER       | Replaces the assignee list (must be project members)                                                                                                          |
| GET    | `/tickets/:id/assignable-users` | ADMIN, MANAGER       | Project members with an `isMember` (assigned/not assigned) flag                                                                                               |
| DELETE | `/tickets/:id`                  | ADMIN, MANAGER       | Deletes the ticket                                                                                                                                            |

Manager/dev access control always goes through `findTicketWithAccess`, which verifies the user's membership in the ticket's project and, if required, that the role is at least MANAGER.

### AI Module

`POST /ai/generate-ticket` (ADMIN only): given a free-text customer request (`customerRequest`) and a language (BCP 47), it uses **Google Gemini** (`gemini-3-flash-preview`) to generate a structured ticket `{ title, description, priority }`, validated with a **Zod** schema.

- If `GEMINI_API_KEY` is not configured → `GEMINI_API_KEY_NOT_DEFINED` error.
- If the model's response is empty → `GEMINI_EMPTY_RESPONSE` error.
- The Gemini client is instantiated **lazily** and reused across calls.

### Seed Module

- `AdminUserSeeder`: runs automatically at app startup (`OnApplicationBootstrap`), creating the default admin user if it doesn't already exist.
- `DemoDataSeeder`: generates fake data (users, projects, tickets) with `faker`, runnable from the command line.
- `ClearDataSeeder`: performs a `TRUNCATE ... RESTART IDENTITY CASCADE` on all application tables.
- Both destructive seeders **refuse to run if `NODE_ENV=production`**.

---

## Pagination

Every list endpoint (users, projects, tickets) shares the same response shape via `Paginated<T>` / `PaginatedResponseDto`:

```json
{
  "data": [
    /* ... */
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "hasNextPage": true
}
```

The `page` (default 1) and `limit` (default 20) parameters are validated and coerced to integers via `class-transformer`.

---

## Error Handling

All application error messages are defined as constant strings in `app-error.codes.ts` (e.g. `USER_NOT_FOUND`, `PROJECT_ACCESS_DENIED`, `INVALID_CREDENTIALS`, `TICKET_NOT_FOUND`, etc.) and passed as the message to standard NestJS HTTP exceptions (`NotFoundException`, `ForbiddenException`, `BadRequestException`, `ConflictException`, `UnauthorizedException`). This makes errors easy to catch and translate client-side using a stable code instead of free-form text.

---

## Rate Limiting

Configured globally in `AppModule` via `ThrottlerModule` with three cumulative windows:

| Name     | Window     | Max requests |
| -------- | ---------- | ------------ |
| `short`  | 10 seconds | 3            |
| `medium` | 60 seconds | 5            |
| `long`   | 1 hour     | 15           |

`ThrottlerGuard` is explicitly applied to the `/auth/login` route to mitigate brute-force attacks on credentials.

---

## CLI Scripts (seed / clear)

Two standalone entry points, built on `NestFactory.createApplicationContext`:

- **`demo.ts`** — populates the database with demo data:
  ```bash
  node demo.js --users 25 --projects 5 --tickets 150
  ```
- **`clear.ts`** — asks for interactive terminal confirmation, then truncates all application tables:
  ```bash
  node clear.js
  ```

Both scripts abort if `NODE_ENV=production`.
