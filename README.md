# Musa Ibn Rashid — Personal Portfolio

**Assignment 1: Foundation & AI Integration** · Student ID `202437440`

A responsive single-page personal portfolio built with plain HTML, CSS and JavaScript — no
frameworks, no build step, no dependencies. Open `index.html` and it runs.

🔗 **Live site:** https://mibnrashid.github.io/202437440-MusaIbnRashid-assignment1/

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Running it locally](#running-it-locally)
- [Using the site](#using-the-site)
- [Project structure](#project-structure)
- [Tech stack and design decisions](#tech-stack-and-design-decisions)
- [Responsive design](#responsive-design)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Browser support](#browser-support)
- [Testing](#testing)
- [AI usage](#ai-usage)
- [Assignment requirements](#assignment-requirements)
- [Contact](#contact)

---

## Overview

The site presents seven sections — About, Skills, Projects, Experience, Education, Awards and
Contact — in a single scrolling page with a sticky navigation bar.

The visual direction is a **dark "terminal console"** theme: near-black backgrounds, a warm gold
accent, and three typefaces doing three jobs: JetBrains Mono for headings, navigation and
labels, Source Serif 4 for prose, and the system sans for form inputs. The intent is something
that reads as a developer's workspace while still feeling considered rather than noisy. A light theme (warm ivory and bronze) is available through the
theme toggle.

It is deliberately built without a CSS framework. The assignment asks for practice with HTML, CSS
and JavaScript fundamentals, so the layout is hand-written CSS Grid and Flexbox, and every
interactive behaviour is written directly against the DOM API.

---

## Features

### Content
- Seven sections covering the full CV — about, skills, projects, experience, education, awards, contact
- Three project cards, two with real photography (a product screenshot and a research poster)
- Downloadable CV (PDF)

### Interactivity — 13 JavaScript features
| Feature | What it does |
| --- | --- |
| Theme toggle | Switches dark/light, remembers the choice in `localStorage`, and follows the OS preference until a choice is made |
| Command palette | `/` opens a searchable list of sections and actions, with subsequence matching and arrow-key navigation |
| Scrollspy | Highlights the navigation link for whichever section is in view |
| Smooth scrolling | Animated anchor jumps, with a manual fallback for browsers lacking `scroll-behavior` |
| Time-of-day greeting | The terminal card greets differently depending on the hour |
| Typing effect | Cycles through four roles with a typing/deleting animation |
| Scroll reveal | Sections fade and rise into view as you scroll, slightly staggered |
| Animated counters | Four statistics count up from zero with an ease-out curve |
| Form validation | Per-field rules, inline error messages, live correction, and a success state |
| Copy to clipboard | One-click copy of the email address, with a fallback for older browsers |
| Scroll progress bar | A gold hairline across the top tracking reading position |
| Back to top | Appears after 600px of scrolling |
| Mobile navigation | Hamburger menu that closes on selection, on `Escape`, and on resize to desktop |

---

## Running it locally

The site is fully static, so there is nothing to install and nothing to build.

### Option 1 — open the file directly

```bash
git clone https://github.com/mibnrashid/202437440-MusaIbnRashid-assignment1.git
cd 202437440-MusaIbnRashid-assignment1
```

Then double-click `index.html`, or open it from your browser's **File → Open** menu.

Everything works this way except one detail: some browsers block the Clipboard API on the
`file://` protocol, so the "copy" button next to the email address may do nothing. If you want to
test that, use a local server instead.

### Option 2 — serve it locally (recommended)

Pick whichever of these you already have installed, run it from the project root, then open
**http://localhost:8000**.

```bash
# Python 3 (bundled with macOS and most Linux distributions)
python -m http.server 8000

# Python 3 on Windows
py -3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

### Option 3 — VS Code

Install the **Live Server** extension, then right-click `index.html` → *Open with Live Server*.

### Deploying

The site is deployed with **GitHub Pages** from the `main` branch root. To reproduce:
*Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.* The first build
takes a minute or two, after which it publishes to
`https://<username>.github.io/<repository-name>/`.

---

## Using the site

| Action | How |
| --- | --- |
| Jump to a section | Click a navigation link, or press `/` and search |
| Switch light/dark | Click the sun/moon button in the top-right |
| Download the CV | "Download CV" in the hero, or via the command palette |
| Copy the email | Click "copy" beside the address in the Contact section |
| Return to the top | Click the circular arrow at the bottom-right, or the `musa@portfolio:~$` brand |

**Keyboard shortcuts**

- `/` — open the command palette (ignored while typing in a form field)
- `↑` `↓` — move through palette results
- `Enter` — run the highlighted result
- `Esc` — close the palette or the mobile menu
- `Tab` — a "Skip to main content" link appears first, before the navigation

> **Note on the contact form:** the assignment specifies no backend, so the form validates input
> and confirms in the interface without transmitting anything. The form itself says so, to avoid
> misleading a visitor into thinking a message was sent.

---

## Project structure

```
202437440-MusaIbnRashid-assignment1/
├── index.html                      # The entire page - semantic HTML, 7 sections
├── css/
│   └── styles.css                  # All styling, organised into 19 commented sections
├── js/
│   └── script.js                   # All behaviour, 13 self-contained feature modules
├── assets/
│   ├── favicon.svg                 # Gold six-point snowflake
│   ├── musa-ibn-rashid-cv.pdf      # Downloadable CV
│   └── images/
│       ├── musa-portrait.jpg/.webp       # About section portrait
│       ├── kaust-eeg-poster.jpg/.webp    # EEG project photo
│       └── ice-offering.jpg/.webp        # Ice Offering screenshot
├── docs/
│   ├── ai-usage-report.md          # Required AI usage documentation
│   ├── technical-documentation.md  # Architecture, decisions, testing
│   └── assignment-brief.md         # The original assignment specification
├── .gitignore
└── README.md
```

---

## Tech stack and design decisions

| Choice | Reason |
| --- | --- |
| **Vanilla HTML/CSS/JS** | The assignment's stated goal is practising fundamentals. A framework would have hidden exactly the Grid, Flexbox and DOM work being assessed — and it keeps the page dependency-free. |
| **CSS custom properties for theming** | Both themes are defined as two sets of colour tokens. Every component is written once and works in both, so there is no duplicated dark-mode CSS. |
| **CSS Grid + Flexbox** | Grid for page and section layout (`about-grid`, `projects`, `skills-grid`), Flexbox for component internals (navigation, tag lists, buttons). |
| **Three typefaces, three jobs** | JetBrains Mono for headings, navigation and labels (the terminal voice); Source Serif 4 for prose, which reads as considered next to the mono where a default UI sans read as generic; the system sans for form inputs, where a familiar native field beats consistency. |
| **`<picture>` with WebP + JPEG** | WebP for modern browsers, JPEG as a guaranteed fallback. |
| **No build step** | Nothing to install, nothing to compile, no `node_modules`. The repository is the site. |

A full write-up of the architecture, the theming approach and each JavaScript module is in
[`docs/technical-documentation.md`](docs/technical-documentation.md).

---

## Responsive design

Built mobile-first in effect, with three breakpoints:

| Breakpoint | Changes |
| --- | --- |
| **> 1024px** — desktop | Two-column About and Contact; projects alternate image left/right |
| **≤ 1024px** — tablet | Projects collapse to one column; Contact stacks |
| **≤ 860px** — small tablet | Navigation becomes a hamburger menu; About stacks; statistics go 2×2 |
| **≤ 560px** — phone | Full-width buttons; single-column facts; tighter timeline; smaller terminal text |

Fluid typography and spacing use `clamp()` throughout, so sizes scale smoothly *between*
breakpoints rather than jumping at them.

Verified at 390px (phone), 834px (tablet) and 1440px (desktop) — screenshots and method in the
[technical documentation](docs/technical-documentation.md#testing).

---

## Accessibility

- Semantic landmarks — `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`
- A "Skip to main content" link as the first focusable element
- One visible focus ring applied consistently via `:focus-visible`
- Descriptive `alt` text on every photograph; decorative elements marked `aria-hidden`
- Form inputs are label-associated, with errors announced through `role="alert"` and `aria-invalid`
- `aria-expanded` on the menu button, `aria-pressed` on the theme toggle, `role="dialog"` on the palette
- The command palette returns focus to wherever it was opened from
- `prefers-reduced-motion` is honoured: reveals, typing, counters and smooth scrolling all stand down
- Both themes were checked for text contrast — the light theme darkens gold to bronze for this reason

---

## Performance

- **No dependencies** — no framework, no jQuery, no icon library. SVG icons are inline.
- **578 KB fully loaded** — measured over HTTP with every image and both fonts: 347 KB images,
  150 KB fonts, 80 KB of HTML/CSS/JS, 0 KB third-party JavaScript.
- **Images optimised** — the three source images were 7.2 MB; they are served at web resolution as
  347 KB of WebP (539 KB if a browser falls back to JPEG), a **95% reduction**.
- **`width`/`height` on every image** so the browser reserves space and the layout does not shift.
- **`loading="lazy"`** on below-the-fold images.
- **`scroll` listeners throttled** with `requestAnimationFrame`; observation work handed to
  `IntersectionObserver` rather than scroll maths.
- **Reveal observers disconnect** after an element has appeared, so nothing keeps watching.
- **Theme applied before first paint** by a small inline script, avoiding a flash of the wrong theme.

---

## Browser support

Tested in Chrome, Edge and Firefox. Uses `IntersectionObserver`, CSS custom properties, `clamp()`
and `aspect-ratio` — all supported in every current browser.

Degradation is deliberate rather than accidental:

| If this is missing | What happens |
| --- | --- |
| JavaScript | The `no-js` class keeps all content visible; only the palette and back-to-top button are hidden |
| `IntersectionObserver` | Reveals and counters skip straight to their final state |
| `scroll-behavior` | JavaScript performs the scroll instead |
| Clipboard API | Falls back to a hidden textarea and `document.execCommand('copy')` |
| `localStorage` | Every access is wrapped in `try/catch`; the theme simply does not persist |
| WebP | The `<picture>` element serves JPEG |

---

## Testing

28 automated functional tests cover the JavaScript features — theme persistence across reload,
form validation in all three states, clipboard contents, palette search and keyboard navigation,
scrollspy, mobile menu, and reduced-motion behaviour. All 28 pass with no console errors.

The method, the full test list and the responsive screenshots are documented in
[`docs/technical-documentation.md`](docs/technical-documentation.md#testing).

---

## AI usage

**Claude Code** (Claude Opus) was used throughout this assignment — analysing the brief and CV,
generating and reviewing code, optimising the images, writing an automated test pass, and drafting
documentation.

A specific example of its value: during review it identified a colour-contrast bug I had not
noticed — in the light theme the primary button rendered near-black text on dark bronze, because
the button's text colour was hardcoded rather than tokenised. The fix was to add an `--on-gold`
token that flips with the theme.

The full account — tools, use cases, benefits, challenges, learning outcomes and how I reviewed
and modified the output — is in [`docs/ai-usage-report.md`](docs/ai-usage-report.md).

---

## Contact

**Musa Ibn Rashid** — B.Sc. Software Engineering, KFUPM

- Email: [m.ibnrashid@gmail.com](mailto:m.ibnrashid@gmail.com)
- GitHub: [github.com/mibnrashid](https://github.com/mibnrashid)
- LinkedIn: [linkedin.com/in/musaibnrashid](https://linkedin.com/in/musaibnrashid)

---

## Assignment requirements

| Requirement | Where |
| --- | --- |
| Public repo named `id-name-assignment1` | `202437440-MusaIbnRashid-assignment1` |
| Clear folder structure | `css/`, `js/`, `assets/`, `docs/` |
| Meaningful commit history | Incremental commits, one per feature area |
| Well-written `README.md` | This file |
| At least three sections | Seven: about, skills, projects, experience, education, awards, contact |
| About Me — intro, tagline, image | `#about`, plus the hero tagline and portrait |
| Projects — 2+ with title, description, image | Three: Ice Offering, EEG-to-Image, Hackathon Prototypes |
| Contact — Name, Email, Message, no backend | `#contact`, validated client-side only |
| Responsive across desktop/tablet/mobile | Four breakpoints, verified at 390/834/1440px |
| CSS Grid or Flexbox | Both, throughout |
| At least one JavaScript feature | Thirteen |
| At least one AI tool used | Claude Code |
| `docs/ai-usage-report.md` | [Link](docs/ai-usage-report.md) |
| `docs/technical-documentation.md` | [Link](docs/technical-documentation.md) |
| Clean, commented, no broken links | 19 commented CSS sections, 13 commented JS modules; all links verified |
| `.gitignore` | Present |
| Optional deployment link | GitHub Pages, linked at the top |

---

*Built as Assignment 1 of a portfolio that later assignments will expand into a full professional
site.*
