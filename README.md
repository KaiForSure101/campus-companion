# Campus Companion

Campus Companion is a student dashboard designed to bring daily academic information into one calm, focused interface. This repository is being built gradually so each feature can be understood, tested, and reviewed before the next one begins.

## Current checkpoint

The project has completed the foundation stage and the first Phase 2 functionality milestones. It currently includes a semantic HTML dashboard, a responsive CSS design system, a working mobile navigation menu, dynamic dashboard values, an assignment tracker, saved notes, a GPA calculator, a timetable editor, a Pomodoro focus timer, shared localStorage helpers, dark mode, reduced-motion preferences, and explanatory comments throughout the source files.

| File | Responsibility |
|---|---|
| `index.html` | Defines the page structure, content, navigation, accessibility labels, and semantic sections |
| `styles.css` | Defines colors, typography, spacing, layout, responsive breakpoints, focus states, themes, motion preferences, and visual feedback |
| `app.js` | Defines dashboard state, DOM updates, navigation events, assignments, notes, courses, timetable, timer, preferences, persistence, and user feedback |
| `supabase-config.js` | Creates the browser-safe Supabase client using the project URL and publishable key |
| `supabase-schema.sql` | Defines user-owned tables and Row Level Security policies for the cloud data layer |

## How the page works

The browser starts with `index.html`. The HTML provides the structure that users and assistive technologies can understand. It links to `styles.css` for presentation and loads `app.js` with `defer`, which allows the HTML to be parsed before the script runs.

The JavaScript first stores references to the important HTML elements. It then keeps temporary sample data in the `dashboardState` object. The `renderDashboard()` function reads that object and updates the matching DOM elements. This creates a simple separation between data, behavior, and presentation that we can extend later.

The CSS uses custom properties in `:root` as design tokens. This means a color or shadow can be changed in one place and reused throughout the page. The layout is mobile-first: the default rules support small screens, while the `44rem` media query adds the wider desktop navigation and multi-column dashboard layout.

## Running the current version

Because this is a static vanilla project, the page can be opened directly by opening `index.html` in a browser. During development, a local static server can also be used so the project behaves like a normal website.

## Supabase setup

The project now includes a browser-safe Supabase client configuration. The URL and publishable key can be present in frontend code; never add a service-role key, database password, or JWT secret to this project. The `supabase-schema.sql` file must be run once in the Supabase SQL Editor. Its policies use `auth.uid()` so signed-in users can only access rows whose `user_id` matches their account.

The current checkpoint verifies that the Supabase client loads without breaking the static dashboard. The Settings account panel now supports accessible email-and-password sign-up and sign-in, shows cloud controls only after authentication, and can copy the current local assignments, notes, courses, and timetable into the signed-in user’s private Supabase rows.

The first sync intentionally copies the browser data as a clear learning step. It does not yet replace every local action with live cloud mutations; that will be the next backend refinement after sign-in has been tested with a real account.

## Learning checkpoints

| Topic | Where to study it |
|---|---|
| Semantic HTML | `header`, `nav`, `main`, `section`, `article`, `aside`, `ol`, `ul`, `time`, and `footer` in `index.html` |
| CSS variables | The design tokens at the top of `styles.css` |
| Responsive CSS | The mobile-first rules and the `@media (min-width: 44rem)` section |
| DOM selection | The grouped `document.querySelector()` calls in `app.js` |
| State and rendering | `dashboardState`, `assignments`, `notes`, `courses`, `timetable`, timer state, and the render functions in `app.js` |
| Event handling | The menu, assignment, note, course, timetable, timer, keyboard, and outside-click listeners in `app.js` |
| Accessibility | `aria-label`, `aria-expanded`, `aria-controls`, focus styles, and live feedback regions |
| Authentication | The `auth-form`, `initializeAuth()`, password sign-up/sign-in handlers, session listener, and sign-out handler in `scripts/settings.js` |
| Cloud sync | `syncLocalData()` maps local browser records to user-owned Supabase rows |
| Supabase client setup | `supabase-config.js` and the RLS policies in `supabase-schema.sql` |

## Multi-page architecture

The project now uses focused HTML pages instead of placing every feature on one long dashboard. `index.html` is the overview, while `assignments.html`, `notes.html`, `timetable.html`, `gpa.html`, and `settings.html` each own one workflow. This keeps the user experience calmer and makes it easier for teammates to find a feature.

The shared `scripts/` directory contains small ES modules. `layout.js` owns the header, responsive navigation, active-page state, and theme button. `storage.js` owns localStorage keys and starter data. `utils.js` contains pure formatting, ID, announcement, and escaping helpers. Feature modules own only their page: `dashboard.js`, `assignments.js`, `notes.js`, `timetable.js`, `gpa.js`, and `settings.js`.

Every page imports the same `styles.css`, so visual changes remain consistent. The original `app.js` is retained as a single-page learning reference; the focused pages use the smaller modules instead.

## Planned next stage

For this school demonstration, **Confirm email is disabled** in the Supabase dashboard so account testing does not depend on magic-link delivery or a custom email provider. This is intentionally simpler for learning, but it is not an appropriate production security configuration. The next bundled milestone is replacing local-only actions with authenticated cloud synchronization. Each milestone will be implemented as a meaningful group and committed only after review.
