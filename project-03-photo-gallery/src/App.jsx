import { useState, useRef } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { usePhotos }  from './hooks/usePhotos'
import Login          from './components/Login/Login'
import Header         from './components/Header/Header'
import Uploader       from './components/Uploader/Uploader'
import PhotoGrid      from './components/PhotoGrid/PhotoGrid'
import Lightbox       from './components/Lightbox/Lightbox'
import styles from './App.module.css'

/**
 * App — root component.
 *
 * Structure:
 *   <AuthProvider>         ← provides user + loading to the whole tree
 *     <AppShell>           ← reads auth state and renders the right screen
 *
 * Why the AuthProvider wrapper here?
 *   useAuth() can only be called inside a component that is a descendant
 *   of <AuthProvider>. So we can't call useAuth() in App itself —
 *   instead, App just provides the context, and AppShell consumes it.
 */
export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

/**
 * AppShell — the actual application UI, rendered inside AuthProvider.
 *
 * Three render states:
 *   loading  — Firebase is checking the persisted session (brief)
 *   !user    — Not signed in → show Login screen
 *   user     — Signed in → show full gallery
 */
function AppShell() {
  const { user, loading } = useAuth()
  const { photos, loading: photosLoading, error, deletePhoto } = usePhotos()

  /* Lightbox state — null = closed, number = open at that index. */
  const [lightboxIndex, setLightboxIndex] = useState(null)

  /* Ref forwarded to the Uploader so the Header's Upload button can
     scroll the page to the upload zone. */
  const uploaderRef = useRef(null)

  /** Scrolls the Uploader section into view when the Header button is clicked. */
  function scrollToUploader() {
    uploaderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  /* ── Auth loading screen ───────────────────────────────────────── */
  if (loading) {
    return (
      <div className={styles.loadingScreen} aria-label="Loading">
        <span className={styles.loadingSpinner} aria-hidden="true">◈</span>
      </div>
    )
  }

  /* ── Not signed in ─────────────────────────────────────────────── */
  if (!user) return <Login />

  /* ── Signed in ─────────────────────────────────────────────────── */
  return (
    <div className={styles.app}>
      <Header onUploadClick={scrollToUploader} />

      <main className={styles.main}>
        {/* Upload zone */}
        <section className={styles.uploadSection}>
          <Uploader uploaderRef={uploaderRef} />
        </section>

        {/* Section divider + photo count */}
        {!photosLoading && photos.length > 0 && (
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLine} />
            <h2 className={styles.sectionLabel}>
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </h2>
            <span className={styles.sectionLine} />
          </div>
        )}

        {/* Photo grid */}
        <PhotoGrid
          photos={photos}
          loading={photosLoading}
          error={error}
          onOpen={(index) => setLightboxIndex(index)}
          onDelete={deletePhoto}
        />
      </main>

      {/* Lightbox — only mounted when open */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onDelete={deletePhoto}
        />
      )}
    </div>
  )
}
