import { useState, useEffect, useCallback, useRef } from 'react'

const API_KEY  = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3'

function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('api_key', API_KEY)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return url.toString()
}

/**
 * useMovies — central hook for all TMDB data fetching.
 *
 * AbortController usage:
 *   Every fetch call is tied to an AbortController. When the search
 *   query changes before the previous request completes, we call
 *   controller.abort() in the useEffect cleanup function. This prevents
 *   stale responses from overwriting fresh results ("race condition").
 */
export function useMovies() {
  const [query,    setQuery]    = useState('')
  const [movies,   setMovies]   = useState([])
  const [trending, setTrending] = useState([])
  const [detail,   setDetail]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const latestQuery = useRef(query)
  useEffect(() => { latestQuery.current = query }, [query])

  /* ── Trending: load once on mount ──────────────────────────── */
  useEffect(() => {
    const controller = new AbortController()

    async function fetchTrending() {
      setLoading(true)
      setError(null)
      try {
        const res  = await fetch(buildUrl('/trending/movie/week'), {
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`TMDB error ${res.status}`)
        const data = await res.json()
        setTrending(data.results || [])
      } catch (err) {
        /* AbortError is expected on cleanup — not a real error. */
        if (err.name !== 'AbortError') {
          setError('Could not load trending movies. Check your API key.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchTrending()
    return () => controller.abort()
  }, [])

  /* ── Search: 400 ms debounce + abort on query change ────────── */
  useEffect(() => {
    if (!query.trim()) {
      setMovies([])
      setError(null)
      return
    }

    const controller = new AbortController()

    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res  = await fetch(
          buildUrl('/search/movie', { query, include_adult: false }),
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error(`TMDB error ${res.status}`)
        const data = await res.json()

        if (!controller.signal.aborted) {
          if (data.results.length === 0) {
            setError(`No results found for "${query}"`)
            setMovies([])
          } else {
            setMovies(data.results)
            setError(null)
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Search failed. Please check your connection.')
          setMovies([])
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 400)

    /* Abort the in-flight request AND cancel the timer on cleanup. */
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  /* ── Movie detail: parallel fetch of movie + credits ────────── */
  const selectMovie = useCallback(async (id) => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    try {
      const [movieRes, creditsRes] = await Promise.all([
        fetch(buildUrl(`/movie/${id}`),         { signal: controller.signal }),
        fetch(buildUrl(`/movie/${id}/credits`), { signal: controller.signal }),
      ])

      if (!movieRes.ok || !creditsRes.ok) throw new Error('Failed to load movie details')

      const [movieData, creditsData] = await Promise.all([
        movieRes.json(),
        creditsRes.json(),
      ])

      setDetail({ ...movieData, cast: creditsData.cast?.slice(0, 12) || [] })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Could not load movie details.')
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [])

  const clearDetail = useCallback(() => setDetail(null), [])

  return {
    query, setQuery,
    movies, trending,
    detail, loading, error,
    selectMovie, clearDetail,
  }
}
