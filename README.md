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

## How to build and run the project

Campus Companion is a static vanilla web project. It does not require a frontend framework, bundler, or package installation for normal development. The main build step is preparing the HTML, CSS, JavaScript, and Supabase configuration files, then serving the project directory through a local web server.

### 1. Clone the repository

Make sure Git is installed, then clone the private repository and enter its folder:

```bash
git clone https://github.com/KaiForSure101/campus-companion.git
cd campus-companion
```

If you already cloned the project, update it before working:

```bash
git pull origin main
```

### 2. Check the project structure

The important files and folders should look similar to this:

```text
campus-companion/
├── index.html
├── assignments.html
├── notes.html
├── timetable.html
├── gpa.html
├── settings.html
├── styles.css
├── supabase-config.js
├── supabase-schema.sql
├── api/
│   └── auth.js
└── scripts/
    ├── layout.js
    ├── storage.js
    ├── utils.js
    ├── dashboard.js
    ├── assignments.js
    ├── notes.js
    ├── timetable.js
    ├── gpa.js
    └── settings.js
```

### 3. Configure Supabase

Open `supabase-config.js` and confirm that it contains the correct Supabase project URL and browser-safe publishable key. The publishable key may be used in frontend code. Never place a service-role key, database password, or JWT secret in this repository.

If the database has not been prepared yet, open the Supabase SQL Editor and run `supabase-schema.sql` once. The schema creates the user-owned tables and Row Level Security policies required by the cloud data layer. No SQL command is needed for the Pomodoro sound, theme, localStorage, or frontend-only UI features.

### 4. Run the project locally

The recommended method is to use a simple static server. Python is commonly available on Windows, macOS, and Linux:

```bash
python -m http.server 4173
```

Then open [http://127.0.0.1:4173/index.html](http://127.0.0.1:4173/index.html) in a browser. Open the other pages directly when testing their workflows:

```text
http://127.0.0.1:4173/assignments.html
http://127.0.0.1:4173/notes.html
http://127.0.0.1:4173/timetable.html
http://127.0.0.1:4173/gpa.html
http://127.0.0.1:4173/settings.html
```

Keep the terminal window running while testing. Press `Ctrl + C` in that terminal to stop the server.

You can open `index.html` directly without a server for basic visual inspection, but a local server is preferred because ES modules, relative paths, and the Vercel authentication function behave more like the deployed site.

### 5. Test the main workflows

Use the dashboard navigation to visit every page. Add and delete an assignment, create and search a note, add a timetable class, calculate a GPA, and start the Pomodoro timer. Refresh the page after adding local data to confirm that localStorage persistence works. Toggle dark mode and resize the browser to check responsive behavior.

For authentication, open Settings and try **Create demo account** or **Sign in**. The page attempts Supabase Auth, a direct Auth request, and the same-origin `/api/auth` fallback. If the network blocks all authentication routes, the clearly labeled **Continue in local demo mode** option is available for presentations. Local demo mode does not create a Supabase account or sync data to the cloud.

### 6. Check JavaScript before committing

The project does not have a required package-based build command. Before committing JavaScript changes, run a syntax check for the changed module:

```bash
node --check scripts/settings.js
node --check scripts/assignments.js
node --check scripts/notes.js
node --check scripts/timetable.js
node --check scripts/gpa.js
```

Also check for whitespace mistakes and review the changed files:

```bash
git diff --check
git status
git diff
```

### 7. Deploy to Vercel

The project is deployed on Vercel. After committing and pushing to the connected GitHub branch, Vercel automatically creates a new deployment. The current live site is [campus-companion-mu.vercel.app](https://campus-companion-mu.vercel.app/).

For a manual deployment, install and authenticate with the Vercel CLI, then run:

```bash
npx vercel
```

For a production deployment, use:

```bash
npx vercel --prod
```

After deployment, test the live versions of `index.html`, `settings.html`, and `timetable.html`. Use a cache-busting query such as `settings.html?test=1` if an older browser cache appears to be loading.


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
| Pomodoro sound | `playCompletionSound()` uses the browser Web Audio API to play a short three-note chime when enabled |
| Supabase client setup | `supabase-config.js` and the RLS policies in `supabase-schema.sql` |

## Multi-page architecture

The project now uses focused HTML pages instead of placing every feature on one long dashboard. `index.html` is the overview, while `assignments.html`, `notes.html`, `timetable.html`, `gpa.html`, and `settings.html` each own one workflow. This keeps the user experience calmer and makes it easier for teammates to find a feature.

The shared `scripts/` directory contains small ES modules. `layout.js` owns the header, responsive navigation, active-page state, and theme button. `storage.js` owns localStorage keys and starter data. `utils.js` contains pure formatting, ID, announcement, and escaping helpers. Feature modules own only their page: `dashboard.js`, `assignments.js`, `notes.js`, `timetable.js`, `gpa.js`, and `settings.js`.

Every page imports the same `styles.css`, so visual changes remain consistent. The original `app.js` is retained as a single-page learning reference; the focused pages use the smaller modules instead.

## Planned next stage

For this school demonstration, **Confirm email is disabled** in the Supabase dashboard so account testing does not depend on magic-link delivery or a custom email provider. This is intentionally simpler for learning, but it is not an appropriate production security configuration. The Settings page first tries the Supabase client, then a direct Auth request, and finally the same-origin `/api/auth` Vercel function if the browser cannot reach Supabase directly. The proxy forwards only the public publishable key and never uses a service-role secret. If every route is unavailable, the page offers **Continue in local demo mode**; this keeps the feature pages usable for a presentation, stores state only in the current browser, and does not pretend to create a Supabase account. The next bundled milestone is replacing manual local-data sync with authenticated cloud mutations. Each milestone will be implemented as a meaningful group and committed only after review.
