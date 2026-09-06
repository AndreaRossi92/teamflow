# TeamFlow — Frontend Documentation

TeamFlow is a project/ticket management web application built with **React**, **TypeScript**, **Material UI (MUI)**, **React Router**, **TanStack Query**, and **react-hook-form + zod**. This document describes the project structure, the main architectural building blocks, and how to use the shared components and hooks.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Application Bootstrap](#application-bootstrap)
4. [Routing](#routing)
5. [Authentication](#authentication)
6. [Theming](#theming)
7. [Internationalization (i18n)](#internationalization-i18n)
8. [Forms](#forms)
9. [Data Fetching (TanStack Query)](#data-fetching-tanstack-query)
10. [Demo Mode & Mock API (MSW)](#demo-mode--mock-api-msw)
11. [Shared Components](#shared-components)
12. [Feature Modules](#feature-modules)
13. [Testing](#testing)
14. [Environment Variables](#environment-variables)

---

## Tech Stack

| Concern              | Library                                                                     |
| -------------------- | --------------------------------------------------------------------------- |
| UI framework         | React + TypeScript                                                          |
| Component library    | Material UI (MUI) (`@mui/material`, `@mui/icons-material`, `@mui/x-charts`) |
| Routing              | `react-router-dom`                                                          |
| Server state         | `@tanstack/react-query` (+ `@tanstack/react-virtual` for virtualized lists) |
| HTTP client          | `axios`                                                                     |
| Forms                | `react-hook-form` + `zod` (via `@hookform/resolvers/zod`)                   |
| i18n                 | `i18next`, `react-i18next`, `i18next-browser-languagedetector`              |
| Mock API (demo mode) | `msw` (Mock Service Worker)                                                 |
| Testing              | `vitest`, `@testing-library/react`, `@testing-library/user-event`           |
| Utilities            | `lodash`, `use-debounce`                                                    |

---

## Project Structure

The project follows a **feature-based** organization. Cross-cutting concerns (components, hooks, providers, types, formatters) live at the top level, while each business domain (`auth`, `user`, `project`, `ticket`, `ai`) is self-contained under `src/features`.

```
src/
├── App.tsx                      # Root component: providers + router
├── main.tsx                     # Entry point, bootstraps demo mode (MSW) then renders <App/>
├── theme.ts                     # MUI theme factory (light/dark, custom palette colors)
├── i18n/
│   ├── index.ts                 # i18next setup, resource registration
│   └── locales/{en,it}/*.json   # Translation namespaces: common, auth, user, project, ticket, dashboard, errors
├── types/
│   └── paginatedResponse.ts     # Generic PaginatedResponse<T> type used by all list APIs
├── formatters/
│   └── date.ts                  # formatDateTime helper
├── api/
│   └── axios.instance.ts        # Shared axios instance (baseURL "/api", withCredentials)
├── router/
│   └── AppRoutes.tsx             # All route definitions, lazily loaded pages
├── providers/
│   ├── Auth.Context.ts          # AuthContext definition
│   ├── AuthProvider.tsx         # Auth state, session bootstrap, 401 interceptor wiring
│   ├── refreshCoordinator.ts    # Deduplicates/queues concurrent token-refresh calls
│   ├── setupAuthInterceptor.ts  # Axios response interceptor: auto-refresh & retry on 401
│   ├── Snackbar.Context.ts      # SnackbarContext definition
│   ├── SnackbarProvider.tsx     # Global toast/snackbar provider
│   ├── useAuth.ts               # useAuth() hook
│   └── useSnackbar.ts           # useSnackbar() hook
├── hooks/
│   ├── useCustomForm.ts         # react-hook-form wrapper pre-wired with zodResolver
│   └── useZodLocale.ts          # Wires zod error messages to i18next translations
├── components/                  # Shared, feature-agnostic UI components (see below)
├── pages/
│   ├── DashboardPage.tsx
│   └── NotFoundPage.tsx
├── mocks/                       # MSW mock backend used in demo mode
│   ├── browser.ts               # Registers all MSW handlers
│   ├── data/                    # In-memory mock datasets (users, projects, tickets, auth, dashboard, ai, http errors)
│   └── handlers/                # MSW request handlers per domain (+ guards.ts for auth/role checks)
└── features/
    ├── auth/                    # Login, change password, session types & API
    ├── user/                    # User CRUD, roles, dashboard
    ├── project/                 # Project CRUD, member assignment, dashboard
    ├── ticket/                  # Ticket CRUD, status, assignment, dashboard
    └── ai/                      # AI-assisted ticket generation
```

Each feature module follows the same internal layout:

```
features/<feature>/
├── api.ts                # HTTP calls for the feature (uses the shared axios instance)
├── components/           # Feature-specific presentational components
├── forms/                # react-hook-form field groups
├── hooks/                # useXQuery / useXMutation hooks (TanStack Query wrappers)
├── pages/                # Route-level page components
└── types/                # Domain types + zod schemas (…Form.ts)
```

---

## Application Bootstrap

### `main.tsx`

The entry point conditionally starts the **MSW** mock worker when `VITE_DEMO_MODE=true`, then mounts `<App />`:

```tsx
async function bootstrap() {
  if (import.meta.env.VITE_DEMO_MODE === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
```

### `App.tsx`

Wraps the app in the provider stack, in this precise order (outer → inner):

```
<ThemeProvider>
  <SnackbarProvider>
    <QueryClientProvider>
      <AuthProvider>
        <Suspense fallback={<PageLoader/>}>
          <BrowserRouter>
            <AppContent />     {/* Header + <AppRoutes/> */}
          </BrowserRouter>
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  </SnackbarProvider>
</ThemeProvider>
```

`useZodLocale()` is called once here to keep zod validation messages translated.

---

## Routing

Routes are declared in `router/AppRoutes.tsx` and are **lazy-loaded** via a `lazyWithLoader` helper that wraps every page in `<Suspense fallback={<PageLoader/>}>`.

Access control is enforced with `<ProtectedRoute allowedRoles={...}>`, which:

- Redirects to `/login` if the user is not authenticated.
- Redirects to `/not-found` if the user's role isn't in `allowedRoles`.

| Path                                                                                                              | Roles              | Page                         |
| ----------------------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------- |
| `/login`                                                                                                          | public             | LoginPage                    |
| `/`                                                                                                               | any authenticated  | DashboardPage                |
| `/change-password`                                                                                                | any authenticated  | ChangePasswordPage           |
| `/projects`, `/project/:id`, `/tickets`, `/ticket/:id`, `/ticket/:id/edit`                                        | any authenticated  | list/detail/edit pages       |
| `/users`, `/user/create`, `/user/:id`, `/user/:id/edit`, `/user/:id/reset-password`                               | `admin`            | user management              |
| `/project/create`, `/project/:id/edit`, `/project/:id/assign-users`, `/ticket/create`, `/ticket/:id/assign-users` | `admin`, `manager` | create/edit/assignment pages |
| `*`                                                                                                               | public             | NotFoundPage                 |

Roles are: `"admin" | "manager" | "dev"`.

---

## Authentication

Authentication state lives in `AuthProvider` (`providers/AuthProvider.tsx`) and is exposed through the `useAuth()` hook.

```tsx
const { user, setUser, isAuthenticated } = useAuth();
```

### Session bootstrap

On mount, `AuthProvider` calls `refreshCoordinator.refresh()` to attempt a silent session restore (`POST /auth/refresh`). While this resolves, the provider renders `null` (no flash of the login page). In demo mode this step is skipped.

### Automatic token refresh (401 handling)

`setupAuthInterceptor(api, { onRefreshSuccess, onRefreshFailure })` registers an axios response interceptor that:

1. Ignores non-401 errors and 401s on `/auth/refresh`, `/auth/login`, `/auth/logout` (to avoid infinite loops).
2. On a 401, if a refresh is already in flight, **queues** the failed request via `refreshCoordinator.enqueue()` and retries it once the in-flight refresh resolves.
3. Otherwise, marks the request `_retry`, calls `refreshCoordinator.refresh()`, updates the user on success, **flushes** the queue, and retries the original request.
4. If the refresh fails, flushes the queue with the error, calls `onRefreshFailure` (logout), and rejects.

`RefreshCoordinator` (`providers/refreshCoordinator.ts`) is the single source of truth that deduplicates concurrent refresh calls and holds the queue of requests waiting on it.

### Usage in components

```tsx
import { useAuth } from "../../providers/useAuth";

function Example() {
  const { user, isAuthenticated } = useAuth();
  if (user?.role === "admin") {
    /* ... */
  }
}
```

`AuthUser` shape:

```ts
type AuthUser = {
  id: string;
  email: string;
  role: "admin" | "manager" | "dev";
  fullName: string;
};
```

---

## Theming

`theme.ts` exports `useAppTheme()`, a hook that builds an MUI theme via `createTheme`:

- **Mode**: derived from `VITE_THEME` env var (`"light"` / `"dark"`) or the OS preference (`prefers-color-scheme`).
- **Custom palette colors**: `admin`, `manager`, `dev` (role colors, generated with `augmentColor`) and `chart` (a 10-color colorblind-friendly array used by MUI X Charts).
- **Component overrides**: default props for `MuiChartsLocalizationProvider` (i18n for empty/loading states) and `MuiTypography` (word-break for long strings).

The custom palette keys are declared via TypeScript module augmentation, so they are fully typed:

```tsx
<Chip color="admin" />
<Button color="manager" />
theme.palette.dev.main
theme.palette.chart[0].main
```

---

## Internationalization (i18n)

Configured in `i18n/index.ts` with `i18next` + `react-i18next` + browser language detection. Supported languages: **English (`en`)** and **Italian (`it`)**, `en` is the fallback.

Namespaces (one JSON file per feature, per language):
`common`, `auth`, `errors`, `user`, `project`, `ticket`, `dashboard`.

Usage:

```tsx
const { t } = useTranslation("ticket"); // default namespace
t("title"); // looked up in ticket.json
t("submit", { ns: "common" }); // explicit namespace override
```

The language selector lives in `Header.tsx` and calls `i18n.changeLanguage(code)`.

`useZodLocale()` (`hooks/useZodLocale.ts`) configures zod's global `customError` handler so schema validation errors (`required`, `invalidEmail`, `minLength`, `invalidType`, `invalidValue`) are automatically translated from the `errors` namespace, reacting to language changes.

---

## Forms

Forms use `react-hook-form` in **controlled** mode with `zod` schemas.

### `useCustomForm`

A thin wrapper around `useForm` pre-wired with `zodResolver`, `mode: "onTouched"`:

```ts
const form = useCustomForm<MyFormValues>({
  schema: myZodSchema,
  defaultValues: { ... },
  values: { ... }, // optional — sync with fetched data (edit pages)
});
```

### Field components (`components/`)

All controlled fields read `control`/`setValue` from `useFormContext()`, so they must be rendered inside a `<FormProvider {...form}>`.

- **`ControlledTextField`** — wraps MUI `TextField`, shows validation error/helperText automatically.
  ```tsx
  <ControlledTextField name="title" label={t("title")} multiline rows={4} />
  ```
- **`ControlledPasswordField`** — `ControlledTextField` + a show/hide visibility toggle button.
  ```tsx
  <ControlledPasswordField name="password" label={t("password")} />
  ```
- **`ControlledAutocomplete`** — wraps MUI `Autocomplete` for static option lists (single or multiple selection).
  ```tsx
  <ControlledAutocomplete
    name="role"
    label={t("role")}
    options={ROLES}
    getOptionLabel={(o) => t(o)}
  />
  ```
- **`ControlledInfiniteQueryAutocomplete<T>`** — Autocomplete backed by a TanStack `useInfiniteQuery` result. Handles debounced search, infinite scroll pagination, and **row virtualization** (via `@tanstack/react-virtual`) so large lists (e.g. thousands of projects) stay performant.
  ```tsx
  <ControlledInfiniteQueryAutocomplete<Project>
    name="project"
    label={t("project")}
    infiniteQuery={projectsListQuery}
    getOptionKey={(p) => p.id}
    getOptionLabel={(p) => p.name}
  />
  ```

### Typical page pattern

```tsx
const form = useCustomForm<ProjectCreateFormValues>({
  schema: projectCreateFormSchema,
  defaultValues: { name: "", description: "" },
});
const mutation = useProjectCreateMutation({ onSuccess: (p) => navigate(`/project/${p.id}`) });
const handleSubmit = form.handleSubmit((data) => mutation.mutate(data));

<FormProvider {...form}>
  <ProjectCreateForm onEnter={() => form.formState.isValid && handleSubmit()} disabled={mutation.isPending} />
</FormProvider>
<Button disabled={!form.formState.isValid || mutation.isPending} onClick={handleSubmit} loading={mutation.isPending}>
  {t("submit")}
</Button>
```

---

## Data Fetching (TanStack Query)

Every feature exposes plain async functions in `api.ts` (thin axios wrappers) and hook wrappers under `hooks/`:

- **List queries** use `useInfiniteQuery` (`useProjectsListQuery`, `useTicketsListQuery`, `useUsersListQuery`) with a fixed `PAGE_SIZE = 20`, returning a `PaginatedResponse<T>`:

  ```ts
  type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
  ```

  Pages are flattened in the page component and infinite scroll is triggered with an `IntersectionObserver` on a sentinel `<div>`.

- **Detail queries** use `useQuery` keyed as `["<resource>", id]`, `enabled: !!id`.

- **Mutations** use `useMutation`, accept `options?: UseMutationOptions<...>` so callers can hook into `onSuccess`/`onError`, and typically:
  - Update the query cache with `queryClient.setQueryData([...], result)`.
  - Invalidate list queries with `queryClient.invalidateQueries({ queryKey: [...] })`.
  - Navigate and/or show a snackbar message.

Example:

```ts
export default function useProjectDetailQuery(id: string) {
  return useQuery<Project>({
    queryKey: ["projects", id],
    queryFn: () => projectById(id),
    enabled: !!id,
  });
}
```

Filters (search text, status, role, etc.) are debounced with `use-debounce` before being passed into the query key, so requests aren't fired on every keystroke.

---

## Demo Mode & Mock API (MSW)

When `VITE_DEMO_MODE=true`, `mocks/browser.ts` registers an MSW `setupWorker` with handlers for `auth`, `ai`, `users`, `projects`, and `tickets`, backed by in-memory arrays in `mocks/data/*`.

- **`guards.ts`** centralizes auth/role checks for handlers: `requireUser()` and `requireRole(...roles)`, returning either the current user or an MSW `HttpResponse` error (401/403).
- **`http.errors.ts`** provides standard error factories: `unauthorized`, `forbidden`, `notFound`, `badRequest`.
- Handlers simulate realistic latency with `delay(...)` and implement filtering/pagination/sorting logic equivalent to a real backend.
- Demo login: every mock user's password is `password123`; `LoginPage` shows quick-fill buttons for `admin`, `manager`, `dev` demo accounts when `VITE_DEMO_MODE=true`.
- AI ticket generation (`features/ai`) is fully mocked too, returning a canned `GeneratedTicket` after a simulated delay.

This lets the entire frontend run and be demoed **without any real backend**.

---

## Shared Components

Located in `components/`. All are feature-agnostic and translation-aware (`common` namespace unless noted).

| Component                           | Purpose                                                                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `PageHeader`                        | Page title + subtitle + back button + right-aligned `actions` slot.                                                  |
| `BackButton`                        | Icon button that navigates back (`navigate(-1)`) or to an explicit `path`.                                           |
| `PageLoader`                        | Full-height centered `CircularProgress`, used as route/Suspense fallback.                                            |
| `ProtectedRoute`                    | Route guard (see [Routing](#routing)).                                                                               |
| `ConfirmDialog`                     | Generic confirm/cancel dialog, used as the base for delete confirmations.                                            |
| `DeleteButton` / `DeleteIconButton` | Button/icon-button that opens a `ConfirmDialog` before calling an async `onDelete()`.                                |
| `Dot` / `ActiveDot`                 | Small colored status dot with tooltip; `ActiveDot` maps a boolean to active/inactive semantics.                      |
| `Header`                            | App bar: logo, language switcher, hamburger nav drawer (role-aware links), settings menu (change password / logout). |
| `AppContent`                        | Layout shell: `Header` + `Container` + `AppRoutes`.                                                                  |

### Usage examples

```tsx
<PageHeader
  title={t("projects")}
  subtitle={t("list")}
  actions={<IconButton onClick={() => navigate("/project/create")}><Add /></IconButton>}
  BackButtonProps={{ path: "/", replace: true }}
/>

<DeleteIconButton
  dialogTitle={project.name}
  dialogText={t("deactivateConfirm")}
  onDelete={() => mutation.mutateAsync(project.id)}
/>

<ActiveDot active={user.isActive} />
```

### Domain list/detail components (per feature)

Each feature (`user`, `project`, `ticket`) follows the same pattern:

- **`<Feature>sList`** — dense `List` of items with an `ActiveDot`/status badge, optional `onClick` (row navigation) and `actions` render-prop (per-row action buttons). Renders nothing for an empty array.
  ```tsx
  <ProjectsList
    projects={projects}
    onClick={(p) => navigate(`/project/${p.id}`)}
    actions={(p) => (
      <IconButton onClick={() => navigate(`/project/${p.id}/edit`)}>
        <Edit />
      </IconButton>
    )}
  />
  ```
- **`<Feature>Detail`** — a `Card` showing all fields of a single record, with graceful fallbacks (`Alert` "no description"/"no members").
- **`<Feature>AssignUser`** — checkbox list used on assignment pages, showing member status, role badge, and toggling membership via `onClick`.
- **`<Feature>DashboardChart`** — MUI X Charts `PieChart` + drill-down list, toggle between `status`/`priority` (tickets) or `role`/`status` (users) breakdowns, used on `DashboardPage`.
- **Badges**: `TicketStatusBadge`, `TicketPriorityBadge`, `UserRoleBadge`, `UserActiveBadge` — small `Chip`s colored via lookup tables (`const/tickets.ts`, `const/user.ts`) and optionally showing a `count`.

---

## Feature Modules

### `auth`

Login, logout, change password, token refresh. Key files: `api.ts` (`login`, `refreshToken`, `logout`, `changePassword`), `forms/LoginForm.tsx`, `forms/ChangePasswordForm.tsx`, `pages/LoginPage.tsx`, `pages/ChangePasswordPage.tsx`.

### `user`

Admin-only CRUD for users: list (filters: name/role/active), detail, create, edit, deactivate/reactivate/delete, reset password. Roles: `admin | manager | dev`.

### `project`

CRUD for projects, member assignment (`ProjectAssignUsersPage`), workload dashboard. A project has `members: User[]`, `isActive`, and can only be **deleted** once deactivated (soft-delete pattern also used for users).

### `ticket`

CRUD for tickets scoped to a project. Devs can only edit **status**; admins/managers can edit all fields. A ticket has `status` (`open|inProgress|resolved|closed`), `priority` (`low|medium|high`), `assignees`, and belongs to a `project`. Changing a ticket's project clears its assignees (confirmed via `ConfirmDialog`).

### `ai`

`GenerateTicketForm` + `useGenerateTicketMutation` let users describe a request in free text and get back a suggested `{ title, description, priority }`, which pre-fills the ticket creation form. Fully mocked in demo mode.

---

## Testing

- **Unit/component tests**: `vitest` + `@testing-library/react` + `@testing-library/user-event`. Test files are colocated as `*.test.tsx` / `*.spec.tsx`.
- **API mocking in tests**: `msw/node`'s `setupServer` (see `LoginPage.test.tsx`) for integration-style tests, or manual `vi.mock(...)` for isolating a component from its children/hooks (see `TicketEditForm.spec.tsx`, `TicketAssignUser.spec.tsx`).
- **Provider tests**: `AuthProvider.test.tsx` covers the 401 refresh/retry/queue/logout flows described in [Authentication](#authentication) in detail — a good reference for how the refresh coordinator and interceptor are expected to behave.
- Common conventions across specs: a `render<Feature>` helper wraps the component under test with the required context (`FormProvider`, `QueryClientProvider`, `MemoryRouter`), and field getters (`getNameInput()`, etc.) keep assertions readable.

---

## Environment Variables

| Variable                   | Purpose                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `VITE_DEMO_MODE`           | `"true"` enables the MSW mock backend and demo login shortcuts. |
| `VITE_THEME`               | Forces `"light"` or `"dark"` theme, overriding OS preference.   |
| `BASE_URL` (Vite built-in) | Used as the router `basename` and MSW service worker path.      |
