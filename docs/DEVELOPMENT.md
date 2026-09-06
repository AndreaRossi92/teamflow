# Development guide

This document contains everything you need to run TeamFlow locally and work on it as a contributor. For a general, non-technical overview of the project, see the [main README](../README.md).

Also see:

- [`GIT_CONVENTIONS.md`](GIT_CONVENTIONS.md) — branch/commit naming, issue and PR templates
- [`FRONTEND.md`](FRONTEND.md) — frontend architecture and components
- [`BACKEND.md`](BACKEND.md) — backend architecture

---

## Stack

| Layer           | Technology                   |
| --------------- | ---------------------------- |
| Frontend        | React 19, Vite, MUI Material |
| Backend         | NestJS, @dataui/crud         |
| AI              | Google Gemini 3 Flash        |
| DevOps          | Docker, Docker Compose       |
| Package manager | Yarn 4 (workspaces)          |

---

## Getting started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- A [Gemini API key](https://aistudio.google.com) (free)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/AndreaRossi92/teamflow.git
cd teamflow

# 2. Create your environment file and add your GEMINI_API_KEY
echo "GEMINI_API_KEY=your_api_key_here" > .env

# 3. Start all services
docker-compose up --build
```

### Services

| Service       | URL                   |
| ------------- | --------------------- |
| React web app | http://localhost:5173 |
| NestJS API    | http://localhost:3000 |

### Environment variables

Create a `.env` file in the project root. The following variables are available:

| Variable         | Required | Description                                                                                                              |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `GEMINI_API_KEY` | No       | Google AI API key (Can't use AI feature if not provided)                                                                 |
| `VITE_DEMO_MODE` | No       | Set to `true` to enable demo mode with mocked data (no backend required), or either `false` or leave empty to disable it |
| `VITE_THEME`     | No       | Force UI theme: `"light"` for light mode, `"dark"` for dark mode, or leave empty to follow OS preference                 |

---

## Default credentials

On first run, an `ADMIN` account is automatically created:

| Field    | Value              |
| -------- | ------------------ |
| Email    | admin@teamflow.com |
| Password | admin123           |

---

## Database seeding

### Admin user

On every startup, an `ADMIN` account is automatically created if it doesn't already exist (see [Default credentials](#default-credentials) above). This runs in every environment, including production, and is idempotent — if the admin already exists, it's skipped.

### Demo data (development/testing only)

To populate the database with a realistic set of demo users, projects and tickets — useful for manual testing or exploring the app "at scale" — a dedicated CLI script is available. It is **never** run automatically at startup, and it refuses to run when `NODE_ENV=production`.

```bash
# Generate demo data (25 users, 5 projects, 150 tickets by default)
docker-compose exec backend yarn seed:demo

# Customize the amount of data generated
docker-compose exec backend yarn seed:demo --users 50 --projects 10 --tickets 500
```

All generated demo users share the password `demo1234` and an email on the `@demo.local` domain.

### Clearing the database

To wipe all data (users, projects, tickets — including the admin account) and start from a clean slate:

```bash
docker-compose exec backend yarn clear:db
```

The script asks for interactive confirmation (type `y` or `yes`) before proceeding.

After clearing, restart the backend (or wait for the next boot) to have the `ADMIN` account recreated automatically. To clear and immediately repopulate with demo data:

```bash
docker-compose exec backend yarn reset:demo
```

> ⚠️ Both `seed:demo` and `clear:db` refuse to run when `NODE_ENV=production`, regardless of any flag passed to them.

---

## API documentation

All endpoints are documented via **Swagger UI**, available at `http://localhost:3000/api/docs` when the backend is running.
