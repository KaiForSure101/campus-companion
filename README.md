# Campus Companion

Campus Companion is a student dashboard designed to bring daily academic information into one calm, focused interface. This repository is being built gradually so each feature can be understood, tested, and reviewed before the next one begins.

## Current checkpoint

The project has completed the foundation stage and the first Phase 2 functionality milestones. It currently includes a semantic HTML dashboard, a responsive CSS design system, a working mobile navigation menu, dynamic dashboard values, an assignment tracker, saved notes, a GPA calculator, a timetable editor, a Pomodoro focus timer, shared localStorage helpers, and explanatory comments throughout the source files.

| File | Responsibility |
|---|---|
| `index.html` | Defines the page structure, content, navigation, accessibility labels, and semantic sections |
| `styles.css` | Defines colors, typography, spacing, layout, responsive breakpoints, focus states, and visual feedback |
| `app.js` | Defines dashboard state, DOM updates, navigation events, assignments, notes, courses, timetable, timer state, persistence, and user feedback |

## How the page works

The browser starts with `index.html`. The HTML provides the structure that users and assistive technologies can understand. It links to `styles.css` for presentation and loads `app.js` with `defer`, which allows the HTML to be parsed before the script runs.

The JavaScript first stores references to the important HTML elements. It then keeps temporary sample data in the `dashboardState` object. The `renderDashboard()` function reads that object and updates the matching DOM elements. This creates a simple separation between data, behavior, and presentation that we can extend later.

The CSS uses custom properties in `:root` as design tokens. This means a color or shadow can be changed in one place and reused throughout the page. The layout is mobile-first: the default rules support small screens, while the `44rem` media query adds the wider desktop navigation and multi-column dashboard layout.

## Running the current version

Because this is a static vanilla project, the page can be opened directly by opening `index.html` in a browser. During development, a local static server can also be used so the project behaves like a normal website.

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

## Planned next stage

The next bundled milestone is dark mode, settings, accessibility refinements, and responsive quality assurance. Each milestone will be implemented as a meaningful group and committed only after review.
