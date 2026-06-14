# Calendar

A completely dark themed Windows calendar hub focused on a large month grid, episode/show release tracking, ordinary personal/work scheduling, and quick filtering. The calendar is the primary surface, with event pills inside each uniformly separated day cell and supporting controls around it.

## Features

- Large month-first calendar layout with week, multi-month, and year-at-a-glance views.
- Previous/next arrow navigation for weeks, months, multi-month blocks, and years.
- Add events from the global plus button or by selecting a date and using the selected-day add button.
- One-time, daily repeating, and weekly repeating events.
- Repeating events can be populated by total episode/event count or by an end date.
- Categories for anime, movies, shows, personal, and work.
- Search across event titles, notes, and categories.
- Optional event-days-only mode.
- Settings for accent color, week start day, and dense calendar cells.

## Run locally

```bash
npm run build
npm run dev
```

Open <http://localhost:4173> for the static preview.

## Build a Windows EXE

On a Windows machine with Node.js installed:

```bash
npm install
npm run dist:win
```

The Electron Builder configuration emits NSIS installer and portable Windows targets into `release/`.
