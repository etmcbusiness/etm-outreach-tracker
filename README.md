# ETM Outreach Tracker

A retro CRT-styled daily outreach tracker (Email / DM / Video Upload) with a session timer, daily tally, persistent session history, and per-tracker analytics. Installable as a PWA on iOS & Android.

## Features

- **Three trackers**: Email Tally, DM Tally, Video Upload Tally — switch with the tabs at the top.
- **Session timer** with millisecond precision; autostarts on the first `+` click.
- **Today's tally** panel in the top-right shows daily counts for all three trackers; resets at midnight without ever deleting saved session history.
- **Analytics view** per tracker: totals, average gap between tallies, scrollable session table, and a dual-axis line chart of activity over time.
- **Email-used selector** for email sessions (`contact@etmcleaning.com`, `inquiries@etmcleaning.com`, `peter@etm-cleaning.com`) — recorded with each saved session.
- **Persistence**:
  - `localStorage` by default
  - "Save to File" (Chrome / Edge): autosave to a local JSON file via the File System Access API
  - Universal Export / Import buttons for backups across browsers / devices
- **Installable PWA**: works offline once installed, full-screen launch from home screen, respects iOS notches.

## Run locally

Just open `index.html` in any modern browser. No build step.

> Note: PWA installability and the service worker only activate when served over `https://` (or `http://localhost`). Opening from `file://` still works for everyday use, but you can't "Install" it.

## Hosted version

This repo is published as a static site via GitHub Pages.

## Mobile install

After visiting the live site:

- **iPhone (Safari)**: Share button → "Add to Home Screen".
- **Android (Chrome)**: 3-dot menu → "Install app" / "Add to Home Screen".

The icon used is `icon.png` (replace it to change the home-screen icon).

## File layout

| File | Purpose |
| --- | --- |
| `index.html` | The entire app (HTML + CSS + JS in one file) |
| `manifest.webmanifest` | PWA manifest (name, theme, icons) |
| `sw.js` | Service worker (offline app shell) |
| `icon.png` | Primary launcher icon (512x512) |
| `icon.svg` | Vector fallback / mask icon |

## License

Personal project — no license declared.
