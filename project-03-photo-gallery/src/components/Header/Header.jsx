import { useState } from 'react'
import { signOut } from '../../firebase/auth'
import { useAuth } from '../../context/AuthContext'
import styles from './Header.module.css'

/**
 * Header — sticky app bar shown to authenticated users.
 *
 * Displays:
 *   - App wordmark (left)
 *   - Upload button trigger (middle, hidden on mobile — Uploader handles it)
 *   - User avatar with sign-out dropdown (right)
 *
 * Props:
 *   onUploadClick — callback to open/focus the Uploader section
 */
export default function Header({ onUploadClick }) {
  const { user }          = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    setMenuOpen(false)
    await signOut()
    /* AuthContext's onAuthStateChanged fires → user becomes null → Login renders. */
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Wordmark */}
        <div className={styles.wordmark}>
          <span className={styles.wordmarkIcon} aria-hidden="true">◈</span>
          <span className={styles.wordmarkText}>Luminary</span>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Upload trigger button */}
          <button className={styles.uploadBtn} onClick={onUploadClick}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload
          </button>

          {/* User avatar — click to toggle sign-out menu */}
          <div className={styles.avatarWrapper}>
            <button
              className={styles.avatarBtn}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="User menu"
              aria-expanded={menuOpen}
            >
              {user?.photoURL ? (
                <img
                  className={styles.avatar}
                  src={user.photoURL}
                  alt={user.displayName ?? 'User avatar'}
                  referrerPolicy="no-referrer"
                />
              ) : (
                /* Fallback: first letter of display name */
                <span className={styles.avatarInitial}>
                  {user?.displayName?.charAt(0) ?? '?'}
                </span>
              )}
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <>
                {/* Invisible overlay to close menu on outside click */}
                <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />
                <div className={styles.menu} role="menu">
                  <div className={styles.menuHeader}>
                    <p className={styles.menuName}>{user?.displayName}</p>
                    <p className={styles.menuEmail}>{user?.email}</p>
                  </div>
                  <button
                    className={styles.signOutBtn}
                    onClick={handleSignOut}
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
