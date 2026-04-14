# Photo Lab Finder
A location-based web app that helps users find and compare photography labs by area, services, and turnaround options. Users can search listings, filter by services like film developing and scanning, and save favorite labs for future use.

## Current milestone

NYC-only routed MVP with:

- borough, neighborhood, ZIP, and current-location search
- service filters for develop, scan, prints, and same-day
- cards view plus map/list view
- detail pages for each lab
- local favorites and personal notes
- a local API proxy that uses Google Places first, Foursquare as fallback, and seeded NYC data when no keys are configured
- Express backend routes with optional MongoDB backing for curated and cached lab records

## Environment

Create `.env` from `.env.example` and add one or both:

- `GOOGLE_PLACES_API_KEY`
- `FOURSQUARE_API_KEY`
- `MONGODB_URI`

## Planned next step

Add autocomplete, improve service inference from live providers, and persist saved data to a backend.
