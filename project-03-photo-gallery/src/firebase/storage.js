/**
 * Cloudinary Upload + Firestore helpers
 * ─────────────────────────────────────────────────────────────────
 * Images are uploaded to Cloudinary (free, no credit card).
 * Photo metadata (URL, uploader info, timestamps) is saved to Firestore.
 *
 * Why Cloudinary instead of Firebase Storage?
 *   Firebase Storage requires the Blaze (pay-as-you-go) plan.
 *   Cloudinary's free tier gives 25 GB storage and no card required.
 *
 * Upload flow:
 *   1. Send image to Cloudinary via XMLHttpRequest (XHR)
 *      → XHR gives us upload progress events; fetch() does not
 *   2. Cloudinary returns a secure_url (permanent CDN link)
 *   3. Save metadata + URL to Firestore via addDoc()
 *   4. onSnapshot in usePhotos fires → gallery updates instantly
 *
 * Delete flow:
 *   Cloudinary client-side deletion requires a short-lived token not
 *   suitable for "delete later" use cases. For this portfolio app we
 *   delete the Firestore document only — the image is removed from the
 *   gallery immediately. The Cloudinary file becomes unreferenced.
 *   Production apps would call a Cloud Function to delete from Cloudinary.
 *
 * Firestore document shape (collection: "photos"):
 *   {
 *     url:         string    — Cloudinary CDN URL
 *     publicId:    string    — Cloudinary public ID (for future admin use)
 *     name:        string    — original filename
 *     uid:         string    — uploader Firebase UID
 *     displayName: string    — uploader display name
 *     photoURL:    string    — uploader Google avatar URL
 *     createdAt:   Timestamp — server timestamp
 *   }
 */
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

const CLOUD_NAME     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET  = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const UPLOAD_URL     = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

/**
 * uploadPhoto — uploads one image to Cloudinary then saves its
 * metadata to Firestore.
 *
 * We use XMLHttpRequest instead of fetch() because XHR exposes
 * xhr.upload.onprogress which fires repeatedly during the upload,
 * letting us update the progress bar. fetch() only resolves once
 * the entire response is received — no in-between progress events.
 *
 * @param {File}     file       — the File object from <input type="file">
 * @param {object}   user       — Firebase User (uid, displayName, photoURL)
 * @param {Function} onProgress — callback(percent: 0–100)
 * @returns {Promise<void>}
 */
export function uploadPhoto(file, user, onProgress) {
  return new Promise((resolve, reject) => {
    /* FormData is the standard way to send files via HTTP. */
    const formData = new FormData()
    formData.append('file', file)
    /* upload_preset tells Cloudinary which preset rules to apply.
       Our preset is set to Unsigned so no API secret is needed. */
    formData.append('upload_preset', UPLOAD_PRESET)
    /* Optional: organise all uploads into a folder in Cloudinary. */
    formData.append('folder', 'luminary')

    const xhr = new XMLHttpRequest()

    /* Progress event — fires many times as bytes are transferred. */
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    /* Completion handler. */
    xhr.onload = async () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText)

          /* Save metadata to Firestore. addDoc generates the document ID. */
          await addDoc(collection(db, 'photos'), {
            url:         result.secure_url,   /* permanent HTTPS CDN URL */
            publicId:    result.public_id,    /* Cloudinary asset identifier */
            name:        file.name,
            uid:         user.uid,
            displayName: user.displayName ?? 'Anonymous',
            photoURL:    user.photoURL    ?? '',
            createdAt:   serverTimestamp(),
          })

          resolve()
        } catch (err) {
          reject(err)
        }
      } else {
        reject(new Error(`Cloudinary upload failed: ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))

    xhr.open('POST', UPLOAD_URL)
    xhr.send(formData)
  })
}

/**
 * deletePhoto — removes a photo's Firestore document.
 *
 * This removes the photo from the gallery immediately (onSnapshot fires).
 * The Cloudinary file is not deleted client-side — see file header for why.
 *
 * @param {object} photo — Firestore photo document (needs .id)
 */
export async function deletePhoto(photo) {
  await deleteDoc(doc(db, 'photos', photo.id))
}
