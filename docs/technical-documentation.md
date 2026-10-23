# Technical Documentation

**Project:** Musa Ibn Rashid — Personal Portfolio
**Assignment 1: Foundation & AI Integration** · `202437440`

---

## Contents

1. [Architecture](#1-architecture)
2. [File reference](#2-file-reference)
3. [HTML structure](#3-html-structure)
4. [CSS architecture](#4-css-architecture)
5. [Theming](#5-theming)
6. [Responsive strategy](#6-responsive-strategy)
7. [JavaScript modules](#7-javascript-modules)
8. [Image pipeline](#8-image-pipeline)
9. [Accessibility](#9-accessibility)
10. [Performance](#10-performance)
11. [Browser support and graceful degradation](#11-browser-support-and-graceful-degradation)
12. [Testing](#12-testing)
13. [Deployment](#13-deployment)
14. [Known limitations and future work](#14-known-limitations-and-future-work)

---

## 1. Architecture

A three-file static site: one HTML document, one stylesheet, one script. No framework, no build
step, no dependencies, no `node_modules`. The repository *is* the deployable artefact — there is no
compile step between source and site.

```
index.html ──> css/styles.css      (presentation)
           └─> js/script.js        (behaviour, deferred)
                    │
                    └─> reads/writes: localStorage (theme), DOM
```

Three rules hold the structure together:

1. **Separation of concerns.** Structure in HTML, presentation in CSS, behaviour in JavaScript.
   The script sets no inline styles except two computed values that cannot be expressed in CSS —
   the progress bar's `width` and the typed role text.
2. **Behaviour is additive.** Every JavaScript feature enhances a page that already works without
   it. Nothing essential is rendered by script.
3. **State lives in the DOM.** The theme is an attribute on `<html>`, open/closed states are
   classes, and CSS reacts to them. There is no JavaScript-side state object mirroring the DOM.

---

## 2. File reference

| File | Lines | Purpose |
| --- | --- | --- |
| `index.html` | 580 | Semantic markup for all seven sections, plus the command palette dialog |
| `css/styles.css` | 1179 | All presentation, in 19 numbered and commented sections |
| `js/script.js` | 685 | All behaviour, in 13 self-contained modules inside one IIFE |
| `assets/favicon.svg` | 14 | Gold six-point snowflake, inline SVG |
| `assets/musa-ibn-rashid-cv.pdf` | — | Downloadable CV |
| `assets/images/*.{jpg,webp}` | — | Three images, two formats each |
| `docs/*.md` | — | This file, the AI usage report, and the original brief |
| `.gitignore` | — | Ignores `.originals/` (unoptimised source images), OS and editor noise |

### Why `.originals/` is ignored

The unoptimised source images (7.2 MB) are kept locally in `.originals/` but excluded from the
repository. The web-ready versions in `assets/images/` are what the site serves. This keeps the
clone small while the originals remain available locally for re-processing at different sizes.

---

## 3. HTML structure

```
<html class="no-js" data-theme="dark">
 ├── <head>
 │    ├── meta: charset, viewport, description, author, theme-color, color-scheme
 │    ├── Open Graph tags
 │    ├── favicon, font preconnect + JetBrains Mono, stylesheet
 │    └── inline script ....................... theme applied before first paint
 └── <body>
      ├── .scroll-progress ..................... fixed reading-position bar
      ├── .skip-link ........................... first focusable element
      ├── <header class="site-header"> ......... sticky; brand, nav, actions
      ├── <main id="main">
      │    ├── #hero ........................... name, tagline, terminal card, CTAs, stats
      │    ├── #about .......................... portrait + intro + facts list
      │    ├── #skills ......................... 4 grouped tag cards
      │    ├── #projects ....................... 3 alternating project blocks
      │    ├── #experience ..................... 6-entry timeline (<ol>)
      │    ├── #education ...................... 2 cards
      │    ├── #awards ......................... 4 entries
      │    └── #contact ........................ links + validated form
      ├── <footer class="site-footer">
      ├── .back-to-top
      └── .cmdk ................................ command palette dialog
```

### Element choices

| Content | Element | Why |
| --- | --- | --- |
| Experience | `<ol>` | Chronologically ordered, so an ordered list is semantically correct |
| Each project / skill group / award | `<article>` | Independently meaningful, self-contained units |
| Portrait + caption | `<figure>` / `<figcaption>` | The caption describes the image |
| About facts | `<dl>` with `<div>` wrappers | Name/value pairs; the wrappers allow Grid layout over `<dt>`/`<dd>` |
| Images | `<picture>` | Serves WebP with a JPEG fallback |

### The inline head script

```html
<script>
  (function () {
    document.documentElement.classList.remove('no-js');
    try {
      var saved = localStorage.getItem('theme');
      var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      document.documentElement.setAttribute('data-theme', saved || (prefersLight ? 'light' : 'dark'));
    } catch (e) { /* localStorage blocked - the dark default in the markup stands */ }
  })();
</script>
```

This is the one piece of script that must be inline and blocking. It does two things before first
paint:

- **Removes `no-js`.** The stylesheet uses `.no-js .reveal { opacity: 1 }` so that content is never
  permanently hidden when JavaScript is unavailable. If the class were removed later — in
  `DOMContentLoaded`, as it originally was — every section would paint visible and then snap to
  hidden before fading in. Removing it here means the correct state is set before anything renders.
- **Applies the saved theme.** An external file would load too late and the page would flash the
  wrong theme.

`localStorage` access is wrapped because it throws, rather than returning `null`, in some privacy
modes.

---

## 4. CSS architecture

`styles.css` is organised into 19 numbered sections, each with a comment header:

| # | Section | # | Section |
| --- | --- | --- | --- |
| 1 | Design tokens | 11 | Experience timeline |
| 2 | Reset & base | 12 | Education |
| 3 | Utilities | 13 | Awards |
| 4 | Header & navigation | 14 | Contact |
| 5 | Buttons | 15 | Footer |
| 6 | Hero | 16 | Back to top |
| 7 | Section shell | 17 | Command palette |
| 8 | About | 18 | Responsive |
| 9 | Skills | 19 | Accessibility & print |
| 10 | Projects | | |

### Conventions

- **Naming:** flat, descriptive, lowercase-hyphenated class names (`.project-media`,
  `.timeline-date`). State classes are prefixed `is-` (`.is-visible`, `.is-active`, `.is-open`,
  `.is-scrolled`, `.has-error`) so it is obvious at a glance which classes JavaScript touches.
- **Specificity:** kept flat. Almost every rule is a single class. There are no ID selectors and
  no `!important` outside the `prefers-reduced-motion` block, where overriding every animation is
  the intent.
- **Layout:** Grid for page and section structure, Flexbox for component internals.
- **No hardcoded colours in components.** Every colour references a token — this is enforced by
  convention, and the one violation of it caused a real bug (see [Theming](#5-theming)).

### Vertical rhythm

Section spacing is one token, `--section-y`, applied as `padding-block` on every section. Because
it applies to both sides, **the gap between two sections is twice the token** — a detail that is
easy to get wrong.

It was originally `clamp(4.5rem, 9vw, 8rem)`, which produced a 128px top plus 128px bottom and so
a **256px gap between every section** — roughly double a normal rhythm, and it read as the page
falling apart into disconnected blocks. Measuring the real content-to-content gaps at 1440px made
it obvious.

Now `clamp(3rem, 5vw, 4.75rem)`, giving:

| Viewport | Padding each side | Gap between sections |
| --- | --- | --- |
| 1440px | 72px | 144px |
| 1024px | 51px | 102px |
| ≤ 834px | 48px | 96px |

Total page height dropped from 8118px to 7278px, about 10% shorter, with no content removed.

### Typography

Three typefaces, each with one job, so the hierarchy is carried by typeface as well as by size:

| Token | Family | Used for |
| --- | --- | --- |
| `--font-mono` | JetBrains Mono | Headings, navigation, labels, statistics, captions, tags — the terminal voice |
| `--font-prose` | Source Serif 4 | All body prose — about, project and timeline descriptions |
| `--font-ui` | System sans | Form inputs, and the small values in the About facts list |

The prose font was originally the system sans stack, chosen for speed. In review it read as
generic against the mono headings — the page looked like a developer template rather than
something designed. Four candidates were rendered against the real About section and compared:
the system stack, Source Serif 4, Newsreader and Inter.

Source Serif 4 was chosen. Against a near-black background, a serif needs enough stroke weight not
to look thin; Source Serif 4 holds up where Newsreader, the more elegant of the two serifs, began
to feel delicate. Inter was the safe option but too close in character to what was being replaced
to be worth the change.

Form inputs deliberately keep the system sans. A native-feeling text field is worth more to
someone filling in a form than typographic consistency.

Cost: 150 KB of WOFF2 for both families, requested in a single `css2` call, with `display=swap` so
text paints immediately in Georgia or the system sans while the web fonts arrive.

### Grid and Flexbox usage

| Component | Technique |
| --- | --- |
| `.about-grid` | Grid, `minmax(240px, 340px) 1fr` — fixed-ish portrait column, fluid text |
| `.skills-grid`, `.edu-grid` | Grid, `repeat(auto-fit, minmax(230px, 1fr))` — reflows with no breakpoint |
| `.project` | Grid, `1.15fr 1fr`; `.project-reverse .project-media { order: 2 }` alternates sides |
| `.stats`, `.facts` | Grid, fixed column counts that drop at breakpoints |
| `.timeline` | Grid for row spacing; the vertical rule is a `border-left`, nodes are `::before` |
| `.nav`, `.tags`, `.btn`, `.award` | Flexbox — one-dimensional, content-sized |

---

## 5. Theming

Two themes from one set of components. Section 1 declares the colour tokens; `[data-theme="light"]`
redeclares the same names with different values. No component is written twice.

```css
:root {                        [data-theme="light"] {
  --bg:      #07080b;            --bg:      #f7f5f0;
  --text:    #e9e6df;            --text:    #16181d;
  --gold:    #d4af37;            --gold:    #8a6a12;
  --on-gold: #07080b;            --on-gold: #fdfcf8;
  ...                            ...
}                              }
```

### The `--on-gold` token, and the bug that produced it

Gold is `#d4af37` in dark mode and darkens to bronze `#8a6a12` in light mode, because the bright
gold does not have enough contrast against an ivory background.

The primary button originally hardcoded its text colour:

```css
.btn-primary {
  background: linear-gradient(135deg, var(--gold), var(--gold-soft));
  color: #07080b;                  /* correct in dark, unreadable in light */
}
```

Near-black on bright gold is correct. Near-black on dark bronze is close to unreadable. The fix
was to make the foreground a token that flips with the theme:

```css
.btn-primary {
  background: linear-gradient(135deg, var(--gold), var(--gold-soft));
  color: var(--on-gold);           /* near-black in dark, near-white in light */
}
```

The same bug affected `.skip-link`. **The general rule this produced: any colour that sits *on* an
accent needs to be a token too, not just the accent itself.**

Worth noting that all 28 functional tests passed both before and after this fix — nothing was
broken in a way automated tests can detect. The button worked perfectly; it was simply unreadable.
This one was caught by reading the CSS and by looking at a rendered screenshot.

### Theme resolution order

1. `localStorage.theme`, if the visitor has explicitly chosen — always wins.
2. Otherwise `prefers-color-scheme`, and the page keeps following the OS if it changes.
3. Otherwise dark, which is the value hardcoded on `<html>`.

Once a choice is stored, the OS listener stops applying — an explicit choice is not overridden by a
system change.

---

## 6. Responsive strategy

Two mechanisms, used for different jobs.

### Fluid scaling with `clamp()` — the primary mechanism

```css
--section-y: clamp(3rem, 5vw, 4.75rem);          /* section padding, both sides */
.hero-name  { font-size: clamp(2.5rem, 8.5vw, 5.25rem); }
.container  { padding-inline: clamp(1.15rem, 4vw, 2rem); }
```

Type and spacing scale continuously with the viewport, so sizes are correct *between* breakpoints
rather than jumping at them. Combined with `auto-fit` grids, most of the layout adapts with no
media query at all.

### Breakpoints — for structural changes only

| Breakpoint | What changes |
| --- | --- |
| **≤ 1024px** | Projects collapse to one column and `order` is reset; Contact stacks |
| **≤ 860px** | Navigation becomes a hamburger panel; `Ctrl+K` hint hidden (no physical keyboard assumed); About stacks; statistics go 2×2 |
| **≤ 560px** | Buttons full-width; facts single-column; timeline indent tightened; terminal text smaller; `scroll-padding-top` reduced to match the shorter header |

Media queries are all in section 18, together rather than scattered, so the responsive behaviour
can be read in one place.

### Verified viewports

| Width | Device class | Result |
| --- | --- | --- |
| 390px | Phone (iPhone 14) | Hamburger, 2×2 statistics, full-width buttons, no horizontal scroll |
| 834px | Tablet (iPad Air) | Hamburger, single-column projects, `auto-fit` skills at 3+1 |
| 1440px | Desktop | Full navigation, two-column About/Contact, alternating projects |

---

## 7. JavaScript modules

`script.js` is one IIFE in strict mode containing 13 feature modules plus `initYear()`, each
started from `init()`. Every module returns early if its elements are absent, so removing a section
from the HTML cannot throw.

### Shared helpers

```js
var $  = function (s, scope) { return (scope || document).querySelector(s); };
var $$ = function (s, scope) { return [].slice.call((scope || document).querySelectorAll(s)); };

var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

var storage = { get: ..., set: ... };   // every access wrapped in try/catch
```

`$$` converts the `NodeList` to a real array so `forEach`, `map` and `filter` are available.

### Module reference

| # | Module | Key implementation detail |
| --- | --- | --- |
| 1 | `initTheme` | Sets `data-theme`, `aria-pressed` and the `theme-color` meta together. Listens to `prefers-color-scheme` but only applies it while no stored choice exists. Uses `addEventListener` with an `addListener` fallback for Safari < 14. |
| 2/3 | `initScrollEffects` | One `passive` scroll listener drives the progress bar, the header hairline and the back-to-top visibility, throttled to one update per frame with a `ticking` flag and `requestAnimationFrame`. |
| 4 | `initMobileNav` | Toggles `.is-open` and `aria-expanded`. Closes on link click, on `Escape`, and on resize past 860px. |
| 5 | `initSmoothScroll` | Feature-detects `'scrollBehavior' in document.documentElement.style`; uses `scrollIntoView` when present, otherwise computes the offset manually minus the 90px header. Updates the hash with `history.replaceState` so the address bar is correct without a second jump. |
| 6 | `initScrollSpy` | `IntersectionObserver` with `rootMargin: '-45% 0px -50% 0px'` — only the horizontal band across the middle of the viewport counts as "in view", which prevents two sections being active at once. |
| 7 | `initGreeting` | Five time bands from `new Date().getHours()`. |
| 8 | `initTypeEffect` | Single recursive `setTimeout` whose delay varies by phase (65ms typing, 30ms deleting, 1900ms hold, 400ms gap) rather than an interval with a counter. Renders the first role statically under reduced motion. |
| 9 | `initReveal` | Observes `.reveal`, adds `.is-visible` with a 70ms-per-item stagger, then `unobserve`s — each element is watched only until it appears. Falls back to showing everything if `IntersectionObserver` is missing. |
| 10 | `initCounters` | `requestAnimationFrame` loop with an easeOutExpo curve (`1 - 2^(-10t)`), `toLocaleString('en-US')` for thousands separators, and `data-prefix`/`data-suffix` for `#1` and `4,000+`. CSS `font-variant-numeric: tabular-nums` stops the row reflowing as digits change. |
| 11 | `initForm` | See below. |
| 12 | `initCopyEmail` | `navigator.clipboard.writeText` with a hidden-textarea + `execCommand('copy')` fallback, used both when the API is absent and when its promise rejects. |
| 13 | `initBackToTop` | `window.scrollTo` with `behavior` set to `auto` under reduced motion. |
| 14 | `initCommandPalette` | See below. |

### `initForm` — validation

Rules are a lookup table of field name to validator, each returning an error string or `''`:

```js
var rules = {
  name:    function (v) { if (!v) return 'Please enter your name.';
                          if (v.length < 2) return 'That name looks too short.'; return ''; },
  email:   function (v) { if (!v) return 'Please enter your email address.';
                          if (!EMAIL_PATTERN.test(v)) return 'Please enter a valid email address.'; return ''; },
  message: function (v) { if (!v) return 'Please write a message.';
                          if (v.length < 10) return 'Please write at least 10 characters.'; return ''; }
};
```

- `EMAIL_PATTERN` is `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` — deliberately permissive. Fully validating
  an email address with a regular expression is not possible, and over-strict patterns reject
  legitimate addresses; this catches typos without blocking anyone.
- The form carries `novalidate` so the browser's own bubbles do not pre-empt the styled inline
  messages.
- **Timing:** validate on `blur`, then re-validate on `input` *only* for a field already marked
  wrong. A field is never marked invalid while it is first being typed into.
- **On submit**, every field is validated — `Object.keys(rules).map(validateField)` runs before
  `.every(Boolean)` — so all problems appear at once rather than one per attempt. Focus moves to
  the first invalid field.
- **On success**, the status line greets the sender by first name, the form resets, and the message
  clears after six seconds. No network request is made; the brief specifies no backend, and the
  form says so in visible text so a visitor is not misled into thinking a message was sent.
- **Accessibility:** each error has `role="alert"` and is wired to its input with `aria-describedby`;
  `aria-invalid` is kept in sync; `.error` has a `min-height` so validation does not shift layout.

### `initCommandPalette` — the `/` key

A 13-entry command list of `{ label, kind, icon, run }` objects covering the seven sections plus
theme toggle, CV download, copy email, and three external links.

**Subsequence matching** — typing `prj` finds `Projects`:

```js
function matches(label, query) {
  var haystack = label.toLowerCase(), needle = query.toLowerCase(), position = 0;
  for (var i = 0; i < needle.length; i++) {
    position = haystack.indexOf(needle[i], position);
    if (position === -1) return false;
    position++;
  }
  return true;
}
```

Each query character must appear after the previous one, so the characters need only be in order,
not adjacent.

Keyboard handling lives in one `document` `keydown` listener. The palette opens on `/`, which is
the convention GitHub and Slack use. It was originally `Ctrl`/`Cmd`+`K`, but Chrome reserves that
combination for its address bar and never delivers the event to the page, so it silently did
nothing; `Ctrl`/`Cmd`+`K` is still registered as a secondary trigger for browsers that do allow it.

Because `/` is an ordinary character, the handler ignores it whenever the caret is in an `input`,
`textarea`, `select` or `contenteditable` element, so it can still be typed normally — including
inside the palette's own search box. While open, `Escape` closes, `↑`/`↓` wrap around with
`(index + delta + length) % length`, and `Enter` runs the highlighted entry. Mouse hover and arrow keys drive the same `activeIndex`, so the two never
disagree. On close, focus returns to whatever element was focused when it opened.

---

## 8. Image pipeline

Source images were photographs and a screenshot at full capture resolution, totalling 7.2 MB.

### Processing

A Python/Pillow script (`.originals/` holds the inputs; the script is reproducible from this
description):

| Image | Source | Processing | Output |
| --- | --- | --- | --- |
| Portrait | 1187×2111 PNG, 4.8 MB | Cropped to 3:4 from the top (keeps face and award in frame), resized | 900×1200, JPEG q84 + WebP q84 |
| KAUST poster | 4000×2252 JPEG, 2.0 MB | Already ~16:9, downscaled only | 1600×900, JPEG q80 + WebP q80 |
| Ice Offering | 2881×1565 PNG, 410 KB | Downscaled | 1600×869, JPEG q88 + WebP q86 |

The Ice Offering screenshot uses a higher quality setting than the photographs: it contains small
interface text, where compression artefacts are far more visible than in a photograph.

### Results

| | Before | After (WebP) | After (JPEG) |
| --- | --- | --- | --- |
| Portrait | 4.8 MB | 153 KB | 204 KB |
| KAUST poster | 2.0 MB | 139 KB | 212 KB |
| Ice Offering | 410 KB | 54 KB | 123 KB |
| **Total** | **7.2 MB** | **347 KB** | **539 KB** |

A **95% reduction** for the WebP path.

### Delivery

```html
<picture>
  <source srcset="assets/images/musa-portrait.webp" type="image/webp">
  <img src="assets/images/musa-portrait.jpg" alt="..."
       width="900" height="1200" loading="lazy" decoding="async">
</picture>
```

`width` and `height` are always present so the browser reserves space and the layout does not
shift as images arrive. `loading="lazy"` applies to all three, all of which are below the fold.

### Presentation decisions

Each image is framed according to what it actually is:

- **Portrait** — a 3:4 card with `object-fit: cover` and `object-position: center top`, a hairline
  gold border and a bottom gradient scrim so the warm, busy photograph settles against the
  near-black page. Scales slightly on hover.
- **Ice Offering** — placed inside a mock browser window (traffic-light dots, a URL pill reading
  `iceoffering.com`). The screenshot's own dark navy interface sits naturally in the dark theme.
- **KAUST poster** — a plain 16:9 framed card; the photograph is already legible and needs no
  framing device.
- **Hackathon Prototypes** — has no photograph, so the placeholder is drawn in CSS: a terminal
  transcript on a faint diagonal-stripe background, consistent with the site's own aesthetic rather
  than a grey box.

---

## 9. Accessibility

| Area | Implementation |
| --- | --- |
| Landmarks | `<header>`, `<nav aria-label="Main navigation">`, `<main>`, `<footer>`, `<section>`, `<article>` |
| Skip link | First focusable element; moves into view on focus |
| Focus | One `:focus-visible` ring — 2px gold, 3px offset — applied globally, never removed |
| Images | Descriptive `alt` on all three photographs; decorative SVGs and the progress bar `aria-hidden` |
| Icon buttons | All have `aria-label` (theme toggle, menu, back to top, copy, palette) |
| Toggles | `aria-pressed` on the theme toggle, `aria-expanded` on the menu button |
| Form | `<label for>` on every input; errors in `role="alert"` and referenced by `aria-describedby`; `aria-invalid` kept in sync |
| Dialog | `role="dialog"`, `aria-modal="true"`, `role="listbox"`/`option` on results, focus restored on close |
| Motion | `prefers-reduced-motion` disables reveals, typing, counters and smooth scrolling, and gives each a static path |
| Contrast | Both themes checked; light-theme gold darkened to bronze, and `--on-gold` flips foregrounds on accent fills |
| Headings | One `<h1>` (the name), `<h2>` per section, `<h3>` for items — no skipped levels |
| Language | `lang="en"` on `<html>` |

---

## 10. Performance

### Weight

| Asset | Size |
| --- | --- |
| `index.html` | 25 KB |
| `css/styles.css` | 30 KB |
| `js/script.js` | 24 KB |
| Images (WebP) | 347 KB |
| Fonts (WOFF2) | 150 KB — JetBrains Mono 4 weights + Source Serif 4 variable |
| **Third-party JS** | **0 KB** |
| **Total, fully loaded** | **578 KB** (measured over HTTP with all images and fonts) |

### Techniques

- **No dependencies.** No framework, no jQuery, no icon font — icons are inline SVG.
- **Theme before paint.** The inline head script prevents a flash of the wrong theme.
- **Font loading.** Both families are requested in a single `css2` call rather than two;
  `preconnect` to both font hosts; `display=swap` so text renders immediately in a fallback
  (Georgia for the serif, the system sans for inputs) instead of blocking on the web font.
- **Scroll work minimised.** One `passive` scroll listener throttled with `requestAnimationFrame`;
  everything else uses `IntersectionObserver`.
- **Observers disconnect.** Reveal and counter observers `unobserve` each element once it has
  fired, so nothing keeps watching.
- **No layout shift.** Explicit `width`/`height` on images; `min-height` on error messages;
  `tabular-nums` on animated counters.
- **`defer` on the script**, so parsing is never blocked.

---

## 11. Browser support and graceful degradation

Tested in Chrome, Edge and Firefox. Modern features used: CSS custom properties, Grid, Flexbox,
`clamp()`, `aspect-ratio`, `color-mix()`, `backdrop-filter`, `IntersectionObserver`,
`navigator.clipboard`.

Every one of them has a defined fallback:

| Missing | Behaviour |
| --- | --- |
| JavaScript entirely | `.no-js` keeps all content visible; palette and back-to-top hidden; everything else — all content, all layout — works |
| `IntersectionObserver` | Reveals and counters jump to their final state |
| `scroll-behavior` | JavaScript computes and performs the scroll |
| `navigator.clipboard` | Hidden textarea + `execCommand('copy')` |
| `localStorage` | `try/catch` on every access; theme does not persist but nothing breaks |
| WebP | `<picture>` serves the JPEG |
| `matchMedia.addEventListener` | Falls back to the deprecated `addListener` (Safari < 14) |
| `color-mix()` | Header background falls back to opaque; `backdrop-filter` is decorative only |

The deliberate principle: **the page must be fully readable and navigable with JavaScript
disabled.** Only the two conveniences that cannot exist without script are hidden.

---

## 12. Testing

### Automated functional tests — 28, all passing

Run with `puppeteer-core` driving the locally installed Chrome in headless mode against the site
served over `http://127.0.0.1:8765`.

| Area | Tests |
| --- | --- |
| **Theme** (4) | Starts dark · toggles to light · writes to `localStorage` · survives a reload |
| **Greeting** (1) | Set by JavaScript and matches a time band |
| **Typing** (1) | Text changes between two samples 700ms apart |
| **Counters** (1) | All four reach exactly `4,000+`, `100,000+`, `#1`, `35,000+` |
| **Form** (5) | Empty submit flags all three fields · per-field messages appear · malformed email rejected · valid submit succeeds and greets by name · form resets |
| **Clipboard** (2) | Button label changes to "copied" · clipboard actually contains `m.ibnrashid@gmail.com` |
| **Command palette** (6) | `/` opens · `/` typed in a form field does *not* open it · `prj` finds `Projects` by subsequence · `Enter` runs and closes · scrolled to the right section · `Escape` closes |
| **Scrollspy** (1) | The correct nav link carries `.is-active` |
| **Back to top** (2) | Appears past 600px · returns the page to the top |
| **Mobile nav** (3) | Hamburger visible at 390px · opens and sets `aria-expanded` · closes after a link is chosen |
| **Reduced motion** (3) | Role shown statically · no `.reveal` left at `opacity: 0` · counter shows its final value |

Console and `pageerror` output is captured throughout: **no errors**.

### Rendering verification

Full-page screenshots captured at 390px, 834px and 1440px, dark and light, with the page scrolled
through first so lazy images load and the observers fire. Also captured: the command palette open,
and the contact form in both its error and success states. All reviewed visually — which is how the
light-theme contrast bug was confirmed fixed.

### Link and asset integrity

Every `src`, `href` and `srcset` pointing at a local file was checked to exist on disk, and every
internal `#anchor` checked against the `id`s actually present in the document. All resolve. The
site was additionally served over HTTP and each asset confirmed to return `200`.

### Reproducing the tests

The test scripts live outside the repository (they are development tooling, not part of the
submission). To reproduce:

```bash
# 1. Serve the site
py -3 -m http.server 8765 --bind 127.0.0.1

# 2. In a scratch directory
npm install puppeteer-core

# 3. Point puppeteer at an installed Chrome via executablePath and drive the page
```

---

## 13. Deployment

**GitHub Pages**, from the `main` branch root.

1. Push to `main`.
2. *Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.*
3. First build takes one to two minutes.

Published at `https://mibnrashid.github.io/202437440-MusaIbnRashid-assignment1/`.

No build step, so there is no workflow file and nothing to configure — Pages serves the repository
as-is. All asset paths are relative (`css/styles.css`, not `/css/styles.css`), which is what allows
the site to work both at a subpath like `/202437440-MusaIbnRashid-assignment1/` and when opened
directly from the filesystem.

---

## 14. Known limitations and future work

### Current limitations

| Limitation | Note |
| --- | --- |
| The contact form sends nothing | Required by the brief — no backend. Visible text on the form says so. |
| Clipboard copy may fail on `file://` | Browser policy on the `file:` protocol. Works over HTTP. |
| Third project has no real image | No photograph exists for it; a CSS-drawn placeholder stands in. |
| Single page | At seven sections this is fine; more content would justify routing. |
| Tests are not in the repository | They are development tooling and depend on a local Chrome path. |
| No automated Lighthouse run | Performance work was done from first principles (weight, shift, listeners) rather than against a score. |

### Planned for later assignments

- A real form backend, or a service such as Formspree, with success and failure states
- Per-project detail pages as the project list grows
- Screenshots replacing the hackathon placeholder
- An Arabic/English toggle — considered and cut for this assignment as over-scope for 2%, but a
  natural fit given the audience
- Automated Lighthouse and axe-core runs in CI
- `srcset` width descriptors so phones download smaller images, not just a different format

---

*Last updated: 19 September 2026*
