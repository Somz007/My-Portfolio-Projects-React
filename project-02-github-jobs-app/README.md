# DevJobs — Remote Job Board

> A React developer job board powered by the Remotive API. Search 1,000+ remote listings, filter by job type and location, and browse paginated results — all with no API key required.

---

## Preview

| Search Results | Active Filters | Job Detail Modal |
|---|---|---|
| Live search with loading state | Type + location filters (client-side) | Centered modal with full HTML description |

---

## Features

- **Keyword search** — fetches up to 100 matching jobs from Remotive on submit
- **Client-side filters** — job type (Full Time / Part Time / Contract / Freelance / Internship) and location, applied instantly with no re-fetch
- **Smart pagination** — 10 jobs per page with `…` ellipsis for large page sets; resets to page 1 automatically when filters change
- **Job detail modal** — full HTML job description, salary, tags, and a direct "Apply" link
- **Relative timestamps** — "3 days ago", "2 weeks ago" computed from publication date
- **Company avatars** — logo image with 2-letter initial fallback on broken URLs
- **Keyboard accessible** — Tab navigation, Enter to open cards, Escape to close modal
- **Responsive** — stacks to single column on mobile; page numbers hidden in favour of Prev/Next on small screens
- **No API key** — works out of the box; just `npm install && npm run dev`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | CSS Modules + CSS custom properties |
| Fonts | Sora (display) + JetBrains Mono (metadata) |
| API | Remotive REST API (free, no key) |
| HTTP | Native `fetch` |
| State | `useState` + `useEffect` + `useCallback` + `useMemo` |
| Custom hook | `useJobs` — all API, filter, and pagination logic |

---

## Project Structure

```
project-02-github-jobs-app/
├── src/
│   ├── hooks/
│   │   └── useJobs.js           # API fetch + filter + pagination (useMemo)
│   ├── components/
│   │   ├── SearchForm/          # Title keyword input → triggers fetch
│   │   ├── FilterBar/           # Job type pills + location input (client-side)
│   │   ├── JobCard/             # Company/title/location/badge/chevron + hover effect
│   │   ├── JobDetail/           # Centered modal with dangerouslySetInnerHTML
│   │   ├── Pagination/          # Prev/Next + smart page numbers with … ellipsis
│   │   └── Spinner/             # 3 staggered pulsing dots
│   ├── styles/
│   │   └── global.css           # Design tokens (CSS variables), reset, animations
│   ├── App.jsx                  # Wiring layer — owns zero logic
│   └── App.module.css
├── .env                         # VITE_REMOTIVE_BASE_URL (no key needed)
├── .env.example
├── index.html                   # Google Fonts: Sora + JetBrains Mono
├── vite.config.js
└── package.json
```

---

## Getting Started

```bash
cd project-02-github-jobs-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — no `.env` setup needed since Remotive requires no API key.

To build for production:

```bash
npm run build
npm run preview
```

---

## How Pagination Works

This is the core algorithmic pattern, explained step by step:

### 1. Fetch once, paginate locally

```js
// Fetch up to 100 results from the API
url.searchParams.set('limit', '100')
const { jobs } = await fetch(url).then(r => r.json())
setAllJobs(jobs)
```

Remotive doesn't support server-side pagination, so we fetch the full result set once and slice it in the browser. No extra network requests for page changes.

### 2. Filter with `useMemo`

```js
const filteredJobs = useMemo(() => {
  let result = allJobs
  if (jobTypeFilter !== 'all') result = result.filter(j => j.job_type === jobTypeFilter)
  if (locationFilter) result = result.filter(j => j.candidate_required_location?.includes(q))
  return result
}, [allJobs, jobTypeFilter, locationFilter])
```

`useMemo` ensures the filter only runs when its inputs change — not on every render.

### 3. Derive the page slice

```js
const JOBS_PER_PAGE = 10
const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)

// Page 1 → slice(0, 10)  |  Page 2 → slice(10, 20)  |  Page N → slice((N-1)*10, N*10)
const pageJobs = filteredJobs.slice(
  (currentPage - 1) * JOBS_PER_PAGE,
  currentPage * JOBS_PER_PAGE
)
```

### 4. Always reset on filter change

```js
useEffect(() => {
  setCurrentPage(1)  // Prevent empty pages after filtering narrows the set
}, [jobTypeFilter, locationFilter])
```

---

## Key Implementation Notes

### `getPageRange` — smart ellipsis

```js
// Always renders: page 1, current ± 1, last page, with '...' for gaps
// e.g. page 6 of 12 → [1, '...', 5, 6, 7, '...', 12]
function getPageRange(current, total) {
  const show = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...show].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
  const result = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...')
    result.push(sorted[i])
  }
  return result
}
```

### Left-border hover effect — CSS only

```css
.card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 3px;
  height: 0;  /* starts collapsed */
  background: var(--color-blue);
  transition: height 0.25s ease, top 0.25s ease;
}
.card:hover::before {
  height: 100%;  /* sweeps to full height on hover */
  top: 0;
}
```

### `dangerouslySetInnerHTML` and trust

Remotive's `description` field is HTML. We render it with `dangerouslySetInnerHTML` because it comes from a trusted API source (Remotive moderates their job listings). In a production app accepting arbitrary user-generated HTML you would sanitise with [DOMPurify](https://github.com/cure53/DOMPurify) first.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_REMOTIVE_BASE_URL` | API base URL (default: `https://remotive.com/api/remote-jobs`) |

No API key is required. The Remotive free tier is public and CORS-enabled for browser use.

---

## Status

> Core features complete. Next: saved jobs (localStorage), category filter, skeleton loading cards.

---

## License

MIT
