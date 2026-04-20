# Photo Lab Finder

Photo Lab Finder is an NYC-only web app for discovering and comparing photography labs by borough, neighborhood, ZIP code, and current location. It uses live Google Places data, supports a Google Maps-driven search experience, and lets users save labs locally with personal notes.

## What it demonstrates

- API usage
- filtering and search
- async loading, empty, and error states
- reusable React components
- polished mobile-friendly frontend UX

## Core features

- Search by borough, neighborhood, ZIP, or current location
- Live Google Places autocomplete and map results
- Filter by services such as develop, scan, prints, and same-day turnaround
- Map + list layout with synced results
- Lab detail pages
- Local favorites and saved-lab list
- Personal notes stored in local browser storage
- Google place photos when available

## Tech stack

- Frontend: React, Vite, TypeScript
- UI routing: React Router DOM
- Google Maps integration: `@react-google-maps/api`
- Maps: Google Maps JavaScript API
- Places data: Google Places API (New)
- Secondary places source: Foursquare Places API
- Backend: Node.js, Express
- Database: MongoDB
- Local state persistence: browser localStorage
- Dev workflow: concurrently

## Architecture

- `src/` contains the React frontend
- `server/` contains the Express API
- The app is NYC-only by design
- Live providers are queried first, then cached in MongoDB
- There is no seeded fallback dataset in the current flow

## Environment variables

Create a `.env` file from `.env.example` and set the values you need:

- `GOOGLE_PLACES_API_KEY` for the backend Places API calls
- `VITE_GOOGLE_MAPS_API_KEY` for the browser map and autocomplete
- `FOURSQUARE_API_KEY` if you want Foursquare fallback enabled
- `MONGODB_URI` for database persistence
- `MONGODB_DB_NAME` for the database name
- `PLACES_PROVIDER_ORDER` to control provider priority
- `PORT` for the API server

## Local setup

```bash
npm install
npm run dev
```

The client runs with Vite and opens automatically. The API server runs alongside it on `127.0.0.1:8787` by default.

## API deployment

For deployment, use any Node host that supports environment variables and a long-running process. The server entry point is `server/index.mjs`, and the production start command is:

```bash
npm start
```

Make sure the host sets these environment variables:

- `GOOGLE_PLACES_API_KEY`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `FOURSQUARE_API_KEY` if you use it
- `PLACES_PROVIDER_ORDER` if you want to override provider priority

After deployment, the host will show a public service URL. That root URL is what you put into `VITE_API_BASE_URL`.

## GitHub Pages deployment

GitHub Pages can host the React frontend, but it cannot run the Express API in `server/`. To deploy the site on Pages:

1. Host the API somewhere else first, or the search and detail views will not load data.
1. Set `VITE_API_BASE_URL` to that hosted API URL in the Pages build environment.
1. Set `VITE_GOOGLE_MAPS_API_KEY` in the build environment if you want the map to load in production.
1. Push to `main`; the included GitHub Actions workflow builds `dist/` and publishes it to Pages.

The app uses hash-based routing so direct links work on GitHub Pages without a custom rewrite rule.

## Available scripts

- `npm run dev`
- `npm run dev:client`
- `npm run dev:server`
- `npm run build`
- `npm run preview`

## API routes

- `GET /api/health`
- `GET /api/labs/search`
- `GET /api/labs/nearby`
- `GET /api/labs/:id`
- `GET /api/google-place-photo`

## Notes

- Saved labs and notes are stored locally in the browser for now.
- The app is focused on NYC only at this stage.
- Google photos are used when a place exposes them; otherwise the UI falls back gracefully.

## Screenshot

![Photo Lab Finder home screen](./docs/nyc-photolab-sc.png)

## Saved Labs

![Photo Lab Finder saved labs screen](./docs/nyc-photolab-savedlabs-sc.png)

<small><a href="https://www.flaticon.com/free-icons/camera" title="camera icons">Camera icons created by Freepik - Flaticon</a></small>
