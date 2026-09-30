# QX — Folio

A reading-progress tracker prototype ("Strava for reading"): log reading sessions, track streaks and per-book progress, and share activity with friends via a kudos-based feed.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

## What's here

- `src/FolioApp.jsx` — the full app (feed, library, session logging, profile/stats), all in-memory state for now
- `src/main.jsx` — React entry point
- No backend yet — see project discussion for the planned data model (users, books, reading_sessions, follows, kudos) and sync approach
