# Ski School Coaching App

Coaching app for ski instructors — drill library, lesson plan generator, terrain
guidance with progression gates. Pilot: Crystal Mountain Resort.

**Stack:** SvelteKit + TypeScript, static output, PWA (offline-first). No backend
yet — content is bundled seed data; the app works fully offline on-hill.

## Setup

```bash
npm install
npm run dev      # local dev server
npm run build    # static production build -> build/
npm run preview  # preview the production build
npm run check    # type checking
```

Requires Node 18+.

## Project map

- `src/routes/` — pages: home (`/`), drill library (`/drills`), terrain & gates (`/terrain`)
- `src/lib/data/` — versioned seed-data JSON (skills, drills, terrain, cues) + typed `index.ts`
- `src/lib/types.ts` — shared TypeScript types for the data layer
- `static/` — favicon and other static assets (precached by the service worker)

## Content pipeline

The `.md` seed files (drill library, skills taxonomy, terrain seed, sensory cues)
are the **human-reviewed source of truth**. The JSON in `src/lib/data/` is the
generated runtime copy — versioned (`"version"` field per file), bundled into the
app, and precached for offline use.

Boundary: nothing LLM-generated goes live without instructor review. When the
content pipeline is formalized, generation scripts will live here and write to a
staging area first; review promotes to `src/lib/data/`.

## PWA / offline

`@vite-pwa/sveltekit` generates the service worker at build time. `adapter-static`
emits a fully static site, so the entire app — pages and seed data — is precached
and usable with no signal. AI-assisted features (plain-language search, plan
generation) will be designed to degrade gracefully offline: bundled content always
works; AI features light up when there's connectivity.

## Roadmap (pilot)

- [ ] Lesson plan generator with branching + fallbacks (sidestep/sideslip as the
      universal safety-lever fallback)
- [ ] Plain-language drill search ("drills for back-seat beginners")
- [ ] Cause/effect diagnosis UI (internal vs external cues)
- [ ] Fictional-lesson sandbox (doubles as PSIA exam prep)
- [ ] Backend (accounts/sync) when the ski-school pilot needs it — likely Supabase
