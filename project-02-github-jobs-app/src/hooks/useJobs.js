import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

/* ── Config ───────────────────────────────────────────────────────
   Base URL is read from .env so it can be swapped without touching
   any component. The Remotive API requires NO API key — just this URL. */
const BASE_URL = import.meta.env.VITE_REMOTIVE_BASE_URL || 'https://remotive.com/api/remote-jobs'

/* ── Pagination constant ──────────────────────────────────────────
   Centralised here so changing it updates everything automatically. */
const JOBS_PER_PAGE = 10

/* ── Job type options ─────────────────────────────────────────────
   Exported so FilterBar can render these without hardcoding them.
   Values match exactly what Remotive returns in the job_type field. */
export const JOB_TYPES = [
  { value: 'all',        label: 'All Types'  },
  { value: 'full_time',  label: 'Full Time'  },
  { value: 'part_time',  label: 'Part Time'  },
  { value: 'contract',   label: 'Contract'   },
  { value: 'freelance',  label: 'Freelance'  },
  { value: 'internship', label: 'Internship' },
]

/**
 * useJobs — central hook. Manages:
 *   1. Fetching jobs from the Remotive API on search submit
 *   2. Filtering results client-side by job type and location
 *   3. Paginating the filtered results into pages of JOBS_PER_PAGE
 *   4. Tracking the selected job for the detail modal
 *
 * Why client-side filtering + pagination?
 *   Remotive's free API doesn't support server-side filters or pagination
 *   parameters. We fetch up to 100 results once and do everything locally —
 *   no extra network requests when the user changes filters or pages.
 */
export function useJobs() {

  /* ── Search form state ────────────────────────────────────────── */

  /** The text currently in the keyword input box (controlled). */
  const [titleQuery, setTitleQuery] = useState('')

  /* ── Client-side filter state ─────────────────────────────────── */

  /** Substring match against job.candidate_required_location. */
  const [locationFilter, setLocationFilter] = useState('')

  /** Exact match against job.job_type. 'all' means no filter. */
  const [jobTypeFilter, setJobTypeFilter] = useState('all')

  /* ── API / async state ────────────────────────────────────────── */

  /** All jobs returned by the API for the latest search query. */
  const [allJobs, setAllJobs] = useState([])

  /** True while a fetch is in-flight. */
  const [loading, setLoading] = useState(false)

  /** Human-readable error string, or null when healthy. */
  const [error, setError] = useState(null)

  /**
   * Tracks whether the user has submitted at least one search.
   * Lets us distinguish "app just loaded" from "searched, got nothing".
   */
  const [hasSearched, setHasSearched] = useState(false)

  /* ── Pagination state ─────────────────────────────────────────── */

  /** 1-indexed current page number. */
  const [currentPage, setCurrentPage] = useState(1)

  /* ── Selected job ─────────────────────────────────────────────── */

  /** The full job object shown in the detail modal, or null when closed. */
  const [selectedJob, setSelectedJob] = useState(null)

  /* ══════════════════════════════════════════════════════════════
     DERIVED STATE — useMemo so these only recompute when inputs change,
     not on every render.
     ══════════════════════════════════════════════════════════════ */

  /**
   * filteredJobs — applies the user's type and location filters to allJobs.
   *
   * useMemo dependency array: [allJobs, jobTypeFilter, locationFilter]
   * → only recalculates when one of those three values changes.
   */
  const filteredJobs = useMemo(() => {
    let result = allJobs

    /* Filter 1: job type (exact match on Remotive's job_type string). */
    if (jobTypeFilter !== 'all') {
      result = result.filter((job) => job.job_type === jobTypeFilter)
    }

    /* Filter 2: location (case-insensitive substring on candidate_required_location).
       e.g. "Europe" matches "Anywhere in Europe", "UK", "Germany, Austria" etc. */
    if (locationFilter.trim()) {
      const q = locationFilter.trim().toLowerCase()
      result = result.filter((job) =>
        job.candidate_required_location?.toLowerCase().includes(q)
      )
    }

    return result
  }, [allJobs, jobTypeFilter, locationFilter])

  /* ══════════════════════════════════════════════════════════════
     PAGINATION MATH — explained step by step
     ══════════════════════════════════════════════════════════════

     Suppose filteredJobs.length = 47 and JOBS_PER_PAGE = 10:

       totalPages = Math.ceil(47 / 10) = 5  (pages 1–4 have 10, page 5 has 7)

     The slice for each page:
       page 1: slice(0, 10)   → indices 0..9
       page 2: slice(10, 20)  → indices 10..19
       page 3: slice(20, 30)  → indices 20..29
       page 4: slice(30, 40)  → indices 30..39
       page 5: slice(40, 50)  → indices 40..46 (only 7 items, .slice() handles the overshoot)

     General formula:
       start = (currentPage - 1) * JOBS_PER_PAGE
       end   = currentPage * JOBS_PER_PAGE
  */

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)

  const pageJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  )

  /* ══════════════════════════════════════════════════════════════
     CRITICAL RESET RULE
     When filters change, reset to page 1 — otherwise the user
     could be on page 7 while filtered results only have 2 pages,
     and they'd see an empty list with no obvious reason why.
     ══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    setCurrentPage(1)
  }, [jobTypeFilter, locationFilter])

  /* ══════════════════════════════════════════════════════════════
     API FETCH
     ══════════════════════════════════════════════════════════════ */

  /**
   * search — fetches jobs matching the given title keyword.
   *
   * useCallback: the function reference stays stable across renders,
   * which matters if it's ever used in a child's dependency array.
   *
   * @param {string} title — the keyword from the search form
   */
  /*
   * AbortController ref — stores the controller for the current in-flight
   * request so we can cancel it if the user submits a new search before
   * the previous one completes (prevents stale results overwriting fresh ones).
   */
  const abortRef = useRef(null)

  const search = useCallback(async (title) => {
    if (!title.trim()) {
      setError('Please enter a job title or keyword to search.')
      return
    }

    /* Cancel any in-flight request from a previous search. */
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)
    setHasSearched(true)
    setCurrentPage(1)
    setAllJobs([])

    try {
      const url = new URL(BASE_URL)
      url.searchParams.set('search', title.trim())
      url.searchParams.set('limit', '100')

      const res = await fetch(url.toString(), { signal: abortRef.current.signal })

      if (!res.ok) throw new Error(`Remotive API error: status ${res.status}`)

      const data = await res.json()
      const jobs = data.jobs ?? []

      setAllJobs(jobs)

      if (jobs.length === 0) {
        setError(`No remote jobs found for "${title}". Try a broader keyword.`)
      }
    } catch (err) {
      /* AbortError fires when we cancel — not a real error. */
      if (err.name !== 'AbortError') {
        setError('Failed to fetch jobs. Check your connection and try again.')
        setAllJobs([])
      }
    } finally {
      if (!abortRef.current?.signal.aborted) setLoading(false)
    }
  }, [])

  /* ── Pagination navigation ──────────────────────────────────── */

  /** Jump to a specific page number and scroll to the top of the list. */
  const goToPage = useCallback((page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /** Advance one page (clamped to totalPages). */
  const nextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [totalPages])

  /** Go back one page (clamped to 1). */
  const prevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /* ── Detail modal ───────────────────────────────────────────── */

  /** Open the detail modal for a specific job. */
  const selectJob = useCallback((job) => setSelectedJob(job), [])

  /** Close the detail modal. */
  const clearJob = useCallback(() => setSelectedJob(null), [])

  /* ── Public API ─────────────────────────────────────────────── */
  return {
    /* Search form */
    titleQuery,
    setTitleQuery,
    search,

    /* Client-side filters */
    locationFilter,
    setLocationFilter,
    jobTypeFilter,
    setJobTypeFilter,

    /* Data */
    pageJobs,            // The 10 (or fewer) jobs to render on screen
    totalJobs: allJobs.length,         // Total from API (unfiltered)
    filteredCount: filteredJobs.length, // After filters applied
    loading,
    error,
    hasSearched,

    /* Pagination */
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,

    /* Detail modal */
    selectedJob,
    selectJob,
    clearJob,
  }
}
