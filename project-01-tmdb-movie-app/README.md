# Cinerama — TMDB Movie Browser

> A Cinema Noir-themed movie browser built with React 18 and the TMDB API. Search 800,000+ films, browse weekly trending picks, and explore cast, genres, and ratings in a sleek detail panel.

---

## Preview

| Home — Trending | Search Results | Movie Detail |
|---|---|---|
| Responsive auto-fill grid of trending films | Live debounced search with error handling | Slide-in panel with backdrop, cast, genres |

---

## Features

- **Live search** — debounced 400 ms so the API is never hammered mid-keystroke
- **Trending on load** — fetches the week's top films without any user input
- **Movie detail panel** — backdrop hero, poster, tagline, overview, runtime, language, genres, and up to 12 cast members with profile photos
- **Star rating** — TMDB's 0–10 vote_average rendered as a CSS partial-fill overlay; no external library
- **3D card tilt** — perspective tilt follows the cursor position for a physical, tactile feel
- **Loading states** — dual concentric-ring spinner; shown during all fetch operations
- **Error handling** — friendly inline messages for failed requests and empty search results
- **Keyboard accessible** — full focus ring, Escape to close detail, Enter to open cards
- **Fully responsive** — auto-fill grid from 1 column (320 px) to 6+ columns (1400 px)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | CSS Modules + CSS custom properties |
| Fonts | Playfair Display (serif) + DM Mono |
| API | TMDB REST API v3 |
| HTTP | Native `fetch` + `Promise.all` for parallel requests |
| State | `useState` + `useEffect` + `useCallback` + `useRef` |
| Custom hooks | `useMovies` — all API logic in one place |

No external UI library. No state management library. Zero runtime dependencies beyond React itself.

---

## Project Structure

```
project-01-tmdb-movie-app/
├── src/
│   ├── hooks/
│   │   └── useMovies.js          # All TMDB API logic (search, trending, detail)
│   ├── components/
│   │   ├── SearchBar/            # Controlled input with gold sweep animation
│   │   ├── Spinner/              # Dual concentric-ring loader
│   │   ├── StarRating/           # CSS partial-fill star overlay
│   │   ├── MovieCard/            # Poster card with 3D tilt on hover
│   │   ├── MovieGrid/            # Auto-fill grid + empty/error states
│   │   └── MovieDetail/          # Slide-in overlay with cast, genres, backdrop
│   ├── styles/
│   │   └── global.css            # Design tokens (CSS variables), reset, animations
│   ├── App.jsx                   # Root — wires hook → components, no API logic here
│   ├── App.module.css
│   └── main.jsx
├── index.html                    # Loads Google Fonts
├── vite.config.js
├── package.json
├── .env.example
└── .gitignore
```

---

## Getting Started

### 1. Clone and install

```bash
cd project-01-tmdb-movie-app
npm install
```

### 2. Add your TMDB API key

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_TMDB_API_KEY=your_api_key_here
```

Get a free key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) — registration takes under a minute.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## Key Implementation Notes

### `useMovies` hook — API isolation

All `fetch` calls live inside `src/hooks/useMovies.js`. Components never call `fetch` directly. This makes it trivial to swap TMDB for another API later, or to add caching/React Query without touching any component.

```js
// Parallel fetch — movie details + cast in one round trip
const [movieRes, creditsRes] = await Promise.all([
  fetch(buildUrl(`/movie/${id}`)),
  fetch(buildUrl(`/movie/${id}/credits`)),
])
```

### Debounced search

A `setTimeout` of 400 ms is cleared and restarted on every keystroke. A `useRef` tracks the latest query value so stale responses from slow network conditions are safely discarded.

### CSS partial-fill star rating

Two identical `★★★★★` strings are layered: the bottom is dim, the top is gold with `overflow: hidden` and a dynamic `width` percentage derived from the TMDB score. No SVG sprite, no external library.

### 3D card tilt

Mouse position relative to each card's bounding rect is mapped to a `rotateX` / `rotateY` transform with `perspective(600px)`. Max rotation is ±4°.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_TMDB_API_KEY` | Your TMDB v3 API key (required) |
| `VITE_TMDB_BASE_URL` | API base URL (default: `https://api.themoviedb.org/3`) |
| `VITE_TMDB_IMAGE_BASE` | Image CDN base (default: `https://image.tmdb.org/t/p`) |

> **Security note:** `VITE_` prefix variables are bundled into the client at build time. Never put a secret server-side key here — TMDB's free read-only key is designed for client-side use.

---

## Status

> In progress — core features complete. Next: pagination, favourites list (localStorage), trailer modal.

---

## License

MIT
