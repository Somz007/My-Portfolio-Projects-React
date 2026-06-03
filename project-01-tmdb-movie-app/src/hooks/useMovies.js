import { useState, useEffect, useCallback, useRef } from 'react'

const API_KEY  = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3'

/**
 * Builds a full TMDB endpoint URL with the API key appended.
 * Using a helper keeps every fetch call DRY.
 */
function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', API_KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return url.toString()
}

/**
 * useMovies — central hook for all TMDB data fetching.
 *
 * Returns:
 *   movies       — array of search results
 *   detail       — full movie object (when a card is clicked)
 *   loading      — true while any request is in-flight
 *   error        — string message on failure, null otherwise
 *   query        — current search string (controlled)
 *   setQuery     — setter to drive the search bar
 *   selectMovie  — call with a movie id to load its detail
 *   clearDetail  — call to dismiss the detail panel
 *   trending     — array of trending movies shown on first load
 */
export function useMovies() {
  const [query,    setQuery]   = useState('')
  const [movies,   setMovies]  = useState([])
  const [trending, setTrending] = useState([])
  const [detail,   setDetail]  = useState(null)
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState(null)

  /* Keeps a ref to the latest search query so the debounce
     closure can bail out if the user keeps typing. */
  const latestQuery = useRef(query)
  useEffect(() => { latestQuery.current = query }, [query])

  /* ── Trending: load once on mount ──────────────────────────── */
  useEffect(() => {
    async function fetchTrending() {
      setLoading(true)
      setError(null)
      try {
        const res  = await fetch(buildUrl('/trending/movie/week'))
        if (!res.ok) throw new Error(`TMDB error ${res.status}`)
        const data = await res.json()
        setTrending(data.results || [])
      } catch (err) {
        setError('Could not load trending movies. Check your API key.')
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

  /* ── Search: fires 400 ms after the user stops typing ──────── */
  useEffect(() => {
    /* Don't search on empty string — show trending instead. */
    if (!query.trim()) {
      setMovies([])
      setError(null)
      return
    }

    const timer = setTimeout(async () => {
      /* If the query changed again before the timer fires, abort. */
      if (query !== latestQuery.current) return

      setLoading(true)
      setError(null)
      try {
        const res  = await fetch(buildUrl('/search/movie', { query, include_adult: false }))
        if (!res.ok) throw new Error(`TMDB error ${res.status}`)
        const data = await res.json()

        /* Only update state if this result is still for the current query. */
        if (query === latestQuery.current) {
          if (data.results.length === 0) {
            setError(`No results found for "${query}"`)
            setMovies([])
          } else {
            setMovies(data.results)
            setError(null)
          }
        }
      } catch (err) {
        if (query === latestQuery.current) {
          setError('Search failed. Please check your connection.')
          setMovies([])
        }
      } finally {
        if (query === latestQuery.current) setLoading(false)
      }
    }, 400)

    /* React cleanup: cancel the timer if query changes before it fires. */
    return () => clearTimeout(timer)
  }, [query])

  /* ── Movie detail: fetches movie + credits by id ────────────── */
  const selectMovie = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      /* Fetch movie details and credits in parallel for speed. */
      const [movieRes, creditsRes] = await Promise.all([
        fetch(buildUrl(`/movie/${id}`)),
        fetch(buildUrl(`/movie/${id}/credits`)),
      ])

      if (!movieRes.ok || !creditsRes.ok) throw new Error('Failed to load movie details')

      const [movieData, creditsData] = await Promise.all([
        movieRes.json(),
        creditsRes.json(),
      ])

      /* Merge the cast into the movie object for convenience. */
      setDetail({ ...movieData, cast: creditsData.cast?.slice(0, 12) || [] })
    } catch (err) {
      setError('Could not load movie details.')
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Clear detail panel ─────────────────────────────────────── */
  const clearDetail = useCallback(() => setDetail(null), [])

  return {
    query,
    setQuery,
    movies,
    trending,
    detail,
    loading,
    error,
    selectMovie,
    clearDetail,
  }
}
