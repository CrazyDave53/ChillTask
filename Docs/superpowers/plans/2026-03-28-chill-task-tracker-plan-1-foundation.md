# Chill Task Tracker — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the project, set up Firebase, implement auth, build the data layer, and create the app shell with sidebar navigation and routing. After this plan, the app builds, runs, and shows the shell UI.

**Architecture:** React + Vite + TypeScript SPA. Firebase Auth + Firestore. React Router for navigation. CSS variables for theming. All Firestore reads/writes go through custom hooks. Auth state managed via React Context.

**Tech Stack:** React, Vite, TypeScript, Firebase (Auth + Firestore), React Router, Recharts, Tauri

---

## File Structure

```
src/
├── main.tsx                  # Entry point
├── App.tsx                   # Root component, routing, auth gate
├── lib/
│   └── firebase.ts           # Firebase init, auth, db exports
├── contexts/
│   └── AuthContext.tsx       # Auth state provider
├── hooks/
│   ├── useTasks.ts           # Tasks CRUD + real-time listener
│   └── useGroups.ts          # Groups CRUD + real-time listener
├── components/
│   ├── Sidebar.tsx           # Left navigation sidebar
│   ├── Layout.tsx            # Shell: sidebar + main + right panel
│   └── Auth/
│       ├── SignIn.tsx
│       └── SignUp.tsx
├── pages/
│   ├── Home.tsx              # Dashboard — stub for now
│   ├── Group.tsx             # Group tab — stub
│   ├── Archived.tsx          # Archived — stub
│   ├── Stats.tsx             # Stats — stub
│   └── Settings.tsx          # Settings — stub
└── styles/
    └── main.css              # Dark theme CSS variables + base styles
```

---

## Tasks

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`
- Create: `.gitignore`
- Create: `src/App.tsx`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "chill-task-tracker",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "firebase": "^10.13.2",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.2",
    "@tauri-apps/cli": "^1.6.2",
    "@tauri-apps/api": "^1.6.0"
  }
}
```

Run: `npm install`

- [ ] **Step 2: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1a1a2e" />
    <title>Chill Task</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#1a1a2e"/>
  <text x="16" y="22" font-size="18" text-anchor="middle" fill="#0ea5e9">✓</text>
</svg>
```

- [ ] **Step 7: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 8: Create `src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 9: Create `src/styles/main.css`** (dark theme shell)

```css
:root {
  --bg-primary: #0f0f1a;
  --bg-secondary: #1a1a2e;
  --bg-tertiary: #16213e;
  --bg-card: #1e1e32;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border: #2d2d4a;
  --accent: #0ea5e9;
  --accent-hover: #38bdf8;
  --success: #22c55e;
  --danger: #ef4444;
  --warning: #f59e0b;
  --sidebar-width: 220px;
  --right-panel-width: 280px;
  --radius: 8px;
  --radius-sm: 4px;
  --radius-lg: 12px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.5;
}

#root {
  display: flex;
  min-height: 100vh;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

/* Buttons */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  outline: none;
}

/* Inputs */
input, select, textarea {
  font-family: inherit;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  outline: none;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--accent);
}

/* Utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 10: Run dev server**

Run: `npm run dev`
Expected: App loads at localhost:3000 with dark background

- [ ] **Step 11: Commit**

```bash
git init
git add package.json vite.config.ts tsconfig.json tsconfig.node.json index.html src/main.tsx src/vite-env.d.ts src/styles/main.css public/favicon.svg .gitignore
git commit -m "chore: scaffold Vite + React + TypeScript project with dark theme"
```

---

### Task 2: Firebase Setup

**Files:**
- Create: `src/lib/firebase.ts`
- Create: `.env.example`

- [ ] **Step 1: Create `.env.example`**

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

- [ ] **Step 2: Create `src/lib/firebase.ts`**

```ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

- [ ] **Step 3: Add `.env` handling note in README (or create placeholder `.env` for dev)**

Create `src/config/firebase.example.ts` as a copy with placeholder values for local dev setup documentation. Document the Firebase console setup steps:
1. Create a Firebase project
2. Enable Authentication (Email/Password + Google)
3. Create Firestore database (start in test mode, add security rules later)
4. Copy config values to `.env`

- [ ] **Step 4: Commit**

```bash
git add src/lib/firebase.ts .env.example
git commit -m "feat: add Firebase configuration"
```

---

### Task 3: Auth Context & Pages

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Create: `src/components/Auth/SignIn.tsx`
- Create: `src/components/Auth/SignUp.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/contexts/AuthContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const signUp = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

- [ ] **Step 2: Create `src/components/Auth/SignUp.tsx`**

```tsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function SignUp() {
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(email, password);
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <button className="auth-google" onClick={signInWithGoogle} disabled={loading}>
          Sign up with Google
        </button>
        <p className="auth-switch">
          Already have an account? <a href="/signin">Sign in</a>
        </p>
      </div>
      <style>{`
        .auth-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
        }
        .auth-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          width: 100%;
          max-width: 360px;
        }
        .auth-card h1 {
          font-size: 1.5rem;
          margin-bottom: 24px;
          text-align: center;
        }
        .auth-card form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .auth-card input {
          width: 100%;
        }
        .auth-card button {
          width: 100%;
          padding: 10px;
          background: var(--accent);
          color: white;
          border-radius: var(--radius-sm);
          font-weight: 500;
          transition: background 0.2s;
        }
        .auth-card button:hover:not(:disabled) {
          background: var(--accent-hover);
        }
        .auth-card button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-google {
          margin-top: 12px;
          background: var(--bg-tertiary) !important;
          border: 1px solid var(--border) !important;
        }
        .auth-error {
          color: var(--danger);
          font-size: 0.875rem;
        }
        .auth-switch {
          margin-top: 16px;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .auth-switch a {
          color: var(--accent);
          text-decoration: none;
        }
        .auth-switch a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/Auth/SignIn.tsx`**

Same structure as SignUp, but:
- Title: "Welcome Back"
- Button: "Sign In"
- Calls `signIn(email, password)`
- Link: "Don't have an account? Sign up" → `/signup`

```tsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function SignIn() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <button className="auth-google" onClick={signInWithGoogle} disabled={loading}>
          Sign in with Google
        </button>
        <p className="auth-switch">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
      <style>{`
        .auth-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          width: 100%;
        }
        .auth-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          width: 100%;
          max-width: 360px;
        }
        .auth-card h1 {
          font-size: 1.5rem;
          margin-bottom: 24px;
          text-align: center;
        }
        .auth-card form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .auth-card input {
          width: 100%;
        }
        .auth-card button {
          width: 100%;
          padding: 10px;
          background: var(--accent);
          color: white;
          border-radius: var(--radius-sm);
          font-weight: 500;
          transition: background 0.2s;
        }
        .auth-card button:hover:not(:disabled) {
          background: var(--accent-hover);
        }
        .auth-card button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .auth-google {
          margin-top: 12px;
          background: var(--bg-tertiary) !important;
          border: 1px solid var(--border) !important;
        }
        .auth-error {
          color: var(--danger);
          font-size: 0.875rem;
        }
        .auth-switch {
          margin-top: 16px;
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .auth-switch a {
          color: var(--accent);
          text-decoration: none;
        }
        .auth-switch a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/App.tsx` with routing and auth gate**

```tsx
import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Layout } from './components/Layout';
import { SignIn } from './components/Auth/SignIn';
import { SignUp } from './components/Auth/SignUp';
import { Home } from './pages/Home';
import { Archived } from './pages/Archived';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';

function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/*"
        element={
          <AuthGate>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/group/:groupId" element={<Home />} />
                <Route path="/archived" element={<Archived />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </AuthGate>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

- [ ] **Step 5: Add loading screen style to `src/styles/main.css`**

```css
.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  color: var(--text-secondary);
  font-size: 1.125rem;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/contexts/AuthContext.tsx src/components/Auth/SignIn.tsx src/components/Auth/SignUp.tsx src/App.tsx
git commit -m "feat: add auth context and sign in/up pages"
```

---

### Task 4: Data Layer — Groups & Tasks

**Files:**
- Create: `src/types/index.ts`
- Create: `src/hooks/useGroups.ts`
- Create: `src/hooks/useTasks.ts`

- [ ] **Step 1: Create `src/types/index.ts`**

```ts
export interface Task {
  id: string;
  title: string;
  deadline: string | null;
  groupId: string | null;
  isActive: boolean;
  isArchived: boolean;
  archiveStatus: 'done' | 'skipped' | null;
  archivedAt: string | null;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  order: number;
}

export type GroupingMode = 'subject' | 'date' | 'deadline' | 'flat';
export type ArchivePeriod = 'week' | 'month';
export type ArchiveFilter = 'all' | 'done' | 'skipped';
export type StatsPeriod = '7d' | '30d' | 'all';
```

- [ ] **Step 2: Create `src/hooks/useGroups.ts`**

```ts
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Group } from '../types';
import { Timestamp } from 'firebase/firestore';

function parseDoc<T extends Record<string, any>>(data: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'groups'),
      where('userId', '==', user.uid),
      orderBy('order', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...parseDoc(d.data()) } as Group))
        .filter((g) => g.userId === user.uid); // client-side guard
      setGroups(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addGroup = async (name: string) => {
    if (!user) return;
    const maxOrder = groups.reduce((m, g) => Math.max(m, g.order), -1);
    await addDoc(collection(db, 'groups'), {
      name,
      order: maxOrder + 1,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const renameGroup = async (id: string, name: string) => {
    await updateDoc(doc(db, 'groups', id), { name });
  };

  const deleteGroup = async (id: string) => {
    await deleteDoc(doc(db, 'groups', id));
  };

  const reorderGroups = async (reordered: Group[]) => {
    const batch = reordered.map((g, i) =>
      updateDoc(doc(db, 'groups', g.id), { order: i })
    );
    await Promise.all(batch);
  };

  return { groups, loading, addGroup, renameGroup, deleteGroup, reorderGroups };
}
```

- [ ] **Step 3: Create `src/hooks/useTasks.ts`**

```ts
import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../types';

function parseDoc<T extends Record<string, any>>(data: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate().toISOString();
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...parseDoc(d.data()) } as Task));
      setTasks(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const addTask = async (title: string, deadline: string | null, groupId: string | null) => {
    if (!user) return;
    await addDoc(collection(db, 'tasks'), {
      title,
      deadline,
      groupId,
      isActive: false,
      isArchived: false,
      archiveStatus: null,
      archivedAt: null,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await updateDoc(doc(db, 'tasks', id), updates);
  };

  const toggleActive = async (task: Task) => {
    await updateDoc(doc(db, 'tasks', task.id), { isActive: !task.isActive });
  };

  const archiveTask = async (task: Task, status: 'done' | 'skipped') => {
    await updateDoc(doc(db, 'tasks', task.id), {
      isArchived: true,
      archiveStatus: status,
      archivedAt: new Date().toISOString(),
      isActive: false,
    });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const moveToUncategorized = async (groupId: string) => {
    const tasksToMove = tasks.filter((t) => t.groupId === groupId);
    const batch = tasksToMove.map((t) =>
      updateDoc(doc(db, 'tasks', t.id), { groupId: null })
    );
    await Promise.all(batch);
  };

  return { tasks, loading, addTask, updateTask, toggleActive, archiveTask, deleteTask, moveToUncategorized };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/hooks/useGroups.ts src/hooks/useTasks.ts
git commit -m "feat: add data layer with Firestore hooks for tasks and groups"
```

---

### Task 5: App Shell — Sidebar & Layout

**Files:**
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/Layout.tsx`

- [ ] **Step 1: Create `src/components/Sidebar.tsx`**

```tsx
import { NavLink, useParams } from 'react-router-dom';
import { useGroups } from '../hooks/useGroups';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar() {
  const { groups } = useGroups();
  const { signOut } = useAuth();
  const { groupId } = useParams();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">✓</span>
        <span className="sidebar-title">ChillTask</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive && !groupId ? 'active' : ''}`}>
          <span className="nav-icon">🏠</span>
          Home
        </NavLink>

        <div className="nav-divider" />

        {groups.map((g) => (
          <NavLink
            key={g.id}
            to={`/group/${g.id}`}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">📚</span>
            {g.name}
          </NavLink>
        ))}

        <div className="nav-divider" />

        <NavLink to="/archived" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📦</span>
          Archived
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📊</span>
          Stats
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">⚙️</span>
          Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item sign-out" onClick={signOut}>
          <span className="nav-icon">🚪</span>
          Sign Out
        </button>
      </div>

      <style>{`
        .sidebar {
          width: var(--sidebar-width);
          min-height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 20px 16px;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-logo {
          font-size: 1.25rem;
        }
        .sidebar-title {
          font-weight: 600;
          font-size: 1.125rem;
        }
        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: background 0.15s, color 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .nav-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        .nav-item.active {
          background: var(--bg-tertiary);
          color: var(--accent);
        }
        .nav-icon {
          font-size: 1rem;
          width: 20px;
          text-align: center;
        }
        .nav-divider {
          height: 1px;
          background: var(--border);
          margin: 8px 12px;
        }
        .sidebar-footer {
          padding: 12px 8px;
          border-top: 1px solid var(--border);
        }
        .sign-out:hover {
          color: var(--danger);
        }
      `}</style>
    </aside>
  );
}
```

- [ ] **Step 2: Create `src/components/Layout.tsx`**

```tsx
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
      <style>{`
        .app-layout {
          display: flex;
          width: 100%;
          min-height: 100vh;
        }
        .main-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 3: Update `src/App.tsx`** — replace the inline Layout import with the actual file import (already done in the App.tsx above, just verify)

- [ ] **Step 4: Commit**

```bash
git add src/components/Sidebar.tsx src/components/Layout.tsx
git commit -m "feat: add sidebar navigation and app layout shell"
```

---

### Task 6: Page Stubs

**Files:**
- Create: `src/pages/Home.tsx` (stub)
- Create: `src/pages/Archived.tsx` (stub)
- Create: `src/pages/Stats.tsx` (stub)
- Create: `src/pages/Settings.tsx` (stub)

- [ ] **Step 1: Create `src/pages/Home.tsx`** — stub with just a heading

```tsx
export function Home() {
  return <div className="page"><h1>Home</h1></div>;
}
```

- [ ] **Step 2: Create `src/pages/Archived.tsx`** — stub

```tsx
export function Archived() {
  return <div className="page"><h1>Archived</h1></div>;
}
```

- [ ] **Step 3: Create `src/pages/Stats.tsx`** — stub

```tsx
export function Stats() {
  return <div className="page"><h1>Stats</h1></div>;
}
```

- [ ] **Step 4: Create `src/pages/Settings.tsx`** — stub

```tsx
export function Settings() {
  return <div className="page"><h1>Settings</h1></div>;
}
```

- [ ] **Step 5: Add page styles to `src/styles/main.css`**

```css
.page {
  max-width: 1200px;
}
.page h1 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/Home.tsx src/pages/Archived.tsx src/pages/Stats.tsx src/pages/Settings.tsx
git commit -m "chore: add page stubs for all views"
```

---

### Task 7: Build & Verify

- [ ] **Step 1: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Verify dev server starts**

Run: `npm run dev`
Expected: App starts on localhost:3000, shows dark page with sidebar

- [ ] **Step 3: Create Firebase setup guide** — document the exact steps to set up Firebase:
1. Go to console.firebase.google.com
2. Create project → enable Authentication (Email/Password + Google)
3. Create Firestore database → start in test mode
4. Register web app → copy config
5. Add config to `.env`
6. Run `npm run dev` and test sign up/sign in

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify build and add Firebase setup docs"
```

---

## After Plan 1

After completing this plan, the app will:
- Build and run with `npm run dev`
- Auth (sign up, sign in, sign out, Google sign-in) works
- Sidebar navigation renders
- Firestore connection established
- Data hooks are ready for Plan 2

**Go to Plan 2: Views & UI** to implement all the actual pages and task management.
