# 🏢 TeamFlow

> ⚠️ **Work in progress** — This project is currently under active development.

TeamFlow is a web application that transforms free-form customer requests into structured tickets using AI.

---

## How it works

A manager pastes a customer email or message into the app. TeamFlow analyses the text and returns a structured ticket with a title, description, priority level, estimated effort, and relevant tags — ready to be reviewed and saved.

```
Customer email or message
          │
          ▼
    TeamFlow web app
          │
          ▼
    NestJS backend
          │
          ▼
  Gemini 3 Flash API
          │
          ▼
  Structured ticket
  ┌─────────────────────┐
  │ Title               │
  │ Description         │
  │ Priority   [ high ] │
  │ Estimate   [ 3d ]   │
  │ Tags                │
  └─────────────────────┘
```

---

## Architecture

```
teamflow/                          # Monorepo root
├── frontend/                      # React 19 SPA (Vite + MUI)
│   └── Dockerfile.dev
├── backend/                       # NestJS REST API
│   └── Dockerfile.dev
├── docker-compose.yml             # Local development
└── .env.example                   # Environment variables template
```

### System diagram

```
  Browser ──────────────▶ React SPA :5173
                               │
                               │ POST /api/ai/generate-ticket
                               ▼
                          NestJS API :3000
                               │
                               │ Gemini 3 Flash
                               ▼
                         Google AI API
```

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

- [Docker Desktop](https://www.docker.com/products/docker-desktop) _(recommended)_
- [Yarn 4](https://yarnpkg.com/getting-started/install) (`corepack enable`) _(without Docker)_
- A [Gemini API key](https://aistudio.google.com) (free)

### Option A — With Docker _(recommended)_

```bash
# 1. Clone the repository
git clone https://github.com/AndreaRossi92/teamflow.git
cd teamflow

# 2. Create your environment files
cp .env.example backend/.env
# Add your GEMINI_API_KEY to backend/.env

# 3. Start all services
docker-compose up --build
```

### Option B — Without Docker

```bash
# 1. Clone the repository
git clone https://github.com/AndreaRossi92/teamflow.git
cd teamflow

# 2. Install dependencies
yarn install

# 3. Create your environment files
cp .env.example backend/.env
# Add your GEMINI_API_KEY to backend/.env

# 4. Start frontend and backend
yarn dev
```

### Services

| Service       | URL                   |
| ------------- | --------------------- |
| React web app | http://localhost:5173 |
| NestJS API    | http://localhost:3000 |

### Environment variables

| Variable         | Location              | Description                                                                                   |
| ---------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| `GEMINI_API_KEY` | `backend/.env`        | Google AI API key (required)                                                                  |
| `VITE_THEME`     | `frontend/.env`       | Force UI theme: `light` or `dark`. Leave empty to follow OS preference                        |
| `VITE_API_URL`   | set by Docker Compose | API base URL. Defaults to `http://localhost:3000`, set to `http://backend:3000` inside Docker |

---

## API documentation

All endpoints are documented via **Swagger UI**, available at `http://localhost:3000/api/docs` when the backend is running.

---

## License

MIT
