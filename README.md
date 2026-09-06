# 🏢 TeamFlow

> ⚠️ **Work in progress** — This project is currently under active development.

TeamFlow is a web platform for managing software development projects and tickets. It supports multi-role access control and includes an AI-powered feature to automatically generate structured tickets from customer requests.

---

## Try the demo

A static demo version of the app (with mocked data, no backend required) is hosted on GitHub Pages:

**👉 [Live demo](https://andrearossi92.github.io/teamflow/)**

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

## Documentation

This README is meant to give a general overview of what TeamFlow does. If you're looking to run, contribute to, or dive deeper into the project, check out:

| Document                                             | Content                                                              |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)         | Tech stack, local setup, environment variables, DB seeding, API docs |
| [`docs/GIT_CONVENTIONS.md`](docs/GIT_CONVENTIONS.md) | Branch/commit naming conventions, issue and PR templates             |
| [`docs/FRONTEND.md`](docs/FRONTEND.md)               | Frontend architecture, components and usage guidelines               |
| [`docs/BACKEND.md`](docs/BACKEND.md)                 | Backend architecture and module overview                             |

---

## License

MIT
