# Chill Task Tracker — Design Spec

## Overview

A minimal dark-themed task tracker for a student. Tasks have a title and deadline, grouped by school subject. Tasks exist in one of two states: **Active** (being worked on in the current focus session) or **Backlog** (waiting to be started). Tasks leave the system via **Archiving** — either marked as done or as skipped ("didn't do"). Archived tasks are browsable by week/month with completion status. Real-time sync across web, Android PWA, and desktop via Firebase.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Charts | Recharts |
| Styling | CSS (minimal, dark theme) |
| PWA | Installable on Android |
| Desktop | Tauri (Windows .exe, same web build) |
| Hosting | GitHub Pages |
| Database | Firebase Firestore (real-time sync) |

---

## Navigation

Left sidebar — persistent across all views:
- **Home** — dashboard
- **Group tabs** — one per subject, dynamically populated
- **Archived** — completion history
- **Stats** — all-time statistics with graphs
- **Settings** — manage groups

---

## Views

### Home (Dashboard)

```
┌──────────────────────────────────────────────────────┐
│ [Sidebar]  │        Active Tasks (main)      │ Right │
│ Home       │  ┌────────────────────────────┐ │ Backlog│
│ Math       │  │ [task] [task] [task]        │ │ all    │
│ History    │  │  (flat or grouped toggle)   │ │ tasks  │
│ Physics    │  └────────────────────────────┘ │ sorted │
│ ...        │                                   │ by     │
│ ──────     │                                   │ deadline│
│ Archived   │                                   │        │
│ Settings   │                                   │        │
└──────────────────────────────────────────────────────┘
```

- **Main (left/center)**: All active tasks. Toggle grouping by:
  - Subject
  - Date
  - Deadline proximity
  - Flat (no grouping)
- **Right panel**: All backlog tasks across all groups, sorted by deadline ascending
- Empty states: Motivational messages when no active tasks ("Pick something to focus on!") or no backlog tasks ("Everything's done! Time to relax. 🎉")

### Group Tab (per subject)

```
┌──────────────────────────────────────────────────────┐
│ [Sidebar]  │        Active (top)             │ Right │
│ Home       │  ┌────────────────────────────┐ │ Summary│
│ Math    ←  │  │ [task] [task]               │ │ tasks  │
│ History    │  └────────────────────────────┘ │ done   │
│ Physics    │        Backlog (bottom)         │ this   │
│            │  ┌────────────────────────────┐ │ week   │
│            │  │ [task]                     │ │ etc    │
│            │  │ [task]                     │ │        │
│            │  └────────────────────────────┘ │        │
└──────────────────────────────────────────────────────┘
```

- **Main top**: Active tasks for this group
- **Main bottom**: Backlog for this group, sorted by deadline
- **Right panel**: Group stats — total tasks, active count, backlog count, tasks done this week, upcoming deadlines
- Empty state: Motivational message like "All clear! Add a task to get started."

### Stats

- **Sub-tabs**: 7 days / 30 days / All time
  - 7 days: daily breakdown
  - 30 days: weekly breakdown
  - All time: monthly breakdown
- **Stats displayed** (all computed from `tasks` collection, filtered by `archivedAt`):
  - **Completion rate** — bar chart (done vs skipped per period)
  - **Productivity streak** — streak counter + calendar heatmap (GitHub-style, days with completed tasks highlighted)
  - **Group breakdown** — donut chart (tasks per subject)
  - **Deadline adherence** — stacked bar (on-time vs late)
  - **Volume** — dual bar chart (tasks added vs completed per period)
  - **Tasks Added** — bar chart (tasks created per period; v1 simplification of "active sessions" tracking)
- **Charting**: Recharts library
- **Layout**: Grid of stat cards, each with title + chart + optional summary number
- **Empty state**: "No data yet — complete some tasks to see your stats!"

---

### Archived

- Tasks grouped by **week** or **month** (toggleable)
- Shows `archivedAt` timestamp on each task
- Groups use calendar weeks (Mon–Sun) with headers like "This Week", "Last Week", "March 2026"
- Filter tabs: **All** / **Done** / **Skipped**
- Empty state: Motivational message like "Nothing here yet — go crush some tasks!"

### Settings

- **Create group** — add a new subject
- **Rename group** — edit name
- **Delete group** — moves all its tasks to "Uncategorized" (no subject)
- **Sign out** — clears local Firebase cache, data persists in Firestore and re-syncs on next sign-in

---

## Data Model (Firestore)

### Task
```typescript
{
  id: string;           // auto-generated
  title: string;        // required
  deadline: string;     // ISO date string, optional
  groupId: string | null; // null = Uncategorized
  isActive: boolean;    // true = in the shared focus session
  isArchived: boolean;  // true = moved to archived
  archiveStatus: 'done' | 'skipped' | null; // how it was archived
  archivedAt: string | null; // ISO timestamp when archived
  createdAt: string;    // ISO timestamp
}
```

### Group
```typescript
{
  id: string;           // auto-generated
  name: string;         // e.g., "Math", "History"
  order: number;       // sidebar sort order
}
```

### Firestore Collections
- `tasks` — all task documents
- `groups` — all group documents

### Rules
- Personal app — single authenticated user (email/password or Google sign-in via Firebase Auth)
- User can only read/write their own data (Firestore security rules by UID)

---

## Firebase Setup

- **Auth**: Firebase Authentication (email/password + Google sign-in)
- **Database**: Cloud Firestore
- **Free tier**: 1GB storage, 50K reads, 20K writes, 20K deletes per day — more than enough for a personal todo app

---

## Offline & Sync

- Firestore handles real-time sync automatically across web, PWA, and desktop
- Offline writes queue locally and sync when back online
- No manual export/import needed

---

## PWA

- Service worker for offline caching of app shell
- App data lives in Firestore (syncs when online)
- Installable on Android via "Add to Home Screen"

---

## Design Language

- **Theme**: Minimal dark — dark background, muted text, subtle borders
- **Colors**: Dark grays (#1a1a2e, #16213e, etc.), accent color for active states (e.g., soft blue or teal)
- **Typography**: Clean sans-serif (system font stack)
- **Layout**: Left sidebar (navigation) + main area + optional right panel
- **Interactions**: Add task, inline-edit title/deadline/group, toggle active, complete, skip, delete. No complex drag-and-drop unless needed.
- **Task editing**: Inline editing — click title or deadline to edit in place. No modal/panel needed.
- **Task actions**: Each task card has actions on hover/focus — mark done (→ archived, status: done), mark skipped (→ archived, status: skipped), add to active / remove from active, delete (→ archived, status: skipped), edit.
- **Group deletion**: If the last group is deleted, tasks move to Uncategorized. "Uncategorized" is not a deletable group — it always exists as `groupId: null`.

---

## Scope for v1

- Auth (sign up, sign in, sign out)
- Group management (create, rename, delete — "Uncategorized" is always present)
- Task CRUD (add, inline-edit title/deadline/group, delete)
- Active session management (add/remove tasks from active, from anywhere)
- Mark done (→ archived, status: done)
- Mark skipped / delete (→ archived, status: skipped)
- Home dashboard with active grouping toggles
- Group tabs with local active/backlog + stats panel
- Archived view (grouped by week/month, filterable by status)
- Stats page with charts (Recharts) — 6 stat types across 3 time ranges
- Motivational empty states across all views
- PWA installable on Android
- Tauri desktop build for Windows
- Firebase sync (real-time, offline-capable)
- Dark minimal theme
