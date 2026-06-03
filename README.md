# React Portfolio — Somz007

Four projects exploring modern web development — a movie browser, a job board, a real-time photo gallery, and a full-stack blog. Built with React, Firebase, and Flask.

**[🌐 Live Portfolio](https://Somz007.github.io/My-Portfolio-Projects-React/)** · **[GitHub](https://github.com/Somz007)**

---

## Projects

| # | Project | What it does | Tech stack | Live |
|---|---------|--------------|------------|------|
| 01 | [TMDB Movie App](./project-01-tmdb-movie-app/) | Search and browse movies — debounced search, trending feed, slide-in detail panel with cast, genres, and ratings | React 18, Vite, TMDB API, CSS Modules | [Demo ↗](https://Somz007.github.io/My-Portfolio-Projects-React/project-01-tmdb-movie-app/) |
| 02 | [DevJobs Board](./project-02-github-jobs-app/) | Remote developer job board — live type/location filters, client-side pagination, sanitized HTML job descriptions | React 18, Vite, Remotive API, DOMPurify | [Demo ↗](https://Somz007.github.io/My-Portfolio-Projects-React/project-02-github-jobs-app/) |
| 03 | [Luminary Gallery](./project-03-photo-gallery/) | Personal photo gallery — Google sign-in, drag-drop upload with progress, real-time masonry grid, lightbox | React 18, Firebase, Cloudinary, Vite | [Demo ↗](https://Somz007.github.io/My-Portfolio-Projects-React/project-03-photo-gallery/) |
| 04 | [Flask Microblog](./project-04-flask-microblog/) | Full-stack blog — registration, hashed passwords, post CRUD, user profiles, pagination, CSRF protection | Python, Flask, SQLAlchemy, SQLite, Bootstrap 5 | _Server app — [run locally](#running-projects-locally)_ |

> Projects 01–03 are **Vite + React** single-page apps deployed to GitHub Pages.
> Project 04 is a **Flask** server-rendered app and runs locally with Python (see [deployment note](#why-project-04-isnt-on-github-pages)).

---

## Skills demonstrated

**React**
- Function components with `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`
- Custom hooks isolating all data logic — `useMovies`, `useJobs`, `usePhotos`
- React Context for global auth state (project 03) — no prop drilling
- Root-level Error Boundaries with recoverable fallback UI in all three apps
- Race-condition-safe fetching with `AbortController`

**APIs and data**
- REST integration with loading, empty, and error states (TMDB, Remotive)
- Debounced search to avoid hammering the API on every keystroke
- `Promise.all` for parallel requests (movie details + cast)
- Client-side filtering and pagination computed with `useMemo`

**Firebase & backend services**
- Firebase Authentication — Google OAuth with `onAuthStateChanged` session persistence
- Cloud Firestore — real-time `onSnapshot` listeners (uploads appear instantly across tabs)
- Cloudinary uploads via `XMLHttpRequest` for per-file progress events
- Server-side ownership rules — users can only delete their own content

**Flask & full-stack Python**
- App factory pattern with Blueprints (`auth`, `blog`) for modular routing
- SQLAlchemy ORM — `User`/`Post` models with a one-to-many relationship
- Werkzeug PBKDF2 password hashing — never stores plaintext
- Flask-Login sessions, `@login_required`, and server-side `abort(403)` ownership guards
- Flask-WTF CSRF protection on every POST form
- Jinja2 template inheritance, pagination, flash messages

**Engineering practices**
- XSS-safe rendering — DOMPurify on third-party HTML (project 02), Jinja2 auto-escaping (project 04)
- CSS Modules for scoped styles; a distinct visual identity per project
- Code-splitting large vendor bundles via Vite `manualChunks` (project 03)
- Environment variables for all secrets — `.env` files git-ignored, `.env.example` committed
- Responsive layouts and `:focus-visible` keyboard navigation throughout

---

## Running projects locally

Clone the repo first:

```bash
git clone https://github.com/Somz007/My-Portfolio-Projects-React.git
cd My-Portfolio-Projects-React
```

### Projects 01–03 (React + Vite)

```bash
cd project-01-tmdb-movie-app    # or 02 / 03
npm install
cp .env.example .env            # then fill in API keys (see each project's README)
npm run dev                     # opens http://localhost:5173
```

| Project | Keys needed |
|---|---|
| 01 — TMDB | `VITE_TMDB_API_KEY` (free from themoviedb.org) |
| 02 — DevJobs | None — Remotive API is public |
| 03 — Luminary | Firebase config + Cloudinary cloud name/preset |

### Project 04 (Flask + Python)

```bash
cd project-04-flask-microblog
python -m venv venv
venv\Scripts\activate            # Windows  (use: source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
cp .env.example .env
python run.py                    # opens http://localhost:5000
```

The SQLite database is created automatically on first run.

---

## Deployment

Projects 01–03 deploy together to GitHub Pages with one command from the repo root:

```bash
npm install        # installs gh-pages
npm run deploy     # builds all three apps + pushes to the gh-pages branch
```

`scripts/build.mjs` builds each Vite app, copies them into a combined `dist/`,
and generates the landing page. The `gh-pages` package publishes `dist/` to the
`gh-pages` branch. Live within ~2 minutes at
**https://Somz007.github.io/My-Portfolio-Projects-React/**.

> **Project 03 (Luminary) note:** Google sign-in on the live demo requires the
> GitHub Pages domain to be added under Firebase Console → Authentication →
> Settings → Authorized domains (`Somz007.github.io`).

### Why project 04 isn't on GitHub Pages

GitHub Pages serves **static files only** — HTML, CSS, and JavaScript. It cannot
run a Python process. The Flask microblog needs a live server to handle routing,
session management, password hashing, and SQLite queries on each request, so it
runs locally or on a Python host (Render, Railway, Fly.io, PythonAnywhere). Its
[README](./project-04-flask-microblog/README.md) has full run instructions.

---

## Repo structure

```
My-Portfolio-Projects-React/
├── project-01-tmdb-movie-app/      ← React + Vite (TMDB API)
├── project-02-github-jobs-app/     ← React + Vite (Remotive API)
├── project-03-photo-gallery/       ← React + Vite (Firebase + Cloudinary)
├── project-04-flask-microblog/     ← Python + Flask (SQLite)
├── scripts/
│   └── build.mjs                   ← builds projects 01–03 into dist/ + landing page
├── package.json                    ← root deploy script (gh-pages)
└── README.md
```

Each project folder is self-contained with its own dependencies, `.env.example`,
and a detailed README covering its architecture and key implementation notes.

---

**Semeshan** · [GitHub](https://github.com/Somz007) · [Live Portfolio](https://Somz007.github.io/My-Portfolio-Projects-React/)
