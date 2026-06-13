# Repository Guidelines

## Project Structure & Module Organization

This repository is a Bangkok GIS risk and access prototype. The app shell lives in `app/` and renders `public/index-static.html` through `app/page.tsx`. The interactive Leaflet map, controls, and static UI are in `public/app.js`, `public/styles.css`, and `public/index-static.html`. Static GIS snapshots live in `public/data/`: district TopoJSON, POI GeoJSON, district metrics, and the data manifest. Data maintenance scripts are in `scripts/`. Cloudflare/vinext runtime code is in `worker/`, while `db/` is currently an empty Drizzle placeholder.

## Build, Test, and Development Commands

- `npm ci`: install locked dependencies. Node `>=22.13.0` is required.
- `npm run dev`: start the vinext development server.
- `npm run build`: build the app for the Cloudflare/vinext target.
- `npm run start`: run the built app.
- `npm run lint`: run ESLint, ignoring `dist` and `.next`.
- `npm run data:refresh`: regenerate OSM POI and district metric snapshots.
- `npm run data:validate`: verify data schema, counts, bounds, and required fields.
- `python3 -m http.server 4174 --bind 127.0.0.1 --directory public`: quick static preview at `/index-static.html`.

## Coding Style & Naming Conventions

Use TypeScript/React conventions in `app/`, ESM JavaScript in scripts and public map code, and 2-space indentation. Keep browser-facing data reads static and rooted in `public/data/`. Prefer descriptive camelCase for functions and variables, uppercase constants for fixed configuration, and kebab-case for generated data filenames. Do not hand-edit generated POI or metric snapshots unless intentionally patching data output.

## Testing Guidelines

There is no dedicated unit test suite yet. For functional changes, run `npm run lint`, `npm run build`, and `npm run data:validate`. For map or UI changes, manually preview the static map and verify that boundaries, POI markers, access rings, search, and inspector details load without console errors.

## Commit & Pull Request Guidelines

Follow the existing imperative commit style, for example `Add Bangkok GIS data refresh automation` or `Refresh site preview screenshot`. PRs should summarize the user-visible change, list data files touched, include validation/build results, and attach screenshots for UI changes. Data refresh PRs should report `generated_at`, district count, POI total, and POI counts by category.

## Security & Data Notes

Respect OpenStreetMap ODbL attribution. Do not add secrets to the repo. Flood, zoning, and pressure layers are prototype scenarios unless replaced with official sources.
