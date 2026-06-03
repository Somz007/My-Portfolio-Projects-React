import styles from './Pagination.module.css'

/**
 * getPageRange — builds the array of page numbers (and '...' gaps) to display.
 *
 * The goal is to always show:
 *   - Page 1 (first anchor)
 *   - Pages immediately around the current page (current ± 1)
 *   - Last page (last anchor)
 *   - '...' wherever there's a gap of 2 or more skipped pages
 *
 * Examples with totalPages = 12, currentPage = 6:
 *   [1, '...', 5, 6, 7, '...', 12]
 *
 * With currentPage = 1:
 *   [1, 2, '...', 12]
 *
 * With currentPage = 12:
 *   [1, '...', 11, 12]
 *
 * With totalPages = 5 (small enough to show all):
 *   [1, 2, 3, 4, 5]
 *
 * @param {number} current   — the 1-indexed active page
 * @param {number} total     — total number of pages
 * @returns {Array<number|'...'>}
 */
function getPageRange(current, total) {
  /* Build a Set of the page numbers we definitely want to show.
     Sets automatically deduplicate, so current ± 1 won't create duplicates
     when current is 1 or total. */
  const show = new Set([
    1,
    total,
    current,
    current - 1,
    current + 1,
  ])

  /* Remove any numbers that fall outside the valid range. */
  const sorted = [...show]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)

  /* Walk through the sorted list and insert '...' wherever consecutive
     page numbers differ by more than 1. */
  const result = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('...')
    }
    result.push(sorted[i])
  }

  return result
}

/**
 * Pagination — renders Prev / page numbers / Next controls.
 *
 * Props:
 *   currentPage — the active page (1-indexed)
 *   totalPages  — total number of pages for the filtered set
 *   onPage      — callback(pageNumber) — jump to a specific page
 *   onPrev      — callback() — go to previous page
 *   onNext      — callback() — go to next page
 */
export default function Pagination({ currentPage, totalPages, onPage, onPrev, onNext }) {
  /* Don't render anything if there's only one page or no results. */
  if (totalPages <= 1) return null

  const pageRange = getPageRange(currentPage, totalPages)

  return (
    <nav className={styles.nav} aria-label="Pagination">
      {/* Previous button */}
      <button
        className={`${styles.btn} ${styles.arrow}`}
        onClick={onPrev}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        ← Prev
      </button>

      {/* Page number buttons */}
      <div className={styles.pages}>
        {pageRange.map((item, i) =>
          item === '...' ? (
            /* Ellipsis: not a button, just a visual spacer */
            <span key={`ellipsis-${i}`} className={styles.ellipsis}>
              …
            </span>
          ) : (
            <button
              key={item}
              className={`${styles.btn} ${styles.page} ${currentPage === item ? styles.active : ''}`}
              onClick={() => onPage(item)}
              aria-label={`Go to page ${item}`}
              aria-current={currentPage === item ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* Next button */}
      <button
        className={`${styles.btn} ${styles.arrow}`}
        onClick={onNext}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        Next →
      </button>
    </nav>
  )
}
