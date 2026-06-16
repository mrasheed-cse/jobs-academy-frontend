# Jobs Academy — Angular Frontend

Angular 21 (standalone components), converted from the existing `frontend/templates/new_custom` Django-template UI, wired to the Jobs Academy REST API.

## Status: foundation complete

What's built and working end-to-end against the real backend:
- **Auth flow**: signup, login, JWT storage, auto-refresh-on-401, logout
- **Shared layout**: header/nav (login-state aware) and footer, converted from `index2.html`
- **Home page**: hero section, live news carousel (real `/api/news/` data), feature cards
- **Route guards**: `authGuard` (protected routes), `guestGuard` (redirects logged-in users away from login/signup)

Not yet built: the other ~57 pages cataloged in the backend's `frontend/templates/new_custom/` (exam-taking flow, past exams, dashboard detail, jobs listing, news detail, quick quiz, word games, etc.). The patterns established here (services in `core/services`, models in `core/models`, one folder per page under `features/`) are meant to make those straightforward to add — see "Adding a new page" below.

## Prerequisites

```bash
node --version   # v22.12.0+ required (this was built/tested on v22.22.2)
npm --version
```

If your Node version is older, either upgrade it or use `npm install -g @angular/cli@21` (this project targets Angular 21, not the very latest 22, specifically for broader Node compatibility).

## Setup

```bash
cd jobs-academy
npm install
```

## Running against the backend

Edit `src/environments/environment.ts` if your backend isn't on `http://127.0.0.1:8001`:
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://127.0.0.1:8001',  // <- your Django dev server
};
```

Start the backend first (see the backend project's `DEV_SETUP_README.md`), then:
```bash
ng serve
```
Visit `http://localhost:4200`.

## Building

```bash
ng build                          # dev build, output in dist/
ng build --configuration production  # production build
```

Production builds use `src/environments/environment.prod.ts` (`apiBaseUrl: 'https://jobs.academy'`) via Angular's `fileReplacements` config — update that file before deploying if your production API URL differs.

## Testing

```bash
ng test
```
Uses Angular's Vitest-based test runner. All current specs pass.

## Project structure

```
src/app/
├── core/                    # singletons: services, models, guards, interceptors
│   ├── services/             # AuthService, ExamService, JobsService, NewsService
│   ├── models/                # TypeScript interfaces matching backend serializers
│   ├── guards/                 # authGuard, guestGuard
│   └── interceptors/            # JWT attach + auto-refresh-on-401
├── shared/
│   └── components/
│       ├── header/            # site nav, login-state aware
│       └── footer/             # footer + mobile bottom nav
└── features/                 # one folder per page/page-group
    ├── auth/login/
    ├── auth/signup/
    ├── home/
    └── dashboard/             # placeholder — needs full build-out
```

## Adding a new page

Reference doc: `API_REFERENCE.md` (from the backend audit) has the exact request/response shape for every endpoint.

1. Find the matching HTML in the backend's `frontend/templates/new_custom/` to use as the visual reference.
2. `ng generate component features/<area>/<page-name> --standalone`
3. If a new API area isn't covered yet, add a method to the relevant `core/services/*.service.ts` (or create a new service if it's a new feature area entirely — follow the existing services' pattern: inject `HttpClient`, use `environment.apiBaseUrl`, return typed `Observable`s using `core/models`).
4. Convert the original page's Bootstrap markup into the component's `.html`, swapping `<a href="...">` for `routerLink`, and any inline `<script>` logic into the component's `.ts` using Angular forms/signals (see `login.ts`/`signup.ts` for the pattern).
5. Add the route to `app.routes.ts` (lazy-loaded via `loadComponent`), with `canActivate: [authGuard]` if the page requires login.
6. **Test against the real backend before considering it done** — several backend responses don't match what the code might suggest at a glance (e.g. `/api/news/` is paginated while most list endpoints aren't; this was only caught by actually calling the live API, not by reading code). Use the browser dev tools network tab and compare to `API_REFERENCE.md`, and flag any further discrepancies.

## Known gaps / next steps

- **Dashboard** is a placeholder — needs exam history, subscription status, profile editing.
- **Exam-taking flow** (start → questions → submit → result) isn't built yet — this is the most complex remaining piece; budget real time for the countdown timer, answer-state management, and the skip/navigate-between-questions UX.
- **Forgot-password page** is routed to (`/forgot-password`) from the login page but doesn't exist yet — wire up `AuthService.requestOtp()` / `verifyOtp()`.
- **Google OAuth button** on login/signup is currently just a static button — needs real OAuth wiring once `GOOGLE_OAUTH_CLIENT_ID` is available.
- **Image optimization**: `public/images/sign_in_top.jpg` is 9.3MB, copied as-is from the original site. Compress before shipping to production.
- Several backend endpoints were flagged as having duplicate/inconsistent routes during the earlier API audit — re-check `API_REFERENCE.md` §23.3 before building features that touch those areas (most have already been fixed server-side, but worth double-checking against whichever backend instance this frontend is pointed at).
