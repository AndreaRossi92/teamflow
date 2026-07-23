# 🏢 TeamFlow

> ⚠️ **Work in progress** — This project is currently under active development.

TeamFlow is a web platform for managing software development projects and tickets. It supports multi-role access control and includes an AI-powered feature to automatically generate structured tickets from customer requests.

---

## Current status

| Feature              | Status              |
| -------------------- | ------------------- |
| Login page           | ✅ Available        |
| AI ticket generation | ✅ Available        |
| Landing page         | 🚧 Work in progress |
| User management      | ✅ Available        |
| Projects             | ✅ Available        |
| Tickets              | ✅ Available        |

---

## Features

### User management

The platform requires authentication. Each user is assigned one of three roles:

| Role      | Description                                            |
| --------- | ------------------------------------------------------ |
| `ADMIN`   | Full access to the platform, including user management |
| `MANAGER` | Manages projects, tickets and team assignments         |
| `DEV`     | Views and updates their own assigned tickets           |

### Permissions

|                                  | ADMIN | MANAGER | DEV |
| -------------------------------- | :---: | :-----: | :-: |
| Create / edit / delete users     |  ✅   |   ❌    | ❌  |
| Assign roles to users            |  ✅   |   ❌    | ❌  |
| Create / edit / archive projects |  ✅   |   ✅    | ❌  |
| Assign projects to users         |  ✅   |   ✅    | ❌  |
| View own projects                |  ✅   |   ✅    | ❌  |
| Create / edit / close tickets    |  ✅   |   ✅    | ❌  |
| Assign tickets to users          |  ✅   |   ✅    | ❌  |
| View all tickets in a project    |  ✅   |   ✅    | ❌  |
| Generate tickets via AI          |  ✅   |   ✅    | ❌  |
| View own assigned tickets        |  ✅   |   ✅    | ✅  |
| Update status of own tickets     |  ✅   |   ✅    | ✅  |

### AI ticket generation

Managers can paste a customer email or message into the platform. TeamFlow analyses the text using AI and returns a structured ticket with a title, description and priority level — ready to be reviewed and saved.

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
| `GEMINI_API_KEY` | ✅ Yes   | Google AI API key                                                                                                        |
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

---

## License

MIT
