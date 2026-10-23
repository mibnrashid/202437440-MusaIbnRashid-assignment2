# AI Usage Report

**Student:** Musa Ibn Rashid · **ID:** 202437440 · **Assignment 2: Interactive Features**

## Summary

I used one AI tool for this assignment: **Claude Code** (Anthropic), running in VS Code. It helped
me plan the features, write a first version of the code, run tests and speed checks, and draft the
README and technical documentation.

I did not just paste its output. I read what it wrote, edited parts of the code and text myself,
made the decisions on scope (which projects to show, what to leave out, when to stop), and tested
the result on my own live link. No other AI tool was used.

## How I worked with it

1. **Planning.** I gave it the assignment brief and my LinkedIn for content ideas. It suggested
   features and asked me questions. I answered them, for example adding the SDAIA courses and
   keeping deployment to myself.
2. **Building.** It wrote each feature on its own branch. I looked through each one, changed what I
   wanted, and tested it.
3. **Checking.** It wrote browser tests and ran speed audits. I used the results to decide what
   still needed fixing.
4. **Writing up.** It drafted the README and technical documentation. I checked them against the
   site and corrected mistakes.

## Usage log

All dates are 2026-10-23. Tool for C01 and A01–A09: Claude Code (Opus 5.5). Tool for C02: Claude Code (Sonnet 5.5).

| ID | Tool (model) | Date | Purpose | Files affected | What I changed and how I verified it |
|----|--------------|------|---------|----------------|--------------------------------------|
| C01 | Claude Code (Opus 5.5) | 2026-10-23 | Main session: read the brief, plan features, build, test, write docs | See A01–A09 | I made the scope decisions, edited code and text myself along the way, and tested the result in my browser and on my live link. |
| C02 | Claude Code (Sonnet 5.5) | 2026-10-23 | Read the updated brief and put together this report and the evidence ZIP | `docs/ai-usage-report.md` | I read it through and corrected anything that did not match what I did. |
| A01 | Claude Code (Opus 5.5) | 2026-10-23 | Storage helpers, toast notifications, reset-preferences button | `index.html`, `css/styles.css`, `js/script.js` | Automated tests in 4 browsers, plus my own testing of saving, clearing and the toasts. |
| A02 | Claude Code (Opus 5.5) | 2026-10-23 | Project filter, live search and sort, with the choice remembered | `index.html`, `css/styles.css`, `js/script.js` | Automated tests in 4 browsers (typing, filtering, sorting, empty state), plus my own testing. I chose which projects to show. |
| A03 | Claude Code (Opus 5.5) | 2026-10-23 | "Live from GitHub" section: loading, error + retry, cache | `index.html`, `css/styles.css`, `js/script.js` | Automated tests covered the loading, failed and offline cases. I checked the section on my live link. |
| A04 | Claude Code (Opus 5.5) | 2026-10-23 | Saved visitor name, contact form autosave, mailto hand-off | `index.html`, `css/styles.css`, `js/script.js` | Automated tests covered good and bad form input and the saved name and draft; I also tried the form myself. |
| A05 | Claude Code (Opus 5.5) | 2026-10-23 | Expandable experience details and date fixes | `index.html`, `css/styles.css`, `js/script.js` | Date fixes and open/close (mouse and keyboard) covered by the automated tests; I reviewed the dates. |
| A06 | Claude Code (Opus 5.5) | 2026-10-23 | More command-palette commands (filter, refresh, name, reset) | `js/script.js` | Each command is covered by the automated tests; I tried the palette myself. |
| A07 | Claude Code (Opus 5.5) | 2026-10-23 | Smaller images, non-blocking fonts, CSS-only hero entrance | `assets/images/*`, `index.html`, `css/styles.css` | Compared Lighthouse scores before and after, and checked screenshots at phone and desktop widths. |
| A08 | Claude Code (Opus 5.5) | 2026-10-23 | Draft of README and technical documentation | `README.md`, `docs/technical-documentation.md` | Claims were checked against the site and code (a few counts were corrected), and I corrected the docs myself afterwards. |
| A09 | Claude Code (Opus 5.5) | 2026-10-23 | Test scripts (Playwright, 64 checks) and Lighthouse runs | Not in the repo | Ran in Chrome, Edge, Firefox and WebKit. Also tried the page with JavaScript off and with reduced motion on. |

**A note on commits.** At my request, Claude Code ran the git commands for me, so the commits show
my name and their messages do not carry an `Assisted-by:` line. This log is where each commit is
credited: A01–A08 match the eight feature branches (`feat/core-feedback`, `feat/project-filter`,
`feat/github-api`, `feat/personalisation`, `feat/experience-details`, `feat/command-palette`,
`perf/images-fonts`, `docs/assignment2`).

## What I learned

- How the filter, search and sort work together on one list, and how to save the choice with
  `localStorage` (with a safe fallback when storage is blocked).
- How to call the GitHub API with a loading state, a timeout, a friendly error and a retry button.
- Why a page should still work with JavaScript off or with reduced motion.
- How to read Lighthouse results and what actually made the page load faster (smaller images and
  fonts that do not block the first paint).

## Declaration

> I declare that this report and the attached evidence document all of my AI use in this assignment, with complete and unedited conversations, and that I understand and can explain all the code I submitted. I understand that undeclared AI use or a false declaration will be treated as plagiarism according to KFUPM regulations.

**Name:** Musa Ibn Rashid
**ID:** 202437440
**Date:** 2026-10-23
