# Luminary — Firebase Photo Gallery

> A personal photo gallery built with React 18 and Firebase. Upload photos from your device, view them in a responsive masonry grid, open full-size in a lightbox, and delete your own — all synced in real time across devices.

---

## Features

- **Google sign-in** — Firebase Auth with session persistence (stay logged in across refreshes)
- **Drag-and-drop upload** — drop files onto the zone or click to browse; multiple files upload in parallel
- **Per-file progress bars** — `uploadBytesResumable` streams progress events; each file gets its own animated bar
- **Real-time masonry grid** — Firestore `onSnapshot` listener; new photos appear instantly without refresh
- **CSS columns masonry** — no JS layout library; variable image heights handled natively
- **Lightbox viewer** — full-screen view with prev/next navigation via arrows, left/right click zones, or keyboard (← →)
- **Owner-only delete** — delete button visible only on your own photos; enforced in Firestore + Storage rules
- **Two-click delete confirm** — first click prompts, second confirms; prevents accidental deletion
- **Loading skeletons** — shimmer placeholder cards while the first Firestore snapshot loads
- **Keyboard accessible** — full focus ring, Escape closes lightbox, Enter opens cards
- **Error boundary** — root-level boundary catches render errors with a recoverable fallback
- **Code-split bundle** — Firebase auth/firestore split into separate cacheable chunks via Vite `manualChunks`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | CSS Modules + CSS custom properties |
| Fonts | Cormorant Garamond (display) + DM Sans (UI) |
| Auth | Firebase Authentication — Google OAuth |
| Database | Cloud Firestore — real-time `onSnapshot` listener |
| File storage | Firebase Storage — `uploadBytesResumable` |
| State | `useState` + `useEffect` + `useCallback` + React Context |
| Custom hook | `usePhotos` — Firestore real-time listener + delete |

---

## Project Structure

```
project-03-photo-gallery/
├── src/
│   ├── firebase/
│   │   ├── config.js        # initializeApp — exports auth, db, storage
│   │   ├── auth.js          # signInWithGoogle, signOut helpers
│   │   └── storage.js       # uploadPhoto (Storage + Firestore write), deletePhoto
│   ├── context/
│   │   └── AuthContext.jsx  # onAuthStateChanged → React Context for user state
│   ├── hooks/
│   │   └── usePhotos.js     # onSnapshot real-time listener, deletePhoto
│   ├── components/
│   │   ├── Login/           # Google sign-in card
│   │   ├── Header/          # Sticky bar with wordmark, upload button, user menu
│   │   ├── Uploader/        # Drag-drop zone + per-file progress bars
│   │   ├── PhotoCard/       # Masonry card with hover overlay + delete guard
│   │   ├── PhotoGrid/       # CSS columns masonry + loading skeletons
│   │   └── Lightbox/        # Full-screen viewer with keyboard navigation
│   ├── styles/
│   │   └── global.css       # Design tokens, reset, animations
│   ├── App.jsx              # AuthProvider wrapper, lightbox state, auth gating
│   └── main.jsx
├── .env                     # Firebase config (not committed)
├── .env.example             # Template — copy to .env and fill in values
├── index.html               # Google Fonts: Cormorant Garamond + DM Sans
└── package.json             # firebase@^10
```

---

## Firebase Setup (required before running)

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Name it (e.g. `luminary-gallery`), disable Analytics if not needed → Create

### 2. Enable Google Authentication

**Authentication** → Get started → Sign-in method → **Google** → Enable → Save

### 3. Enable Firestore

**Firestore Database** → Create database → **Start in test mode** → Choose a region → Done

### 4. Enable Storage

**Storage** → Get started → **Start in test mode** → Done

### 5. Register a web app and get config

**Project Settings** (gear icon) → Your apps → Add app → Web (</>) → Register

Copy the `firebaseConfig` object — you need these 6 values.

### 6. Add config to `.env`

```bash
cp .env.example .env
```

Fill in your values:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 7. Set security rules (when ready for production)

**Firestore rules** (Firestore → Rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /photos/{photoId} {
      // Any signed-in user can read all photos
      allow read: if request.auth != null;
      // Only the uploader can create a document with their own uid
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.uid;
      // Only the owner can delete their own photo document
      allow delete: if request.auth != null
                    && request.auth.uid == resource.data.uid;
    }
  }
}
```

**Storage rules** (Storage → Rules):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{userId}/{allPaths=**} {
      // Any signed-in user can read
      allow read: if request.auth != null;
      // Only the owner can write to their own folder
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Getting Started

```bash
cd project-03-photo-gallery
npm install
# Set up .env with your Firebase config (see above)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Firebase Concepts Used

### Auth — `onAuthStateChanged`

```js
// Fires immediately with persisted session, then on every sign-in/out
const unsubscribe = onAuthStateChanged(auth, (user) => {
  setUser(user) // null if signed out
})
return unsubscribe // cleanup in useEffect
```

### Firestore — `onSnapshot` (real-time)

```js
// Unlike getDocs() (one-time), onSnapshot fires whenever data changes
const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'))
const unsubscribe = onSnapshot(q, (snapshot) => {
  const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  setPhotos(photos)
})
```

### Storage — `uploadBytesResumable`

```js
const task = uploadBytesResumable(storageRef, file)
task.on('state_changed',
  (snap) => setProgress((snap.bytesTransferred / snap.totalBytes) * 100),
  (err)  => console.error(err),
  async () => {
    const url = await getDownloadURL(task.snapshot.ref)
    // save url to Firestore
  }
)
```

### React Context — auth state without prop drilling

```js
// AuthProvider wraps the app; any component can call:
const { user, loading } = useAuth()
// No props needed — reads directly from Context
```

---

## Firestore Data Shape

```
photos/ (collection)
  {auto-id}/ (document)
    url:         string     — Firebase Storage download URL
    storagePath: string     — Storage path (needed for file deletion)
    name:        string     — original filename
    uid:         string     — uploader's Firebase UID
    displayName: string     — uploader's Google display name
    photoURL:    string     — uploader's Google avatar URL
    createdAt:   Timestamp  — server timestamp (for ordering)
```

---

## Status

> Core features complete. Next: image compression before upload, album/folder grouping, public sharing links.

---

## License

MIT
