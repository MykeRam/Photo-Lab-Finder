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

<small><a href="https://www.flaticon.com/free-icons/camera" title="camera icons">Camera icons created by Freepik - Flaticon</a></small>
