# StudyTrack — Student Assignment Tracker

A fully client-side student assignment tracker. No backend, no database. All data is stored in the browser via Local Storage, so it deploys cleanly to GitHub Pages or any static host.

## Tech
- HTML5, CSS3, JavaScript (ES6)
- Bootstrap 5 + Bootstrap Icons
- FullCalendar 6
- Chart.js 4
- Local Storage

## Pages
- `dashboard.html` — stats, progress, charts, deadline alerts
- `courses.html` — manage courses (CRUD)
- `assignments.html` — manage assignments with search, filter, sort, CSV export
- `calendar.html` — monthly calendar of deadlines (color by priority)
- `reports.html` — pie & bar charts, completion rate
- `about.html` — project info

## File Structure

    tracker/
    ├── index.html
    ├── dashboard.html
    ├── courses.html
    ├── assignments.html
    ├── calendar.html
    ├── reports.html
    ├── about.html
    ├── css/style.css
    ├── js/storage.js
    ├── js/app.js
    ├── js/courses.js
    ├── js/assignments.js
    ├── js/calendar.js
    └── js/reports.js

## Run locally
Open `dashboard.html` directly, or serve the folder with `npx serve .`.

## Deploy to GitHub Pages
1. Create a GitHub repo and push the contents of this `tracker/` folder to the repo root.
2. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`.
3. Open `https://<user>.github.io/<repo>/dashboard.html`.

## Features
- Dashboard stats: courses, assignments, completed, pending, overdue, progress %
- Progress bar + doughnut chart
- Deadline alerts (overdue, today, tomorrow, upcoming)
- Course CRUD with per-course progress
- Assignment CRUD with priority and status
- Search, filter (course / priority / status), sort (due / priority / title)
- Quick "mark complete" toggle
- FullCalendar monthly view; click event for details; color-coded by priority
- Reports: status pie, per-course bar, priority distribution
- Dark mode toggle (persisted)
- CSV export of assignments
- JSON backup &amp; restore
- Toast notifications
- Responsive sidebar with mobile drawer