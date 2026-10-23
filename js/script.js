/* ==========================================================================
   Musa Ibn Rashid - Portfolio
   Assignment 1: Foundation & AI Integration

   Each feature lives in its own small module below and is started from init()
   at the bottom. Every module checks that its elements exist first, so the
   file stays safe if a section is ever removed from index.html.

   Features
     1.  Theme toggle (dark default, saved to localStorage)
     2.  Scroll progress bar
     3.  Sticky header state
     4.  Mobile navigation
     5.  Smooth scrolling (with a fallback for older browsers)
     6.  Scrollspy - highlights the nav link for the section in view
     7.  Time-of-day greeting
     8.  Rotating role typing effect
     9.  Scroll-reveal animations
     10. Animated statistic counters
     11. Contact form validation
     12. Copy-to-clipboard email
     13. Back-to-top button
     14. Command palette (Ctrl/Cmd + K)
   ========================================================================== */

(function () {
  'use strict';

  /* Shorthand DOM helpers used throughout the file. */
  var $  = function (selector, scope) { return (scope || document).querySelector(selector); };
  var $$ = function (selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  };

  /* Honoured by the animation modules so motion-sensitive visitors get a
     static page instead of typing, counting and reveal effects. */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Every localStorage key the site uses, in one place, so "reset saved
     preferences" can clear exactly what was written and nothing else. */
  var KEYS = {
    theme:       'theme',
    name:        'visitorName',
    projectView: 'projectView',
    draft:       'contactDraft',
    repos:       'githubRepos'
  };

  /* localStorage throws in some privacy modes, so every access is wrapped. */
  var storage = {
    get: function (key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    },
    remove: function (key) {
      try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    },
    // JSON helpers - a corrupted value is treated as "nothing saved"
    getJSON: function (key) {
      try { return JSON.parse(storage.get(key)); } catch (e) { return null; }
    },
    setJSON: function (key, value) {
      storage.set(key, JSON.stringify(value));
    }
  };

  /* Modules announce a preferences reset with this event so each one can
     return to its default state without knowing about the others. */
  var RESET_EVENT = 'prefs:reset';

  function emit(name) {
    var event;
    try {
      event = new CustomEvent(name);
    } catch (e) {
      // Older browsers without the CustomEvent constructor
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(name, false, false, null);
    }
    document.dispatchEvent(event);
  }

  /* ======================================================================
     15. TOAST NOTIFICATIONS
     Defined first because most other modules report back through it.
     type: 'success' | 'error' | undefined (neutral)
     ====================================================================== */
  var TOAST_MS = 4500;
  var MAX_TOASTS = 3;

  function toast(message, type) {
    var region = $('#toasts');
    if (!region) return;

    var item = document.createElement('div');
    item.className = 'toast' + (type ? ' is-' + type : '');

    var text = document.createElement('span');
    text.textContent = message;

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.innerHTML = '&times;';

    item.appendChild(text);
    item.appendChild(close);
    region.appendChild(item);

    // Never let notifications pile up over the page
    while (region.children.length > MAX_TOASTS) region.removeChild(region.firstChild);

    var timer = window.setTimeout(dismiss, TOAST_MS);

    function dismiss() {
      window.clearTimeout(timer);
      if (!item.parentNode) return;
      item.classList.add('is-leaving');
      // Matches the 0.25s exit animation in the stylesheet
      window.setTimeout(function () {
        if (item.parentNode) item.parentNode.removeChild(item);
      }, 260);
    }

    close.addEventListener('click', dismiss);
  }

  /* ======================================================================
     1. THEME TOGGLE
     The initial theme is applied by the inline script in <head> to avoid a
     flash of the wrong theme. This module only handles switching.
     ====================================================================== */
  function initTheme() {
    var toggle = $('#themeToggle');
    if (!toggle) return;

    var root = document.documentElement;
    var meta = $('meta[name="theme-color"]');
    var media = window.matchMedia('(prefers-color-scheme: light)');

    function apply(theme) {
      root.setAttribute('data-theme', theme);
      toggle.setAttribute('aria-pressed', String(theme === 'light'));
      // Keeps the mobile browser chrome in step with the page background
      if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f5f0' : '#07080b');
    }

    apply(root.getAttribute('data-theme') || 'dark');

    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      storage.set(KEYS.theme, next);
    });

    // Follow the OS only while the visitor has not chosen a theme themselves
    var onSystemChange = function (event) {
      if (!storage.get(KEYS.theme)) apply(event.matches ? 'light' : 'dark');
    };
    if (media.addEventListener) media.addEventListener('change', onSystemChange);
    else if (media.addListener) media.addListener(onSystemChange);   // Safari < 14

    // After a reset there is no saved choice, so fall back to the OS again
    document.addEventListener(RESET_EVENT, function () {
      apply(media.matches ? 'light' : 'dark');
    });
  }

  /* ======================================================================
     2 & 3. SCROLL PROGRESS BAR + STICKY HEADER STATE
     Both react to scroll, so they share one throttled listener.
     ====================================================================== */
  function initScrollEffects() {
    var bar = $('#scrollProgress');
    var header = $('#siteHeader');
    var backToTop = $('#backToTop');
    var ticking = false;

    function update() {
      var scrolled = window.scrollY;
      var height = document.documentElement.scrollHeight - window.innerHeight;

      if (bar) {
        var percent = height > 0 ? (scrolled / height) * 100 : 0;
        bar.style.width = percent + '%';
      }
      if (header) header.classList.toggle('is-scrolled', scrolled > 8);
      if (backToTop) backToTop.classList.toggle('is-visible', scrolled > 600);

      ticking = false;
    }

    // requestAnimationFrame throttling keeps this off the scroll critical path
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  /* ======================================================================
     4. MOBILE NAVIGATION
     ====================================================================== */
  function initMobileNav() {
    var toggle = $('#navToggle');
    var links = $('#navLinks');
    if (!toggle || !links) return;

    function close() {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close after choosing a destination, and on Escape
    $$('a', links).forEach(function (link) { link.addEventListener('click', close); });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    // Reset the menu if the viewport grows back to desktop width
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) close();
    });
  }

  /* ======================================================================
     5. SMOOTH SCROLLING
     CSS `scroll-behavior: smooth` covers modern browsers. This adds the same
     behaviour for browsers without it, and keeps the URL hash in sync.
     ====================================================================== */
  function initSmoothScroll() {
    var supportsNative = 'scrollBehavior' in document.documentElement.style;

    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;

        var target = document.querySelector(id);
        if (!target) return;

        event.preventDefault();

        if (supportsNative && !prefersReducedMotion) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Manual fallback: account for the sticky header height
          var offset = target.getBoundingClientRect().top + window.scrollY - 90;
          window.scrollTo(0, offset);
        }

        // Update the address bar without triggering a second jump
        if (history.replaceState) history.replaceState(null, '', id);
      });
    });
  }

  /* ======================================================================
     6. SCROLLSPY
     Marks the nav link whose section currently occupies the viewport.
     ====================================================================== */
  function initScrollSpy() {
    var links = $$('.nav-links a');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute('href');
      var section = id && id.length > 1 ? document.querySelector(id) : null;
      if (section) {
        map[section.id] = link;
        sections.push(section);
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) { link.classList.remove('is-active'); });
        if (map[entry.target.id]) map[entry.target.id].classList.add('is-active');
      });
    }, {
      // Only the band across the middle of the screen counts as "in view"
      rootMargin: '-45% 0px -50% 0px',
      threshold: 0
    });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ======================================================================
     7. TIME-OF-DAY GREETING
     ====================================================================== */
  function initGreeting() {
    var element = $('#greeting');
    if (!element) return;

    var hour = new Date().getHours();
    var greeting;

    if (hour < 5)       greeting = 'Up late. Welcome.';
    else if (hour < 12) greeting = 'Good morning. Welcome.';
    else if (hour < 17) greeting = 'Good afternoon. Welcome.';
    else if (hour < 21) greeting = 'Good evening. Welcome.';
    else                greeting = 'Good night. Welcome.';

    element.textContent = greeting;
  }

  /* ======================================================================
     8. ROTATING ROLE TYPING EFFECT
     Types a role, holds it, deletes it, moves to the next one.
     ====================================================================== */
  function initTypeEffect() {
    var element = $('#roleText');
    if (!element) return;

    var roles = [
      'Software Engineering student @ KFUPM',
      'AI Instructor @ SDAIA Academy',
      'QA Engineer Intern @ Sawt',
      'Builder of Ice Course Offering'
    ];

    // Motion-sensitive visitors get the first role with no animation
    if (prefersReducedMotion) {
      element.textContent = roles[0];
      return;
    }

    var TYPE_MS = 65, DELETE_MS = 30, HOLD_MS = 1900, GAP_MS = 400;
    var roleIndex = 0;
    var charIndex = 0;
    var isDeleting = false;

    function tick() {
      var current = roles[roleIndex];

      charIndex += isDeleting ? -1 : 1;
      element.textContent = current.slice(0, charIndex);

      var delay = isDeleting ? DELETE_MS : TYPE_MS;

      if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
        delay = HOLD_MS;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = GAP_MS;
      }

      window.setTimeout(tick, delay);
    }

    tick();
  }

  /* ======================================================================
     9. SCROLL REVEAL
     ====================================================================== */
  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    // Without IntersectionObserver, show everything rather than hiding it
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      items.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, self) {
      entries.forEach(function (entry, index) {
        if (!entry.isIntersecting) return;
        // Small stagger so grouped cards arrive in sequence
        window.setTimeout(function () {
          entry.target.classList.add('is-visible');
        }, index * 70);
        self.unobserve(entry.target);   // reveal once, then stop watching
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* ======================================================================
     10. ANIMATED COUNTERS
     ====================================================================== */
  function initCounters() {
    var counters = $$('.stat-value');
    if (!counters.length) return;

    function format(element, value) {
      var prefix = element.getAttribute('data-prefix') || '';
      var suffix = element.getAttribute('data-suffix') || '';
      return prefix + value.toLocaleString('en-US') + suffix;
    }

    function run(element) {
      var target = parseInt(element.getAttribute('data-count'), 10) || 0;

      if (prefersReducedMotion) {
        element.textContent = format(element, target);
        return;
      }

      var DURATION = 1600;
      var start = null;

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / DURATION, 1);
        // easeOutExpo - fast at first, settling gently on the final number
        var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        element.textContent = format(element, Math.round(target * eased));
        if (progress < 1) window.requestAnimationFrame(step);
      }

      window.requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }

    var observer = new IntersectionObserver(function (entries, self) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        self.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) { observer.observe(counter); });
  }

  /* ======================================================================
     11. CONTACT FORM VALIDATION
     There is no backend for this assignment, so a valid submission is
     acknowledged in the interface and nothing is sent anywhere.
     ====================================================================== */
  function initForm() {
    var form = $('#contactForm');
    if (!form) return;

    var status = $('#formStatus');
    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var rules = {
      name: function (value) {
        if (!value) return 'Please enter your name.';
        if (value.length < 2) return 'That name looks too short.';
        return '';
      },
      email: function (value) {
        if (!value) return 'Please enter your email address.';
        if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email address.';
        return '';
      },
      message: function (value) {
        if (!value) return 'Please write a message.';
        if (value.length < 10) return 'Please write at least 10 characters.';
        return '';
      }
    };

    function validateField(name) {
      var input = $('#' + name);
      var error = $('#' + name + 'Error');
      if (!input || !error) return true;

      var message = rules[name](input.value.trim());

      error.textContent = message;
      input.closest('.field').classList.toggle('has-error', Boolean(message));
      input.setAttribute('aria-invalid', String(Boolean(message)));

      return !message;
    }

    // Validate on blur, then live-correct once a field is already marked wrong
    Object.keys(rules).forEach(function (name) {
      var input = $('#' + name);
      if (!input) return;

      input.addEventListener('blur', function () { validateField(name); });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('has-error')) validateField(name);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Runs every field so all problems are shown at once, not one at a time
      var results = Object.keys(rules).map(validateField);
      var isValid = results.every(Boolean);

      if (!isValid) {
        status.textContent = 'Please fix the highlighted fields.';
        status.className = 'form-status is-error';
        var firstBad = $('.field.has-error input, .field.has-error textarea');
        if (firstBad) firstBad.focus();
        return;
      }

      var name = $('#name').value.trim().split(' ')[0];
      status.textContent = 'Thanks, ' + name + ' - your message has been validated.';
      status.className = 'form-status is-success';
      form.reset();

      window.setTimeout(function () {
        status.textContent = '';
        status.className = 'form-status';
      }, 6000);
    });
  }

  /* ======================================================================
     12. COPY EMAIL
     ====================================================================== */
  function initCopyEmail() {
    var button = $('#copyEmail');
    var link = $('#emailLink');
    if (!button || !link) return;

    button.addEventListener('click', function () {
      var email = link.textContent.trim();

      function done() {
        button.textContent = 'copied';
        button.classList.add('is-copied');
        window.setTimeout(function () {
          button.textContent = 'copy';
          button.classList.remove('is-copied');
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      // For browsers without the async clipboard API, or when it is blocked
      function fallbackCopy() {
        var field = document.createElement('textarea');
        field.value = email;
        field.setAttribute('readonly', '');
        field.style.position = 'absolute';
        field.style.left = '-9999px';
        document.body.appendChild(field);
        field.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
        document.body.removeChild(field);
      }
    });
  }

  /* ======================================================================
     13. BACK TO TOP
     Visibility is handled in initScrollEffects; this is just the click.
     ====================================================================== */
  function initBackToTop() {
    var button = $('#backToTop');
    if (!button) return;

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ======================================================================
     14. COMMAND PALETTE (Ctrl/Cmd + K)
     A keyboard-first way to jump between sections and run page actions.
     ====================================================================== */
  function initCommandPalette() {
    var palette = $('#cmdk');
    var input = $('#cmdkInput');
    var list = $('#cmdkList');
    var openButton = $('#cmdkOpen');
    if (!palette || !input || !list) return;

    var commands = [
      { label: 'About',              kind: 'section', icon: '#', run: function () { goTo('#about'); } },
      { label: 'Skills',             kind: 'section', icon: '#', run: function () { goTo('#skills'); } },
      { label: 'Projects',           kind: 'section', icon: '#', run: function () { goTo('#projects'); } },
      { label: 'Experience',         kind: 'section', icon: '#', run: function () { goTo('#experience'); } },
      { label: 'Education',          kind: 'section', icon: '#', run: function () { goTo('#education'); } },
      { label: 'Awards',             kind: 'section', icon: '#', run: function () { goTo('#awards'); } },
      { label: 'Contact',            kind: 'section', icon: '#', run: function () { goTo('#contact'); } },
      { label: 'Toggle theme',       kind: 'action',  icon: '>', run: function () { $('#themeToggle').click(); } },
      { label: 'Download CV',        kind: 'action',  icon: '>', run: function () { window.location.href = 'assets/musa-ibn-rashid-cv.pdf'; } },
      { label: 'Copy email address', kind: 'action',  icon: '>', run: function () { goTo('#contact'); $('#copyEmail').click(); } },
      { label: 'Open GitHub',        kind: 'link',    icon: '^', run: function () { window.open('https://github.com/mibnrashid', '_blank', 'noopener'); } },
      { label: 'Open LinkedIn',      kind: 'link',    icon: '^', run: function () { window.open('https://linkedin.com/in/musaibnrashid', '_blank', 'noopener'); } },
      { label: 'Open Ice Offering',  kind: 'link',    icon: '^', run: function () { window.open('https://iceoffering.com', '_blank', 'noopener'); } }
    ];

    var filtered = commands.slice();
    var activeIndex = 0;
    var lastFocused = null;

    function goTo(hash) {
      var target = document.querySelector(hash);
      if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }

    /* Subsequence match, so "prj" still finds "Projects". */
    function matches(label, query) {
      if (!query) return true;

      var haystack = label.toLowerCase();
      var needle = query.toLowerCase();
      var position = 0;

      for (var i = 0; i < needle.length; i++) {
        position = haystack.indexOf(needle[i], position);
        if (position === -1) return false;
        position++;
      }
      return true;
    }

    function render() {
      list.innerHTML = '';

      if (!filtered.length) {
        var empty = document.createElement('li');
        empty.className = 'cmdk-empty';
        empty.textContent = 'No matching command.';
        list.appendChild(empty);
        return;
      }

      filtered.forEach(function (command, index) {
        var item = document.createElement('li');
        item.className = 'cmdk-item' + (index === activeIndex ? ' is-active' : '');
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', String(index === activeIndex));

        item.innerHTML =
          '<span class="cmdk-icon">' + command.icon + '</span>' +
          '<span>' + command.label + '</span>' +
          '<span class="cmdk-kind">' + command.kind + '</span>';

        item.addEventListener('click', function () { execute(index); });
        item.addEventListener('mouseenter', function () {
          activeIndex = index;
          render();
        });

        list.appendChild(item);
      });
    }

    function filter(query) {
      filtered = commands.filter(function (command) { return matches(command.label, query); });
      activeIndex = 0;
      render();
    }

    function execute(index) {
      var command = filtered[index];
      if (!command) return;
      close();
      command.run();
    }

    function open() {
      lastFocused = document.activeElement;
      palette.hidden = false;
      input.value = '';
      filter('');
      input.focus();
    }

    function close() {
      palette.hidden = true;
      // Return focus to wherever the visitor was before opening the palette
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    function move(delta) {
      if (!filtered.length) return;
      activeIndex = (activeIndex + delta + filtered.length) % filtered.length;
      render();

      var active = $('.cmdk-item.is-active', list);
      if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
    }

    if (openButton) openButton.addEventListener('click', open);

    /* True while the caret is in a field, so "/" can still be typed normally. */
    function isTypingTarget(element) {
      if (!element) return false;
      var tag = element.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable;
    }

    document.addEventListener('keydown', function (event) {
      // "/" is the primary shortcut, the way GitHub and Slack do it. Chrome
      // reserves Ctrl+K for its address bar and never passes it to the page,
      // so Ctrl/Cmd+K is kept only as a secondary trigger for browsers that
      // do allow it.
      var slashKey = event.key === '/' && !isTypingTarget(event.target);
      var comboKey = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

      if (palette.hidden) {
        if (slashKey || comboKey) {
          event.preventDefault();
          open();
        }
        return;
      }

      // From here the palette is open, and the search input has focus
      if (comboKey) {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === 'Escape')         { event.preventDefault(); close(); }
      else if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
      else if (event.key === 'ArrowUp')   { event.preventDefault(); move(-1); }
      else if (event.key === 'Enter')     { event.preventDefault(); execute(activeIndex); }
    });

    input.addEventListener('input', function () { filter(input.value.trim()); });

    // Clicking the dimmed backdrop (but not the panel) closes the palette
    palette.addEventListener('click', function (event) {
      if (event.target === palette) close();
    });
  }

  /* ======================================================================
     16. PROJECT FILTER, SEARCH AND SORT
     The project cards are plain HTML (so they exist without JavaScript).
     This module reads each card's data-category / data-date / data-impact
     attributes, then hides and reorders the cards to match the controls.
     The chosen category and sort order are remembered in localStorage.
     ====================================================================== */
  function initProjectFilter() {
    var list = $('#projectList');
    var toolbar = $('#projectToolbar');
    if (!list || !toolbar) return;

    var chips = $$('.chip', toolbar);
    var search = $('#projectSearch');
    var sort = $('#projectSort');
    var count = $('#projectCount');
    var empty = $('#projectEmpty');
    var emptyQuery = $('#projectEmptyQuery');
    var resetButton = $('#projectReset');

    var DEFAULTS = { filter: 'all', sort: 'impact' };

    /* Read every card once up front, rather than querying the DOM on each
       keystroke. The search text covers title, description and tags. */
    var projects = $$('.project', list).map(function (card) {
      return {
        card: card,
        categories: (card.getAttribute('data-category') || '').split(' '),
        date: card.getAttribute('data-date') || '',
        impact: parseInt(card.getAttribute('data-impact'), 10) || 99,
        title: ($('.project-title', card) || card).textContent.trim(),
        text: card.textContent.replace(/\s+/g, ' ').toLowerCase()
      };
    });

    var comparators = {
      impact: function (a, b) { return a.impact - b.impact; },
      newest: function (a, b) { return b.date.localeCompare(a.date) || a.impact - b.impact; },
      az:     function (a, b) { return a.title.localeCompare(b.title); }
    };

    var validFilters = chips.map(function (chip) { return chip.getAttribute('data-filter'); });
    var saved = storage.getJSON(KEYS.projectView) || {};

    // Saved values are checked, so an old or edited entry cannot break the page
    var state = {
      filter: validFilters.indexOf(saved.filter) > -1 ? saved.filter : DEFAULTS.filter,
      sort: comparators[saved.sort] ? saved.sort : DEFAULTS.sort,
      query: ''
    };

    function inCategory(project, filter) {
      return filter === 'all' || project.categories.indexOf(filter) > -1;
    }

    // Each chip shows how many projects it contains, e.g. "AI 4"
    chips.forEach(function (chip) {
      var filter = chip.getAttribute('data-filter');
      var total = projects.filter(function (project) { return inCategory(project, filter); }).length;
      var badge = document.createElement('span');
      badge.className = 'chip-count';
      badge.textContent = total;
      chip.appendChild(badge);
    });

    function chipLabel(filter) {
      var chip = $('.chip[data-filter="' + filter + '"]', toolbar);
      return chip ? chip.firstChild.textContent.trim() : filter;
    }

    function apply(animate) {
      var query = state.query.toLowerCase();
      var visible = [];

      projects.slice().sort(comparators[state.sort]).forEach(function (project) {
        // Re-appending moves the existing node, which reorders the grid
        list.appendChild(project.card);

        var match = inCategory(project, state.filter) && (!query || project.text.indexOf(query) > -1);
        project.card.classList.toggle('is-hidden', !match);
        if (match) visible.push(project.card);
      });

      // On first load the scroll-reveal fades the cards in; after that, each
      // change replays a short staggered entrance.
      if (animate) {
        visible.forEach(function (card, index) {
          // A card that was filtered out never passed the scroll-reveal
          // observer, so it is marked visible here before animating in.
          card.classList.add('is-visible');
          if (prefersReducedMotion) return;
          card.classList.remove('is-entering');
          void card.offsetWidth;            // restarts the animation
          card.style.animationDelay = (index * 45) + 'ms';
          card.classList.add('is-entering');
        });
      }

      chips.forEach(function (chip) {
        chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === state.filter));
      });
      sort.value = state.sort;

      // Result summary, e.g. 'Showing 2 of 7 projects in AI matching "kaust"'
      var summary = 'Showing ' + visible.length + ' of ' + projects.length + ' projects';
      if (state.filter !== 'all') summary += ' in ' + chipLabel(state.filter);
      if (state.query) summary += ' matching "' + state.query + '"';
      count.textContent = summary;

      empty.hidden = visible.length > 0;
      if (!visible.length) {
        emptyQuery.textContent = (state.query ? '"' + state.query + '"' : 'this filter') +
          (state.filter !== 'all' ? ' in ' + chipLabel(state.filter) : '');
      }

      storage.setJSON(KEYS.projectView, { filter: state.filter, sort: state.sort });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.filter = chip.getAttribute('data-filter');
        apply(true);
      });
    });

    search.addEventListener('input', function () {
      state.query = search.value.trim();
      apply(true);
    });

    // Escape clears the search box, the way most search fields behave
    search.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && search.value) {
        event.stopPropagation();
        search.value = '';
        state.query = '';
        apply(true);
      }
    });

    sort.addEventListener('change', function () {
      state.sort = sort.value;
      apply(true);
    });

    function resetFilters() {
      state.filter = DEFAULTS.filter;
      state.query = '';
      search.value = '';
      apply(true);
    }

    resetButton.addEventListener('click', function () {
      resetFilters();
      search.focus();
    });

    document.addEventListener(RESET_EVENT, function () {
      state.sort = DEFAULTS.sort;
      resetFilters();
      storage.remove(KEYS.projectView);
    });

    toolbar.hidden = false;
    apply(false);
  }

  /* ======================================================================
     19. ONLINE / OFFLINE NOTICES
     ====================================================================== */
  function initConnectionStatus() {
    window.addEventListener('offline', function () {
      toast('You are offline. The page still works; live GitHub data will return when you reconnect.', 'error');
    });
    window.addEventListener('online', function () {
      toast('Back online.', 'success');
    });
  }

  /* ======================================================================
     20. RESET SAVED PREFERENCES
     Clears every key in KEYS, then tells the other modules to return to
     their defaults through the reset event.
     ====================================================================== */
  function initResetPreferences() {
    var button = $('#resetPrefs');
    if (!button) return;

    button.addEventListener('click', function () {
      Object.keys(KEYS).forEach(function (name) { storage.remove(KEYS[name]); });
      emit(RESET_EVENT);
      toast('Saved preferences cleared: theme, name, project filters, message draft and cached GitHub data.', 'success');
    });
  }

  /* ======================================================================
     FOOTER YEAR
     ====================================================================== */
  function initYear() {
    var element = $('#year');
    if (element) element.textContent = String(new Date().getFullYear());
  }

  /* ======================================================================
     INIT
     ====================================================================== */
  function init() {
    // Tells the stylesheet that scripting is available
    document.documentElement.classList.remove('no-js');

    initTheme();
    initScrollEffects();
    initMobileNav();
    initSmoothScroll();
    initScrollSpy();
    initGreeting();
    initTypeEffect();
    initProjectFilter();      // before initReveal, so hidden cards are settled first
    initReveal();
    initCounters();
    initForm();
    initCopyEmail();
    initBackToTop();
    initCommandPalette();
    initConnectionStatus();
    initResetPreferences();
    initYear();
  }

  // The script is loaded with `defer`, but this keeps it correct either way
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
