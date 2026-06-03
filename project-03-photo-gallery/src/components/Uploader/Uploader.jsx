import { useState, useRef, useCallback } from 'react'
import { uploadPhoto } from '../../firebase/storage'
import { useAuth } from '../../context/AuthContext'
import styles from './Uploader.module.css'

/* Maximum file size we'll accept — 15 MB. */
const MAX_SIZE_MB = 15
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

/**
 * Uploader — drag-and-drop + click-to-browse file upload zone.
 *
 * Upload flow per file:
 *   1. User drops / selects image files
 *   2. We validate type (must be image/*) and size (≤ 15 MB)
 *   3. For each valid file, call uploadPhoto() from firebase/storage.js
 *      which returns a Promise and fires onProgress callbacks
 *   4. Progress state is stored per-file in an array of upload items
 *   5. Completed uploads clear themselves after a short delay
 *
 * Files upload in parallel — Promise.all would wait for all before
 * clearing, so we handle each independently instead.
 *
 * Props:
 *   uploaderRef — a ref forwarded from App so the Header's "Upload"
 *                 button can scroll to / focus this element
 */
export default function Uploader({ uploaderRef }) {
  const { user } = useAuth()

  /* Each item: { id, name, progress: 0-100, status: 'uploading'|'done'|'error' } */
  const [uploads,   setUploads]   = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  /** Update a single upload item by its id without mutating the array. */
  function updateUpload(id, patch) {
    setUploads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  }

  /**
   * processFiles — validates and kicks off uploads for an array of File objects.
   * Called by both the drop handler and the file input onChange.
   */
  const processFiles = useCallback(async (files) => {
    /* Filter to images only and enforce size limit. */
    const valid = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > MAX_SIZE_BYTES) {
        /* Show an ephemeral error item for oversized files. */
        const id = `${Date.now()}_${file.name}`
        setUploads((prev) => [
          ...prev,
          { id, name: file.name, progress: 0, status: 'error',
            error: `File exceeds ${MAX_SIZE_MB} MB limit` },
        ])
        setTimeout(() => setUploads((prev) => prev.filter((u) => u.id !== id)), 4000)
        continue
      }
      valid.push(file)
    }

    if (valid.length === 0) return

    /* Create an upload item for each valid file. */
    const newItems = valid.map((file) => ({
      id:       `${Date.now()}_${file.name}`,
      name:     file.name,
      progress: 0,
      status:   'uploading',
    }))

    setUploads((prev) => [...prev, ...newItems])

    /* Upload each file independently (parallel, not sequential). */
    newItems.forEach(async (item, i) => {
      try {
        await uploadPhoto(
          valid[i],
          user,
          /* onProgress callback: update just this item's progress. */
          (percent) => updateUpload(item.id, { progress: percent })
        )

        /* Mark done, then remove from the list after 2 seconds. */
        updateUpload(item.id, { status: 'done', progress: 100 })
        setTimeout(
          () => setUploads((prev) => prev.filter((u) => u.id !== item.id)),
          2000
        )
      } catch (err) {
        updateUpload(item.id, { status: 'error', error: 'Upload failed' })
        setTimeout(
          () => setUploads((prev) => prev.filter((u) => u.id !== item.id)),
          4000
        )
      }
    })
  }, [user])

  /* ── Drag-and-drop handlers ────────────────────────────────────── */

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    /* Only clear if leaving the drop zone entirely (not a child element). */
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const files = [...e.dataTransfer.files]
    processFiles(files)
  }

  function handleInputChange(e) {
    const files = [...e.target.files]
    processFiles(files)
    /* Reset input so the same file can be selected again if needed. */
    e.target.value = ''
  }

  return (
    <section className={styles.section} ref={uploaderRef}>
      {/* Drop zone */}
      <div
        className={`${styles.zone} ${isDragging ? styles.dragging : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload photos — click or drag and drop"
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        {/* Hidden file input — triggered by clicking the zone */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className={styles.hiddenInput}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className={styles.zoneContent}>
          {/* Upload icon */}
          <div className={`${styles.iconWrapper} ${isDragging ? styles.iconDragging : ''}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>

          {isDragging ? (
            <p className={styles.zoneTextPrimary}>Drop to upload</p>
          ) : (
            <>
              <p className={styles.zoneTextPrimary}>
                Drag photos here, or <span className={styles.browseLink}>browse</span>
              </p>
              <p className={styles.zoneTextSecondary}>
                JPEG, PNG, GIF, WebP · Max {MAX_SIZE_MB} MB each
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload progress list — each active upload gets a row */}
      {uploads.length > 0 && (
        <ul className={styles.uploadList} aria-label="Upload progress">
          {uploads.map((item) => (
            <li key={item.id} className={styles.uploadItem}>
              {/* Status icon */}
              <span className={styles.uploadIcon} aria-hidden="true">
                {item.status === 'done'    && '✓'}
                {item.status === 'error'   && '✕'}
                {item.status === 'uploading' && '↑'}
              </span>

              <div className={styles.uploadBody}>
                {/* Filename */}
                <p className={styles.uploadName} title={item.name}>
                  {item.name}
                </p>

                {/* Progress bar — only shown while uploading */}
                {item.status === 'uploading' && (
                  <div className={styles.progressTrack} aria-label={`${item.progress}% uploaded`}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}

                {/* Status text */}
                <p className={`${styles.uploadStatus} ${styles[item.status]}`}>
                  {item.status === 'uploading' && `${item.progress}%`}
                  {item.status === 'done'      && 'Uploaded'}
                  {item.status === 'error'     && (item.error ?? 'Failed')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
