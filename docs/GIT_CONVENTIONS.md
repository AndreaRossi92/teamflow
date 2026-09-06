# Git conventions

This document describes how branches, commits, issues and pull requests should be named and structured in the TeamFlow repository. The goal is to keep history readable and make it easy to understand _what_ changed and _why_ at a glance.

> **Note on process:** the issue and PR templates below assume a development flow where issues are opened directly by senior, technical contributors who already know what needs to be built and roughly how — rather than, say, non-technical stakeholders filing bug reports. This project is used as a portfolio piece, so the conventions here are deliberately structured to demonstrate maintainer-level repository and workflow management practices, not just to document code changes.

---

## Commit messages

Commits follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Common types:

| Type       | Use for                                                        |
| ---------- | -------------------------------------------------------------- |
| `feat`     | A new feature                                                  |
| `fix`      | A bug fix                                                      |
| `docs`     | Documentation only changes                                     |
| `style`    | Formatting, missing semicolons, etc. — no code behavior change |
| `refactor` | Code change that neither fixes a bug nor adds a feature        |
| `perf`     | Performance improvement                                        |
| `test`     | Adding or correcting tests                                     |
| `build`    | Changes to build system or dependencies                        |
| `ci`       | Changes to CI configuration/scripts                            |
| `chore`    | Other changes that don't modify src or test files              |
| `revert`   | Reverts a previous commit                                      |

**Examples:**

```
feat(tickets): add AI-generated priority suggestion
fix(auth): correct redirect after login for MANAGER role
docs: split README into user-facing and developer docs
```

A `!` after the type/scope (e.g. `feat!:`) or a `BREAKING CHANGE:` footer indicates a breaking change.

---

## Branch naming

Every branch is created directly from its corresponding GitHub issue, using the branch name **suggested by default by GitHub** (via the "Create a branch" option on the issue page). This keeps branch names automatically and unambiguously linked to the issue they implement.

GitHub generates this name from the issue number and title, e.g.:

```
<issue-number>-<issue-title-slug>
```

**Examples:**

Issue `#42 – Add priority filter to tickets` → branch:

```
42-add-priority-filter-to-tickets
```

Issue `#57 – Fix login redirect for MANAGER role` → branch:

```
57-fix-login-redirect-for-manager-role
```

> Since every branch originates from an issue, make sure the issue title is clear and descriptive — it becomes the branch name.

---

## Issues

Every issue must contain (at least) two sections:

- **`## What`** — what needs to be developed/changed.
- **`## How`** — how it should be implemented (approach, technical notes, edge cases to handle).

Additional sections or subsections can be added when useful (e.g. `## Acceptance criteria`, `## References`).

A ready-to-use template is available in [`.github/ISSUE_TEMPLATE.md`](../.github/ISSUE_TEMPLATE.md), which GitHub will pre-fill automatically when opening a new issue.

### Example

```md
## What

Add the ability to filter tickets by priority in the project view.

## How

- Add a `priority` query param to `GET /projects/:id/tickets`.
- Add a `<Select>` filter (MUI) above the tickets table in `ProjectTicketsPage`.
- Update the `useTickets` hook to forward the selected priority to the API call.
- Default to "all priorities" when no filter is applied.
```

---

## Pull requests

Every PR must contain (at least) two sections:

- **`## What`** — a short summary of what was done and why.
- **`## Changes`** — the concrete changes made, file by file or area by area.

Additional sections or subsections can be added when useful (e.g. `## Screenshots`, `## Test`, `## Notes`).

At the end of the PR description, reference the issue it resolves using GitHub's closing keyword:

```
Closes #<ISSUE_NUMBER>
```

A ready-to-use template is available in [`.github/pull_request_template.md`](../.github/pull_request_template.md), which GitHub will pre-fill automatically when opening a new PR.

### Example

```md
## What

Adds priority filtering to the tickets list in the project view, as requested in #42.

## Changes

- `backend/src/tickets/tickets.controller.ts`: added optional `priority` query param to `GET /projects/:id/tickets`.
- `backend/src/tickets/tickets.service.ts`: applied the priority filter to the query.
- `frontend/src/pages/ProjectTicketsPage.tsx`: added a priority `<Select>` filter above the tickets table.
- `frontend/src/hooks/useTickets.ts`: forwarded the selected priority to the API call.

## Testing

- Manually verified filtering with each priority value and with no filter applied.
- Added a unit test for the new query param handling in `tickets.service.spec.ts`.

Closes #42
```
