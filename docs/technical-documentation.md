# Technical Documentation

**Project:** Musa Ibn Rashid — Personal Portfolio
**Assignment 2: Interactive Features** (built on Assignment 1) · `202437440`

---

## Contents

1. [Architecture](#1-architecture)
2. [File reference](#2-file-reference)
3. [HTML structure](#3-html-structure)
4. [CSS architecture](#4-css-architecture)
5. [Theming](#5-theming)
6. [Responsive strategy](#6-responsive-strategy)
7. [JavaScript modules](#7-javascript-modules)
8. [Data handling: storage and the GitHub API](#8-data-handling-storage-and-the-github-api)
9. [Error handling and user feedback](#9-error-handling-and-user-feedback)
10. [Images](#10-images)
11. [Accessibility](#11-accessibility)
12. [Performance](#12-performance)
13. [Browser support and graceful degradation](#13-browser-support-and-graceful-degradation)
14. [Testing](#14-testing)
15. [Deployment](#15-deployment)
16. [Known limitations and future work](#16-known-limitations-and-future-work)

---

## What changed since Assignment 1

| Area | Assignment 1 | Assignment 2 |
| --- | --- | --- |
| Projects | 3 static rows | 7 cards with filter, live search, sort, result count and empty state |
| Live data | None | GitHub REST API with loading, timeout, error, retry, cache and stale-copy fallback |
| `localStorage` | Theme only | Theme, visitor name, project view, contact draft, API cache — all clearable |
| Greeting | Time of day | Time of day + validated, saved visitor name |
| Contact form | Validate and confirm | + draft autosave, shake on error, `mailto:` hand-off, error count |
| Experience | Always expanded | Expand / collapse with an animated height |
| Feedback | Inline only | + toast notifications, online/offline notices |
| JS modules | 14 | 20 |
| Images | One size each | 2–3 widths each with `srcset` |
| Fonts | Render-blocking | Preloaded, non-blocking |
| Tests | 28 checks, Chrome | 64 checks × 4 browsers |

---

## 1. Architecture

A static site: one HTML document, one stylesheet, one script. No framework, no build step, no
dependencies. The repository *is* the deployable site.

```
index.html ──> css/styles.css      (presentation)
           └─> js/script.js        (behaviour, deferred)
                    │
                    ├─> localStorage ............. 5 keys, all in one KEYS object
                    ├─> api.github.com ........... fetched lazily, cached 1 hour
                    └─> DOM .......................  classes and attributes CSS reacts to
```

Four rules hold the structure together:

1. **Separation of concerns.** Structure in HTML, presentation in CSS, behaviour in JavaScript.
   JavaScript sets state with classes and attributes (`is-hidden`, `is-open`, `aria-pressed`,
   `hidden`) and the stylesheet decides what they look like.
2. **Progressive enhancement.** Content that matters is real HTML. The seven project cards and the
   experience details are in the markup; JavaScript adds filters and toggles on top. With scripting
   off, every project and detail is still visible and only the controls are hidden. The one
   section that cannot exist without JavaScript — the live GitHub list — shows a `<noscript>` link
   to GitHub instead.
3. **Modules don't know about each other.** Each feature is a function started from `init()`. When
   one feature needs another, it goes through the DOM (the command palette clicks the real filter
   chip) or a document event (`prefs:reset`, `github:refresh`). There are no shared mutable
   globals besides the helpers.
4. **External data is never markup.** Everything that comes from the GitHub API is inserted with
   `textContent` or `createElement`, never `innerHTML`, so a repository description can't inject
   HTML into the page.

---

## 2. File reference

| File | Lines | Purpose |
| --- | --- | --- |
| `index.html` | 890 | Semantic markup for eight sections, the command palette dialog and the toast region |
| `css/styles.css` | 1634 | All presentation, in 20 numbered and commented sections |
| `js/script.js` | 1700 | All behaviour, in 20 self-contained modules inside one IIFE |
| `assets/images/` | — | Three images, each in 2–3 widths, WebP + JPEG |
| `assets/favicon.svg` | — | Gold six-point snowflake |
| `assets/musa-ibn-rashid-cv.pdf` | — | Downloadable CV |
| `docs/` | — | This file, the AI usage report and the original brief |
| `.nojekyll` | — | Stops GitHub Pages processing the site with Jekyll |
| `.gitignore` | — | Ignores `.originals/` (unoptimised source images), OS and editor noise |

---

## 3. HTML structure

```
<html class="no-js" data-theme="dark">
 ├── <head>
 │    ├── meta, Open Graph, favicon
 │    ├── font stylesheet: preload + onload swap (with <noscript> fallback)
 │    ├── css/styles.css
 │    └── inline script ....................... removes no-js, applies saved theme before paint
 └── <body>
      ├── .scroll-progress, .skip-link
      ├── <header> ............................. brand, nav (8 links), palette hint, theme toggle
      ├── <main id="main">
      │    ├── #hero ........................... terminal card with the name form (#nameForm)
      │    ├── #about, #skills
      │    ├── #projects ....................... toolbar (chips, search, sort), #projectCount,
      │    │                                     7 × <article class="project" data-*>, #projectEmpty
      │    ├── #github ......................... #ghSummary, toolbar, #ghStatus, #ghList,
      │    │                                     #ghMessage (error/empty), #ghMore, <noscript>
      │    ├── #experience ..................... <ol>, 3 entries with .timeline-more panels
      │    ├── #education, #awards
      │    └── #contact ........................ links + form, #formStatus, #formMailto
      ├── <footer> ............................. #resetPrefs
      ├── .back-to-top
      ├── #toasts .............................. role="status" aria-live="polite"
      └── #cmdk ................................ command palette dialog
```

### Data attributes on project cards

```html
<article class="project reveal" data-category="teaching ai" data-date="2026-08" data-impact="3">
```

| Attribute | Used for | Notes |
| --- | --- | --- |
| `data-category` | Filter chips | Space-separated, so one card can sit in several categories |
| `data-date` | *Newest* sort | `YYYY-MM`, which sorts correctly as a plain string |
| `data-impact` | *Impact* sort | My own ranking, 1 = strongest; the default order |

Adding a project means adding one `<article>` with these three attributes. The chip counts,
search and sorting pick it up automatically.

### Controls that start hidden

The project toolbar, the GitHub toolbar and summary, the name form, and the empty/error boxes all
carry the `hidden` attribute in the markup. JavaScript reveals the ones that apply. Without
JavaScript, controls that would do nothing are never shown.

---

## 4. CSS architecture

`styles.css` is organised into 20 numbered sections:

| # | Section | # | Section |
| --- | --- | --- | --- |
| 1 | Design tokens | 11 | Experience timeline (+ expand/collapse) |
| 2 | Reset & base (+ global `[hidden]`) | 12 | Education |
| 3 | Utilities | 13 | Awards |
| 4 | Header & navigation | 14 | Contact (+ shake, mailto) |
| 5 | Buttons | 15 | Footer |
| 6 | Hero (+ CSS-only entrance) | 16 | Back to top |
| 7 | Section shell | 17 | Command palette |
| 8 | About | **18** | **Interactive components (A2)** |
| 9 | Skills | 19 | Responsive |
| 10 | Projects (card grid) | 20 | Accessibility & print |

Section 18 holds the new shared components: the visually-hidden utility, terminal text buttons,
the name prompt, toolbar/chips/search/select/toggle, result counts, empty and error states, the
GitHub summary and repo cards, skeleton loaders and toasts.

### Conventions

- **State classes are prefixed `is-`** (`is-hidden`, `is-entering`, `is-open`, `is-collapsible`,
  `is-shaking`, `is-skeleton`, `is-leaving`), so it is obvious which classes JavaScript touches.
- **Flat specificity.** Almost every rule is one class. `!important` appears only in the global
  `[hidden]` rule and the reduced-motion block, where overriding everything is the point.
- **Every colour is a token**, so each new component works in both themes with no extra CSS.

### The global `[hidden]` rule

```css
[hidden] { display: none !important; }
```

The browser's own `[hidden] { display: none }` has the lowest possible priority, so any component
rule such as `.term-form { display: flex }` silently overrides it. Testing caught exactly this: the
name form stayed visible after a name was saved, even though its `hidden` attribute was set. One
global rule fixed every component at once and removed five component-specific `[hidden]` rules.

### Animations added in Assignment 2

| Effect | Technique |
| --- | --- |
| Filtered cards entering | `@keyframes card-in` (fade + rise + slight scale) with a per-card `animation-delay` stagger set from JS |
| Hero entrance | `@keyframes hero-in` with `nth-child` delays — CSS only, see [Performance](#12-performance) |
| Skeleton loaders | A 200%-wide gradient whose `background-position` sweeps across (`@keyframes shimmer`) |
| Details panel | `grid-template-rows: 0fr → 1fr` transition (below) |
| Invalid field | `@keyframes shake`, restarted by removing the class, forcing a reflow, and re-adding it |
| Status, empty state, toasts | Short `slide-in` / `toast-in` / `toast-out` keyframes |

**Animating to `height: auto`.** CSS cannot transition `height` to `auto`. The details panels use a
one-row grid instead: the row animates from `0fr` to `1fr`, and the child has `min-height: 0;
overflow: hidden`. The panel opens to its exact natural height with no measuring in JavaScript.
One trap, caught by a test that measured the collapsed height: padding on the *child* still takes
up room inside a `0fr` row, so the spacing lives on the panel as a `margin-top` that also animates
to zero.

All of these are disabled by the existing `prefers-reduced-motion` block, which sets every
animation and transition to 0.01ms. The shimmer is additionally turned off so skeletons are a still
placeholder.

---

## 5. Theming

Unchanged from Assignment 1. Two themes come from one set of components: `:root` declares the
colour tokens and `[data-theme="light"]` redeclares them. No component is written twice. The
`--on-gold` token (text placed *on* a gold fill) flips with the theme — the lesson from the
Assignment 1 contrast bug. The new active filter chip uses it, so it is readable in both themes.

**Resolution order:** a stored choice in `localStorage.theme` → otherwise `prefers-color-scheme`,
followed live → otherwise dark. New in A2: after **reset preferences** the stored choice is gone,
so the module re-applies the system preference immediately rather than waiting for a reload.

---

## 6. Responsive strategy

Fluid `clamp()` sizing and `auto-fill` grids do most of the work; breakpoints handle structural
changes only.

### Grids that need no breakpoint

```css
.projects  { grid-template-columns: repeat(auto-fill, minmax(min(100%, 400px), 1fr)); }
.repo-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); }
```

- `min(100%, 400px)` stops a card overflowing on screens narrower than 400px.
- `auto-fill` rather than `auto-fit` means one filtered card stays card-sized instead of stretching
  across the whole row.
- Projects show two columns on desktop and one on phones. Repositories show three, two or one.

The Assignment 1 project layout (alternating image-left / image-right rows) was replaced by this
card grid. Alternating rows only make sense in a fixed order; once visitors can filter and reorder,
the zig-zag breaks, while a grid reflows cleanly.

### Breakpoints

| Breakpoint | What changes |
| --- | --- |
| ≤ 1024px | About narrows; Contact stacks |
| ≤ 860px | Hamburger navigation; palette hint hidden; About stacks; statistics 2×2 |
| ≤ 560px | Full-width buttons; **search and select controls go full-width** for easy tapping; tighter timeline |

### Verified

390px, 834px and 1440px in all four test browsers. An automated check confirms there is no
horizontal scroll at 390px and 834px.

---

## 7. JavaScript modules

`script.js` is one IIFE in strict mode. It is written in ES5 syntax (`var`, function expressions)
for consistency with Assignment 1, and so that older browsers fail gracefully at the feature level
rather than throwing a syntax error that would stop the whole file. Every module returns early if
its elements are missing.

### Shared helpers

| Helper | Purpose |
| --- | --- |
| `$`, `$$` | `querySelector` / `querySelectorAll` (the latter returned as a real array) |
| `KEYS` | Every `localStorage` key in one object — the single source of truth for "reset" |
| `storage` | `get / set / remove / getJSON / setJSON`, each wrapped in `try/catch`. A corrupted JSON value is treated as "nothing saved" |
| `emit(name)` | Dispatches a document event, with a `createEvent` fallback for old browsers |
| `toast(message, type)` | Shows a notification (see [§9](#9-error-handling-and-user-feedback)) |
| `prefersReducedMotion` | Read once; animation modules check it |

### Module reference

| # | Module | Notes |
| --- | --- | --- |
| 1 | `initTheme` | Assignment 1, plus it listens for `prefs:reset` |
| 2–3 | `initScrollEffects` | Assignment 1 |
| 4 | `initMobileNav` | Assignment 1 |
| 5 | `initSmoothScroll` | Assignment 1 |
| 6 | `initScrollSpy` | Assignment 1; the new `/github` link is picked up automatically |
| 7 | `initGreeting` | **Extended** — see below |
| 8 | `initTypeEffect` | Assignment 1 |
| 9 | `initReveal` | Assignment 1 |
| 10 | `initCounters` | Assignment 1 |
| 11 | `initForm` | **Extended** — see below |
| 12 | `initCopyEmail` | **Extended**: success and failure toasts; the `execCommand` fallback now checks its return value instead of assuming success |
| 13 | `initBackToTop` | Assignment 1 |
| 14 | `initCommandPalette` | **Extended**: 22 commands, including category filters, *Refresh GitHub data*, *Change my name* and *Reset saved preferences* |
| 15 | `toast` | **New** |
| 16 | `initProjectFilter` | **New** — see below |
| 17 | `initGitHubRepos` | **New** — see [§8](#8-data-handling-storage-and-the-github-api) |
| 18 | `initTimelineDetails` | **New** — inserts a toggle before each `.timeline-more` panel; manages `aria-expanded`, `aria-controls` and `aria-hidden` |
| 19 | `initConnectionStatus` | **New** — `offline` / `online` window events become toasts |
| 20 | `initResetPreferences` | **New** — removes every key in `KEYS`, emits `prefs:reset`, confirms with a toast |

`initProjectFilter` runs before `initReveal` in `init()`, so cards hidden by a saved filter are
settled before the scroll-reveal starts observing.

### `initProjectFilter`

State is three values: `{ filter, sort, query }`. Each card is read **once** at start-up into
`{ card, categories, date, impact, title, text }`, so searching never queries the DOM per
keystroke. `text` is the card's whole text content, lower-cased and whitespace-collapsed, so search
matches titles, descriptions, kickers and tags.

```js
function apply(animate) {
  projects.slice().sort(comparators[state.sort]).forEach(function (project) {
    list.appendChild(project.card);                          // re-append = reorder
    var match = inCategory(project, state.filter) &&
                (!query || project.text.indexOf(query) > -1);
    project.card.classList.toggle('is-hidden', !match);
  });
  // ...staggered entrance, aria-pressed on chips, "Showing X of Y", empty state, save
}
```

- **Reorder without re-rendering.** `appendChild` on a node that is already in the document
  *moves* it. Sorting just re-appends the existing cards in a new order, so images are never
  reloaded and event listeners are kept.
- **Sorting is stable and has tie-breakers.** *Newest* compares `YYYY-MM` strings and falls back
  to impact when two projects share a month.
- **Saved state is validated.** The stored filter must match an existing chip and the stored sort
  must be a known comparator; otherwise the defaults are used. A stale or hand-edited
  `localStorage` value cannot break the section.
- **Only the category and sort are saved**, not the search text. A search is a momentary action;
  coming back to an empty result list would be confusing.
- **Cards revealed by a filter are marked `is-visible`.** A card hidden at load never intersected
  the scroll-reveal observer, so it would otherwise stay at `opacity: 0` when the filter changes.
- Each chip shows its count (e.g. *AI 4*), worked out from the data rather than written in the HTML.

### `initGreeting` (extended)

- Time band and name are combined: *"Good evening, Sara. Welcome back."*
- **Validation:** empty, shorter than 2 characters, or containing digits/symbols is rejected with
  a specific message. Repeated spaces are collapsed.
- **Arabic names work.** The rule is written as a *blacklist* of digits and symbols rather than a
  whitelist using `\p{L}`. Unicode property escapes are a *syntax* error in older engines, which
  would stop the entire script from running, not just this feature.
- When saved: the form hides, a **change name** button appears, a toast confirms, and the contact
  form's name field is pre-filled if empty.

### `initForm` (extended)

| Addition | Detail |
| --- | --- |
| Draft autosave | Every `input` event restarts a 400ms timer (a debounce), then writes `{name, email, message}` to `contactDraft`. Empty drafts are removed rather than stored. |
| Draft restore | On load, a saved draft is put back and a toast says so. Otherwise the saved visitor name pre-fills the name field. |
| Error summary | "2 fields need fixing — see the messages under them." |
| Shake | Each failed field gets `is-shaking`; an `animationend` listener on the form removes it so it can replay next time. |
| `mailto:` hand-off | A valid submit builds `mailto:…?subject=…&body=…` with `encodeURIComponent` and shows **Open in your email app**. The page still transmits nothing itself. |
| Draft cleared | On success, both the pending debounce timer and the stored draft are cleared. |
| Stale confirmation | Typing again clears the success message and hides the mail button. |

---

## 8. Data handling: storage and the GitHub API

### `localStorage` keys

| Key | Written by | Value | Cleared by |
| --- | --- | --- | --- |
| `theme` | Theme toggle | `"light"` / `"dark"` | Reset |
| `visitorName` | Name form | String, ≤ 30 characters | Reset |
| `projectView` | Project filter | `{ filter, sort }` | Reset |
| `contactDraft` | Contact form (debounced) | `{ name, email, message }` | Successful submit, reset |
| `githubRepos` | GitHub module | `{ time, repos: [...] }` | Refresh replaces it; reset |

The inline `<head>` script reads `theme` directly because it runs before `script.js` loads; the key
name is the same.

### GitHub module — request lifecycle

```
section within 600px of viewport (IntersectionObserver, fires once)
          │
          ▼
   cached copy < 1 hour old? ── yes ──> render it (no network)
          │ no
          ▼
   show 6 skeleton cards + "Loading repositories from GitHub…"
          │
          ▼
   fetch(api.github.com/users/mibnrashid/repos?per_page=100&sort=pushed)
   raced against an 8-second timer (AbortController cancels the request)
          │
   ┌──────┴────────────────────────────┐
   ▼ success                           ▼ failure
 slim + cache + render          cached copy exists (any age)?
                                  ├─ yes ─> render it, "Showing a saved copy from 2 hours ago",
                                  │         toast explaining the failure
                                  └─ no ──> specific error message + Retry button
```

- **Lazy.** Visitors who never scroll that far never make the request.
- **Slimmed before caching.** Each repository is reduced from about 100 fields to the 7 the page
  uses (`name, description, url, language, stars, fork, pushed`), which keeps the cache small.
- **Why cache for an hour.** Unauthenticated requests to the GitHub API are limited to 60 per hour
  per IP address. Without a cache, a visitor browsing between pages could use that up. With it, a
  visitor makes at most one request an hour, and repeat visits are instant.
- **Refresh** and **Retry** bypass the cache (`load(true)`). A guard flag ignores a second load
  while one is in flight.
- **Self-recovery.** If loading failed, the `online` event triggers a fresh attempt automatically.

### Distinguishing failures

`fetch` only rejects on network failure; an HTTP error is a resolved response with `ok: false`.
The module maps every outcome to a typed error:

| Type | Detected by |
| --- | --- |
| `offline` | `fetch` rejected and `navigator.onLine === false` |
| `network` | `fetch` rejected while online (DNS, CORS, connection reset) |
| `timeout` | The 8-second timer fired first |
| `rate-limit` | Status 403 or 429 **and** `X-RateLimit-Remaining: 0`; the reset time comes from `X-RateLimit-Reset` |
| `http` | Any other non-OK status |
| `format` | The body was not an array |
| `unsupported` | No `fetch` or `Promise` in the browser |

GitHub lists `X-RateLimit-*` in `Access-Control-Expose-Headers`, which is what lets browser code
read them on a cross-origin response.

### Rendering

- Cards are built with `createElement` + `textContent` — never `innerHTML` — because the data comes
  from outside the site.
- The summary row (repositories, original vs fork, languages, stars, most-used language) and the
  language dropdown, with counts, are worked out from the data. The selected language is kept when
  the list is rebuilt, if it still exists.
- Search, language, sort and the fork toggle combine. Any change resets paging to the first 6.
- **Show more** adds 6 at a time and moves keyboard focus to the first new card.
- Relative dates ("3 days ago") use `Intl.RelativeTimeFormat` where available, with a hand-written
  fallback.
- Language dots use GitHub's own colours, passed in as a CSS custom property (`--lang-color`).

---

## 9. Error handling and user feedback

The brief's rule — *tell the user what happened and what to do next* — applied to every state.

| Situation | What the visitor sees | What they can do |
| --- | --- | --- |
| GitHub loading | 6 shimmering skeleton cards; status "Loading repositories from GitHub…"; `aria-busy` | Wait (8s maximum) |
| Offline | "You appear to be offline." + explanation | Reconnect (auto-retries) or **Retry** |
| Timeout | "GitHub is taking too long to answer." | **Retry**, or *view on GitHub* |
| Rate limit | "GitHub's hourly request limit has been reached… resets at 14:30." | Wait, or *view on GitHub* |
| HTTP error | "GitHub returned an error (502)." | **Retry** |
| Failure with a cache | List from cache + "Showing a saved copy from …" + toast | **refresh** later |
| No repositories match | "No repositories match "xyz"." | **Reset filters** |
| No projects match | "No projects match "xyz" in AI." | **Clear filters** |
| Invalid name | Specific inline message (empty / too short / symbols) | Correct it; the error clears as they type |
| Invalid contact form | Per-field messages, error count, shake, focus on first bad field | Correct; fields re-validate live |
| Valid contact form | "Thanks, Omar — your message is ready…" | **Open in your email app** |
| Copy failed | Error toast: "select the address and copy it by hand" | Copy manually |
| Connection lost / back | Toasts | — |
| Draft restored | Toast | — |

### Toasts

`toast(message, type)` builds the element with `textContent`, appends it to `#toasts`
(`role="status"`, `aria-live="polite"`, so it is announced), keeps at most three on screen, and
dismisses after 4.5s or on the × button. The exit animation runs before removal.

### Validation messages say how to fix the problem

"Please enter a valid email address, like name@example.com." gives an example of the right format.
"Letters only, please — no numbers or symbols." says which characters to remove.

---

## 10. Images

### Assignment 1 pipeline

Source photographs (7.2 MB) were cropped and resized with Pillow to web resolution in WebP and
JPEG: 347 KB in WebP, a 95% reduction. Originals live in `.originals/`, which git ignores.

### Assignment 2: responsive widths

Lighthouse showed phones still downloading the 1600px desktop images. Each image now has smaller
variants, generated with Pillow (Lanczos resampling, same quality settings as before):

| Image | Widths | Smallest WebP |
| --- | --- | --- |
| Ice Offering screenshot | 640, 960, 1600 | 16 KB (was 56 KB) |
| KAUST poster photo | 640, 960, 1600 | 35 KB (was 142 KB) |
| Portrait | 640, 900 | 96 KB (was 157 KB) |

```html
<source type="image/webp"
        srcset="assets/images/kaust-eeg-poster-640.webp 640w,
                assets/images/kaust-eeg-poster-960.webp 960w,
                assets/images/kaust-eeg-poster.webp 1600w"
        sizes="(max-width: 880px) calc(100vw - 4rem), 490px">
```

`sizes` describes the card's actual rendered width, so the browser picks the smallest file that is
still sharp for the screen's pixel density. 960w exists because a 390px phone at 2–3× density needs
about 800–1100 real pixels; with only 640 and 1600, those phones jumped straight to the largest file.

Every image keeps explicit `width`/`height`, `loading="lazy"` and `decoding="async"`. Each card's
media box has a fixed `aspect-ratio: 16 / 10` with `object-fit: cover`, so screenshots, photos and
the CSS-drawn terminal placeholders line up.

---

## 11. Accessibility

| Area | Implementation |
| --- | --- |
| Filter chips | `<button>` with `aria-pressed`; the group has `role="group"` and an `aria-label` |
| Search boxes | `type="search"` with a visually-hidden `<label>` |
| Live regions | `#projectCount`, `#ghStatus`, `#formStatus` and `#toasts` are `aria-live`, so changes are announced |
| Loading | `aria-busy` on the repository list while loading; skeletons are `aria-hidden` |
| Expand / collapse | `aria-expanded` + `aria-controls` on the button; `aria-hidden` on the collapsed panel, matching what is seen |
| Paging | **Show more** moves focus to the first new card, so keyboard users don't have to tab from the top |
| Name form | Label, `aria-describedby` to its error, `role="alert"` on the error, `aria-invalid` |
| Repo cards | Each card is one link; its accessible name is its text, starting with the repository name |
| Palette hint | Accessible name now includes the visible text "jump to" (a Lighthouse *label-content-name-mismatch* fix) |
| Motion | Every A2 animation is covered by `prefers-reduced-motion` |
| Kept from A1 | Landmarks, skip link, one focus ring, alt text, `aria-pressed` theme toggle, dialog semantics, checked contrast |

Lighthouse Accessibility score: **100**, desktop and mobile.

---

## 12. Performance

### Lighthouse

| | Performance | Accessibility | Best practices | SEO | FCP | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop | **100** | 100 | 100 | 100 | 0.3 s | 0.5 s | 0.01 | 0 ms |
| Mobile (median of 3) | **95** | 100 | 100 | 100 | 2.0 s | 2.3 s | 0.02 | 0 ms |

Measured locally with Lighthouse 12 in Chrome, against Python's `http.server`. That server does
not compress responses; GitHub Pages serves gzip, which Lighthouse estimated would save another
~109 KB. Mobile runs on a local machine vary (three runs scored 98, 81, 95), so the median is
reported.

### What was changed, and what each change did

| Change | Effect |
| --- | --- |
| Font stylesheet preloaded and swapped in `onload` instead of a blocking `<link rel="stylesheet">` | Mobile FCP 3.5 s → 1.2–2.0 s |
| `srcset` with 640/960px variants | Phones download the 16–67 KB variants instead of the 56–157 KB desktop files; total mobile page weight 453 KB → 410 KB |
| Hero uses a CSS-only entrance instead of the JS scroll-reveal | The first screen no longer waits for the deferred script to fade in; desktop LCP 1.3 s → 0.5 s |
| Palette-hint `aria-label` | Fixed the one Lighthouse accessibility warning |

### Ongoing techniques

- **No dependencies**, 0 KB third-party JavaScript. HTML + CSS + JS ≈ 37 KB gzipped.
- **Lazy GitHub request** and a **one-hour cache**.
- **Search does no DOM queries.** Card text is read once at start-up; each keystroke is a string
  search over 7 cached strings plus a class toggle per card.
- **Draft saving is debounced** (400ms), so typing does not write to storage on every key.
- **No layout shift**: image dimensions, fixed media aspect ratios, and `min-height` on status
  lines and error messages.
- One `passive`, `requestAnimationFrame`-throttled scroll listener; all other visibility work uses
  `IntersectionObserver`, and observers disconnect when done.

---

## 13. Browser support and graceful degradation

**Tested:** Chrome, Edge, Firefox and WebKit (the engine behind Safari), via Playwright, at 390,
834 and 1440px.

| If this is missing | Behaviour |
| --- | --- |
| JavaScript | All 7 projects and all experience details visible; toolbars and name form stay hidden; GitHub section shows a link to github.com (verified with JS disabled) |
| `fetch` or `Promise` | GitHub section shows the "This browser cannot load live data" message with a link |
| `AbortController` | The timeout still rejects; the request is simply not cancelled |
| `Intl.RelativeTimeFormat` | Hand-built "3 days ago" |
| `CustomEvent` constructor | `document.createEvent('CustomEvent')` fallback |
| `IntersectionObserver` | Reveals and counters show immediately; GitHub loads immediately |
| `localStorage` | Nothing persists; every feature still works |
| Clipboard API | `execCommand('copy')`, then an error toast if that fails too |
| `scroll-behavior` | Manual scroll in JavaScript |
| WebP | `<picture>` serves JPEG (at the same responsive widths) |

---

## 14. Testing

### Automated functional tests — 64 checks × 4 browsers, 256/256 passing

Written with **Playwright** and run against the site on a local server, in Chrome, Edge, Firefox
and WebKit. Requests to `api.github.com` are intercepted with `context.route`, so the tests do not
depend on GitHub, do not use up its rate limit, and can force every failure mode on purpose: a
real saved response for success, an aborted request, a 403 with rate-limit headers, and a request
that never answers.

| Area | Checks |
| --- | --- |
| **Projects** (13) | Toolbar shown · 7 listed · AI filter → 4 · `aria-pressed` · filter + search combine → 1 · empty state appears and names the query · Clear filters → 7 · *Newest* order · *A–Z* order · filter persists over reload · sort persists · correct cards visible after reload |
| **GitHub — success** (12) | No request before scrolling near · 6 cards on first page · status shows total · summary shown · cache written · Show more → 12 · search · fork toggle · language filter · empty state · reset filters · second visit served from cache with no request |
| **GitHub — failure** (8) | Network failure → error message · Retry button · Retry recovers · failure with cache → saved copy shown · rate limit message · skeletons during load · "Loading" status · timeout message after 8s |
| **Greeting** (9) | Empty rejected · digits rejected · whitespace normalised and greeting personalised · form hides · toast · persists over reload · contact name pre-filled · change name reopens form · Arabic name accepted |
| **Contact form** (9) | 3 errors on empty submit · shake applied · error summary · draft restored after reload · restore toast · bad email caught · success message · `mailto:` shown and correctly encoded · draft cleared |
| **Timeline** (4) | 3 toggles inserted · toggle sets `aria-expanded` / `aria-hidden` · open panel has height · closed panel has none |
| **Other** (6) | Palette command filters projects · copy toast · offline toast · reset clears all 5 keys · reset restores greeting · reset restores filter |
| **Layout & health** (3) | No horizontal scroll at 390px and 834px · no console or page errors |

### Additional checks

- **JavaScript disabled:** 7 projects visible, toolbars hidden, details expanded, GitHub
  `<noscript>` link present.
- **Reduced motion:** every reveal visible, filtered cards at full opacity, typing replaced by
  static text, no errors.
- **Visual review:** full-page screenshots in dark and light at 1440px and 390px, plus the GitHub
  loading and error states and the form success state, in each browser.
- **Lighthouse:** see [§12](#12-performance).

### Bugs the tests found

| Bug | Fix |
| --- | --- |
| Name form stayed visible after saving | Component `display` rules beat the UA `[hidden]` rule → global `[hidden] { display: none !important }` |
| Collapsed details panel still 14px tall | Child padding inside a `0fr` grid row → spacing moved to the panel as an animated margin |
| Cards filtered in after load stayed invisible | They had never been seen by the reveal observer → mark `is-visible` when shown by a filter |

### Notes on test tooling

- Playwright's Firefox build sets `navigator.onLine = false` when taken offline but does not fire
  the `offline` event. The Firefox run dispatches the event itself so the handler is still tested.
- Playwright 1.48 could not launch the installed Edge build directly, so Edge was started with
  `--remote-debugging-port` and Playwright attached over the DevTools protocol.
- Browsers log a console error for every failed network request, including the ones the tests
  cause on purpose; those specific messages are excluded from the "no console errors" check.
  Any other error fails the test.

### Reproducing

The test scripts are development tooling and live outside the repository.

```bash
py -3 -m http.server 8765                      # 1. serve the site
npm install playwright                         # 2. in a scratch folder
npx playwright install firefox webkit
node test.js chrome                            # 3. run: chrome | msedge | firefox | webkit
```

---

## 15. Deployment

GitHub Pages from the `main` branch root (*Settings → Pages → Deploy from a branch → `main` /
`(root)`*). Published at `https://mibnrashid.github.io/202437440-MusaIbnRashid-assignment2/`.

There is no build step. All paths are relative, so the site works at a `/repository-name/` subpath
and from the file system. `.nojekyll` stops Pages from running Jekyll over the files.

---

## 16. Known limitations and future work

| Limitation | Note |
| --- | --- |
| The form transmits nothing itself | Required by the brief (no backend). The `mailto:` hand-off makes it useful without one. |
| GitHub data depends on GitHub | Mitigated by the cache, the stale-copy fallback and clear error messages. Unauthenticated requests are limited to 60/hour per IP. |
| Many repositories have no description | The cards show "No description provided." Adding descriptions on GitHub improves the section without code changes. |
| Ice Offering's date is an estimate | Its repository is private, so `data-date="2025-09"` is an estimate; it only affects the *Newest* sort order. |
| Tests are not in the repository | Development tooling with machine-specific browser setup. |
| Lighthouse measured locally | Without compression; the live site should match or exceed it. |

### Planned for later assignments

- A real form backend (e.g. Formspree) with sending, success and failure states
- Per-project detail pages, with the filter state kept in the URL so it can be shared
- An Arabic / English toggle
- Lighthouse and axe-core in CI on every push

---

*Last updated: 23 October 2026*
