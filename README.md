# ChillTask

A minimal dark-themed task tracker for students.

## Setup

### 1. Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. **Authentication**: Enable Email/Password and Google sign-in
4. **Firestore**: Create a database in test mode
5. **Project Settings**: Register a web app, copy the config values
6. Create a `.env` file based on `.env.example` with your Firebase config:

```
cp .env.example .env
```

7. Edit `.env` and fill in your Firebase values:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

### 2. Deploy Security Rules

After setting up Firestore:

```bash
npm install -g firebase-tools
firebase login
firebase init  # select Firestore, use existing project
```

Copy `firestore.rules` to the Firebase project root and deploy:

```bash
firebase deploy --only firestore:rules
```

### 3. Run

```bash
npm install
npm run dev
```

App runs at http://localhost:3000

### 4. Build for Production

```bash
npm run build
```

Output goes to `dist/` — deploy to GitHub Pages, Netlify, Vercel, etc.

### 5. Desktop App (Windows)

```bash
npm run tauri build
```

Requires Rust toolchain. Output: `src-tauri/target/release/ChillTask.exe`

## Tech Stack

- React + Vite + TypeScript
- Firebase Auth + Firestore
- PWA (installable on Android)
- Tauri (Windows desktop)
- GitHub Pages hosting
