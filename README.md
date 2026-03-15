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
  Gemini 1.5 Flash API
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
├── backend/                       # NestJS REST API
└── .env.example                   # Environment variables template
```

### System diagram

```
  Browser ──────────────▶ React SPA :5173
                               │
                               │ POST /ai/generate-ticket
                               ▼
                          NestJS API :3000
                               │
                               │ Gemini 1.5 Flash
                               ▼
                         Google AI API
```

---

## Stack

| Layer           | Technology                   |
| --------------- | ---------------------------- |
| Frontend        | React 19, Vite, MUI Material |
| Backend         | NestJS, @dataui/crud         |
| AI              | Google Gemini 1.5 Flash      |
| Package manager | Yarn 4 (workspaces)          |

---

## Getting started

### Prerequisites

- [Yarn 4](https://yarnpkg.com/getting-started/install) (`corepack enable`)
- A [Gemini API key](https://aistudio.google.com) (free)

### Local development

```bash
# 1. Clone the repository
git clone https://github.com/tuo-username/teamflow.git
cd teamflow

# 2. Install dependencies
yarn install

# 3. Create your environment file
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# 4. Start frontend and backend
yarn dev
```

| Service       | URL                   |
| ------------- | --------------------- |
| React web app | http://localhost:5173 |
| NestJS API    | http://localhost:3000 |

---

## License

MIT
