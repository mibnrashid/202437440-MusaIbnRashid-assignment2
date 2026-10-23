# Musa Ibn Rashid — Personal Portfolio

**Assignment 2: Interactive Features** · Student ID `202437440`

A responsive single-page portfolio built with plain HTML, CSS and JavaScript — no frameworks, no
build step, no dependencies. Assignment 2 builds on the
[Assignment 1 site](https://github.com/mibnrashid/202437440-MusaIbnRashid-assignment1) and adds
live data, filtering, saved preferences, and clear feedback for every user action.

🔗 **Live site:** https://mibnrashid.github.io/202437440-MusaIbnRashid-assignment2/

---

## Table of contents

- [What's new in Assignment 2](#whats-new-in-assignment-2)
- [Features](#features)
- [Running it locally](#running-it-locally)
- [Using the site](#using-the-site)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Browser support](#browser-support)
- [Testing](#testing)
- [AI usage](#ai-usage)
- [Assignment requirements](#assignment-requirements)
- [Contact](#contact)

---

## What's new in Assignment 2

Assignment 1 was a static portfolio with a handful of effects. Assignment 2 turns it into a page
that responds to the visitor, loads live data, and remembers choices.

| Brief requirement | What was built |
| --- | --- |
| **Dynamic content** | Projects can be **filtered** by category, **searched live** while typing, and **sorted** (Impact / Newest / A–Z). Experience entries **expand and collapse**. The greeting **updates with the visitor's name**. |
| **Data handling** | **Public API:** every public repository is fetched live from the **GitHub REST API**. **localStorage:** theme, visitor name, project filter, contact-form draft and a one-hour API cache are all saved. **Form:** validated, with a confirmation message and a hand-off to the visitor's email app. |
| **Animation & transitions** | Filtered cards animate in with a stagger, loading skeletons shimmer, invalid fields shake, details panels slide open, and success/error messages slide in. All of it stands down under `prefers-reduced-motion`. |
| **Error handling & feedback** | Loading skeletons with a "Loading…" status, specific error messages (offline, timeout, rate limit, server error) each with a **Retry** button, a saved-copy fallback when GitHub is unreachable, "No projects found" empty states with a **Clear filters** button, toast notifications, and online/offline notices. |

Content was also updated: four new projects (two SDAIA Academy courses, the Khawarizm hackathon
engine and the Thmanyah backend), and dates corrected against my current LinkedIn profile.

---

## Features

### New in Assignment 2

| Feature | What it does |
| --- | --- |
| **Project filter, search & sort** | Category chips with counts, live search across titles, descriptions and tags, three sort orders, a live "Showing 4 of 7" count, and an empty state. The chosen category and sort are remembered. |
| **Live from GitHub** | All public repositories from the GitHub API with a summary (repos, languages, stars, most-used language), search, language filter, sort, an "include forks" toggle and "Show more" paging. |
| **Loading, error & offline states** | Skeleton cards while loading; an 8-second timeout; specific, actionable error messages with Retry; automatic retry when the connection returns. |
| **API cache** | Responses are cached in `localStorage` for an hour, so repeat visits load instantly and stay well inside GitHub's 60-requests-per-hour limit. If GitHub fails, the last saved copy is shown with a note. |
| **Personalised greeting** | The hero terminal asks for the visitor's name, validates it, saves it, greets them by name on return and pre-fills the contact form. Works with Arabic names. |
| **Contact form upgrades** | Draft autosaved as you type (restored after a reload); invalid fields shake; a valid message opens pre-filled in the visitor's own email app. |
| **Expand / collapse** | "Show details" on the longer experience entries, animated with CSS grid rows. |
| **Toast notifications** | Short, dismissible messages for copy, save, reset, refresh and connection events. |
| **Reset saved preferences** | One button in the footer clears everything this site stored. |
| **Command palette, extended** | New commands: filter projects by category, refresh GitHub data, change name, reset preferences. |

### Carried over from Assignment 1

Theme toggle (saved), command palette (`/`), scrollspy, smooth scrolling, time-of-day greeting,
typing effect, scroll-reveal, animated counters, copy-to-clipboard, scroll progress bar, back to
top, and responsive mobile navigation.

---

## Running it locally

The site is fully static: nothing to install and nothing to build.

### 1. Get the code

```bash
git clone https://github.com/mibnrashid/202437440-MusaIbnRashid-assignment2.git
cd 202437440-MusaIbnRashid-assignment2
```

### 2. Serve it (recommended)

Run **one** of these from the project folder, then open **http://localhost:8000**:

```bash
# Python 3 (macOS / Linux)
python3 -m http.server 8000

# Python 3 (Windows)
py -3 -m http.server 8000

# Node.js
npx serve -l 8000 .
```

Or, in VS Code, install the **Live Server** extension and choose *Open with Live Server* on
`index.html`.

### Or open the file directly

Double-clicking `index.html` also works. Two things behave differently on `file://`, which is why
a local server is recommended:

- Some browsers block the clipboard API, so the **copy** button may fall back or fail (a toast
  tells you if it does).
- Some browsers keep `localStorage` separately for local files, so saved preferences may not carry
  over between files.

### Requirements

- Any current browser (Chrome, Edge, Firefox or Safari).
- An internet connection for the **Live from GitHub** section and the web fonts. Everything else
  works offline, and the GitHub section explains itself if it cannot connect.

### Deploying

GitHub Pages, from the `main` branch root: *Settings → Pages → Source: Deploy from a branch →
`main` / `(root)` → Save*. The site publishes to the live link above after a minute or two. All
paths are relative, so no configuration is needed.

---

## Using the site

| To… | Do this |
| --- | --- |
| Find a project | Use the category chips above **Projects**, or type in the search box. Press `Esc` to clear the search. |
| Reorder projects | Change **Sort** to *Impact* (my strongest work first), *Newest* or *A–Z*. |
| Browse my code | Scroll to **Live from GitHub**. Search, filter by language, hide forks, and press **Show more**. Each card opens the repository. |
| Get the latest repos | Press **refresh** under the GitHub list (the list is otherwise cached for an hour). |
| Be greeted by name | Type your name in the hero terminal and press `Enter`. Use **change name** to edit it. |
| Read more about a role | Press **Show details** under an experience entry. |
| Send me a message | Fill in the contact form, press **Send message**, then **Open in your email app**. Your draft is kept if you reload. |
| Switch light/dark | The sun/moon button, top-right. |
| Clear what the site saved | **reset saved preferences** in the footer. |

**Keyboard shortcuts**

- `/` — open the command palette (try "ai", "github" or "reset")
- `↑` `↓` then `Enter` — choose a palette command
- `Esc` — close the palette or menu, or clear a search box
- `Tab` — a "Skip to main content" link appears first

**If something goes wrong** the page says what happened and what to do next: for example
*"GitHub's hourly request limit has been reached… the limit resets at 14:30"* with a link to
browse the repositories on GitHub directly.

---

## Project structure

```
202437440-MusaIbnRashid-assignment2/
├── index.html                      # The page: 8 sections, palette dialog, toast region
├── css/
│   └── styles.css                  # All styling, 20 commented sections
├── js/
│   └── script.js                   # All behaviour, 20 self-contained modules
├── assets/
│   ├── favicon.svg
│   ├── musa-ibn-rashid-cv.pdf      # Downloadable CV
│   └── images/                     # Each image in 2-3 widths, WebP + JPEG
│       ├── musa-portrait{,-640}.{jpg,webp}
│       ├── kaust-eeg-poster{,-640,-960}.{jpg,webp}
│       └── ice-offering{,-640,-960}.{jpg,webp}
├── docs/
│   ├── ai-usage-report.md          # AI usage report
│   ├── technical-documentation.md  # Architecture, modules, data flow, testing
│   └── assignment-brief.md         # The assignment specification
├── .gitignore
├── .nojekyll                       # Stops GitHub Pages running Jekyll over the site
└── README.md
```

---

## How it works

A short overview. The full write-up is in
[`docs/technical-documentation.md`](docs/technical-documentation.md).

- **Progressive enhancement.** Project cards and experience details are real HTML. JavaScript adds
  the filters and toggles on top, so with scripting off every project and detail is still visible
  and the controls are simply hidden.
- **Filtering without re-rendering.** Each project card carries `data-category`, `data-date` and
  `data-impact`. Filtering toggles a class; sorting re-appends the existing nodes in a new order.
- **GitHub data flow.** Nothing is requested until the section is about to scroll into view.
  Then: cached copy under an hour old → render it; otherwise show skeletons → `fetch` with an
  8-second timeout → cache and render, or show a specific error with Retry. API text is always
  inserted with `textContent`, never `innerHTML`.
- **One storage layer.** Every `localStorage` key is listed in one `KEYS` object, and every access
  is wrapped in `try/catch` because storage throws in some privacy modes:

  | Key | Holds |
  | --- | --- |
  | `theme` | `"light"` or `"dark"` |
  | `visitorName` | The name typed in the hero terminal |
  | `projectView` | `{ filter, sort }` for the projects section |
  | `contactDraft` | `{ name, email, message }` while a message is unsent |
  | `githubRepos` | `{ time, repos }`: the cached API response |

- **Modules talk through events.** "Reset preferences" clears the keys and dispatches one
  `prefs:reset` event; each module restores its own default. No module reaches into another.

---

## Accessibility

- Filter chips use `aria-pressed`; detail toggles use `aria-expanded` and `aria-controls`.
- Result counts, the GitHub status, form status and toasts are `aria-live` regions, so screen
  readers hear "Showing 4 of 7 projects" or "Loading repositories…" as they change.
- Every input has a label (visible, or visually hidden for the search boxes).
- Name and contact errors use `role="alert"` and `aria-invalid`.
- "Show more" moves keyboard focus to the first newly loaded repository.
- `prefers-reduced-motion` disables every animation and gives each feature a static path.
- Semantic landmarks, a skip link, one consistent focus ring and checked contrast in both themes
  are kept from Assignment 1.
- Lighthouse Accessibility: **100**.

---

## Performance

| Lighthouse (local, Chrome) | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Desktop | **100** | **100** | **100** | **100** |
| Mobile (median of 3 runs) | **95** | **100** | **100** | **100** |

What got it there:

- **Zero dependencies and zero third-party JavaScript.** HTML, CSS and JS together are 37 KB
  gzipped.
- **Responsive images.** `srcset` with 640/960/1600px widths, so a phone downloads a ~16–35 KB
  image instead of a 140 KB one. Mobile page weight is about 410 KB.
- **Non-blocking fonts.** The font stylesheet is preloaded and applied when it arrives, which cut
  mobile First Contentful Paint from 3.5 s to 1.2–2.0 s.
- **CSS-only hero entrance.** The first screen no longer waits for JavaScript to fade in.
- **Lazy API request** and a **one-hour cache**, so the GitHub call is made only when needed.
- **No layout shift.** Explicit image sizes and reserved space for status lines (CLS ≈ 0.01).
- Scroll work throttled with `requestAnimationFrame`; everything else uses `IntersectionObserver`.

The local server used for these runs does not compress files. GitHub Pages does, so the live site
should score the same or better.

---

## Browser support

**Tested in Chrome, Edge, Firefox and WebKit (Safari's engine)** at 390px, 834px and 1440px. All
64 automated checks pass in all four.

Each modern feature degrades to something usable:

| If this is missing | What happens |
| --- | --- |
| JavaScript | All projects and experience details stay visible; filters and toggles are hidden; the GitHub section links to github.com |
| `fetch` / `Promise` | The GitHub section explains that the browser cannot load live data and links to GitHub |
| `AbortController` | The 8-second timeout still fires; the request just isn't cancelled |
| `Intl.RelativeTimeFormat` | Dates fall back to "3 days ago" built by hand |
| `IntersectionObserver` | Reveals show immediately and the GitHub list loads straight away |
| `localStorage` | Nothing is remembered, but every feature still works |
| Clipboard API | Falls back to `execCommand('copy')`, then to an error toast |

---

## Testing

- **64 automated functional checks**, run with Playwright in **Chrome, Edge, Firefox and WebKit**:
  **256/256 pass**.
- They cover:
  - filter, search and sort, plus persistence across a reload;
  - the GitHub list: rendering, paging, search, the language and fork filters, and the cache;
  - the GitHub failure paths: network error → Retry, stale-cache fallback, rate limit, timeout,
    and loading skeletons;
  - name validation, including Arabic names;
  - the contact form: errors, shake, draft restore, and the `mailto:` hand-off;
  - expand/collapse heights, palette commands, copy, offline notices, reset;
  - no horizontal scroll at phone and tablet widths, and no console errors.
- **GitHub responses were mocked** for the error tests, so every failure path could be triggered
  on purpose.
- **Edge cases checked:** the page with JavaScript disabled, and with reduced motion enabled.
- **Visual review:** full-page screenshots in both themes at desktop and phone widths.

The method and full list are in the
[technical documentation](docs/technical-documentation.md#12-testing).

---

## AI usage

**Claude Code** was used as a development assistant throughout this assignment: analysing the
brief, planning the features, generating and reviewing code, writing the automated browser tests,
running performance audits, and drafting documentation. Every change was reviewed, tested in four
browsers, and adjusted where needed.

The full account — tools, prompts, what was accepted, changed or rejected, and what I learned — is
in [`docs/ai-usage-report.md`](docs/ai-usage-report.md).

---

## Assignment requirements

| Requirement | Where |
| --- | --- |
| Repo named `id-name-assignment2` | `202437440-MusaIbnRashid-assignment2` |
| Builds on Assignment 1 | Same codebase; [A1 repo](https://github.com/mibnrashid/202437440-MusaIbnRashid-assignment1) |
| Clear folder structure | `css/`, `js/`, `assets/`, `docs/` |
| Dynamic content (≥ 1) | Project filter + live search + sort; expand/collapse; name-based greeting |
| Data handling (≥ 1) | GitHub REST API; `localStorage` (5 keys); validated form with confirmation |
| Animation / transitions (≥ 1) | Card entrance, skeleton shimmer, field shake, panel slide, toasts, hover effects |
| Error handling & feedback | Loading state, API error messages + Retry, empty states, form errors, toasts |
| AI tools used | Claude Code — see [AI usage](#ai-usage) |
| `docs/ai-usage-report.md` | [Link](docs/ai-usage-report.md) |
| `docs/technical-documentation.md` | [Link](docs/technical-documentation.md) |
| README: description, setup, AI summary, live link | This file |

---

## Contact

**Musa Ibn Rashid** — B.Sc. Software Engineering, KFUPM

- Email: [m.ibnrashid@gmail.com](mailto:m.ibnrashid@gmail.com)
- GitHub: [github.com/mibnrashid](https://github.com/mibnrashid)
- LinkedIn: [linkedin.com/in/musaibnrashid](https://linkedin.com/in/musaibnrashid)

---

*Assignment 2 of a portfolio that later assignments will continue to expand.*
