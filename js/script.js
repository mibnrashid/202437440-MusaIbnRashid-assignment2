/* ==========================================================================
   Musa Ibn Rashid - Portfolio
   Assignment 2: Interactive Features (built on Assignment 1)

   Each feature lives in its own small module below and is started from init()
   at the bottom. Every module checks that its elements exist first, so the
   file stays safe if a section is ever removed from index.html.

   Features carried over from Assignment 1
     1.  Theme toggle (dark default, saved to localStorage)
     2.  Scroll progress bar
     3.  Sticky header state
     4.  Mobile navigation
     5.  Smooth scrolling (with a fallback for older browsers)
     6.  Scrollspy - highlights the nav link for the section in view
     7.  Greeting - now personalised with the visitor's saved name   [A2]
     8.  Rotating role typing effect
     9.  Scroll-reveal animations
     10. Animated statistic counters
     11. Contact form - now with draft autosave, shake, mailto hand-off [A2]
     12. Copy-to-clipboard email - now confirmed with a toast        [A2]
     13. Back-to-top button
     14. Command palette (/ or Ctrl/Cmd + K) - new commands         [A2]

   New in Assignment 2
     15. Toast notifications
     16. Project filter, live search and sort
     17. Live GitHub repositories (public API, cache, error states)
     18. Expand / collapse experience details
     19. Online / offline notices
     20. Reset saved preferences
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
     7. PERSONALISED GREETING
     Time-of-day greeting from Assignment 1, now combined with the visitor's
     name. The name is validated, saved to localStorage, and reused to
     pre-fill the contact form.
     ====================================================================== */

  /* Letters (any alphabet, so Arabic names work), spaces, hyphens and
     apostrophes are fine. Digits and symbols are rejected. Written as a
     blacklist because Unicode property escapes (\p{L}) would be a syntax
     error in older browsers and take the whole script down with them. */
  var NAME_INVALID = /[0-9<>{}\[\]()@#$%^&*_=+\\|\/~`"!?;:.,]/;

  function initGreeting() {
    var element = $('#greeting');
    if (!element) return;

    var form = $('#nameForm');
    var input = $('#visitorName');
    var error = $('#visitorNameError');
    var change = $('#nameChange');

    function timeOfDay() {
      var hour = new Date().getHours();
      if (hour < 5)  return 'Up late';
      if (hour < 12) return 'Good morning';
      if (hour < 17) return 'Good afternoon';
      if (hour < 21) return 'Good evening';
      return 'Good night';
    }

    function render() {
      var name = storage.get(KEYS.name);

      element.textContent = name
        ? timeOfDay() + ', ' + name + '. Welcome back.'
        : timeOfDay() + '. Welcome.';

      if (form) form.hidden = Boolean(name);
      if (change) change.hidden = !name;
    }

    function validate(value) {
      if (!value) return 'Type a name first, then press Enter.';
      if (value.length < 2) return 'That name looks too short.';
      if (NAME_INVALID.test(value)) return 'Letters only, please - no numbers or symbols.';
      return '';
    }

    render();
    if (!form || !input) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Collapse repeated spaces so "  Sara   Ali " is stored as "Sara Ali"
      var value = input.value.trim().replace(/\s+/g, ' ');
      var message = validate(value);

      error.textContent = message;
      input.setAttribute('aria-invalid', String(Boolean(message)));
      if (message) return;

      storage.set(KEYS.name, value);
      render();
      toast('Nice to meet you, ' + value + '. This browser will remember you.', 'success');

      var contactName = $('#name');
      if (contactName && !contactName.value) contactName.value = value;

      if (change) change.focus();
    });

    // Clear the error as soon as the visitor starts correcting it
    input.addEventListener('input', function () {
      if (error.textContent) {
        error.textContent = '';
        input.setAttribute('aria-invalid', 'false');
      }
    });

    if (change) {
      change.addEventListener('click', function () {
        form.hidden = false;
        change.hidden = true;
        input.value = storage.get(KEYS.name) || '';
        input.focus();
        input.select();
      });
    }

    document.addEventListener(RESET_EVENT, function () {
      input.value = '';
      render();
    });
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
     11. CONTACT FORM
     There is no backend, so nothing is sent from the page. A valid message
     is handed to the visitor's own email app through a pre-filled mailto:
     link. The draft is autosaved so a reload or accidental close loses
     nothing.
     ====================================================================== */
  function initForm() {
    var form = $('#contactForm');
    if (!form) return;

    var status = $('#formStatus');
    var mailto = $('#formMailto');
    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var RECIPIENT = 'm.ibnrashid@gmail.com';
    var SAVE_DELAY_MS = 400;
    var saveTimer = null;

    var rules = {
      name: function (value) {
        if (!value) return 'Please enter your name.';
        if (value.length < 2) return 'That name looks too short.';
        return '';
      },
      email: function (value) {
        if (!value) return 'Please enter your email address.';
        if (!EMAIL_PATTERN.test(value)) return 'Please enter a valid email address, like name@example.com.';
        return '';
      },
      message: function (value) {
        if (!value) return 'Please write a message.';
        if (value.length < 10) return 'Please write at least 10 characters.';
        return '';
      }
    };
    var fields = Object.keys(rules);

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

    function values() {
      var result = {};
      fields.forEach(function (name) { result[name] = $('#' + name).value; });
      return result;
    }

    function clearStatus() {
      status.textContent = '';
      status.className = 'form-status';
      if (mailto) mailto.hidden = true;
    }

    /* --- Draft autosave --- */
    function saveDraft() {
      var draft = values();
      var hasContent = fields.some(function (name) { return draft[name].trim(); });
      if (hasContent) storage.setJSON(KEYS.draft, draft);
      else storage.remove(KEYS.draft);
    }

    function restoreDraft() {
      var draft = storage.getJSON(KEYS.draft);
      if (draft && typeof draft === 'object') {
        fields.forEach(function (name) {
          if (typeof draft[name] === 'string') $('#' + name).value = draft[name];
        });
        toast('Restored your unsent message draft.');
      }

      // Otherwise use the name given in the hero terminal, if any
      var nameInput = $('#name');
      var savedName = storage.get(KEYS.name);
      if (!nameInput.value && savedName) nameInput.value = savedName;
    }

    restoreDraft();

    // Validate on blur, then live-correct once a field is already marked wrong
    fields.forEach(function (name) {
      var input = $('#' + name);
      if (!input) return;

      input.addEventListener('blur', function () { validateField(name); });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('has-error')) validateField(name);

        // Editing again means the last confirmation no longer applies
        if (status.textContent) clearStatus();

        // Debounced, so typing is not slowed by a write on every keystroke
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(saveDraft, SAVE_DELAY_MS);
      });
    });

    /* Replays the shake animation on every field that failed */
    function shakeInvalid() {
      $$('.field.has-error', form).forEach(function (field) {
        field.classList.remove('is-shaking');
        void field.offsetWidth;            // forces a reflow so the animation restarts
        field.classList.add('is-shaking');
      });
    }

    form.addEventListener('animationend', function (event) {
      var field = event.target.closest('.field');
      if (field) field.classList.remove('is-shaking');
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Runs every field so all problems are shown at once, not one at a time
      var results = fields.map(validateField);
      var isValid = results.every(Boolean);

      if (!isValid) {
        var count = results.filter(function (ok) { return !ok; }).length;
        status.textContent = count === 1
          ? 'One field needs fixing - see the message under it.'
          : count + ' fields need fixing - see the messages under them.';
        status.className = 'form-status is-error';
        if (mailto) mailto.hidden = true;
        shakeInvalid();
        var firstBad = $('.field.has-error input, .field.has-error textarea', form);
        if (firstBad) firstBad.focus();
        return;
      }

      var data = values();
      var fullName = data.name.trim();
      var firstName = fullName.split(' ')[0];

      if (mailto) {
        var subject = 'Portfolio message from ' + fullName;
        var body = data.message.trim() + '\n\n- ' + fullName + ' (' + data.email.trim() + ')';
        mailto.href = 'mailto:' + RECIPIENT +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(body);
        mailto.hidden = false;
      }

      status.textContent = 'Thanks, ' + firstName + ' - your message is ready. ' +
        'Open it in your email app below to send it.';
      status.className = 'form-status is-success';

      window.clearTimeout(saveTimer);
      storage.remove(KEYS.draft);
      form.reset();
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
        toast('Email address copied to your clipboard.', 'success');
        window.setTimeout(function () {
          button.textContent = 'copy';
          button.classList.remove('is-copied');
        }, 1800);
      }

      function failed() {
        toast('Could not copy automatically - select the address and copy it by hand.', 'error');
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
        var copied = false;
        try { copied = document.execCommand('copy'); } catch (e) { /* reported below */ }
        document.body.removeChild(field);
        if (copied) done(); else failed();
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
     14. COMMAND PALETTE (/ or Ctrl/Cmd + K)
     A keyboard-first way to jump between sections and run page actions.
     ====================================================================== */
  function initCommandPalette() {
    var palette = $('#cmdk');
    var input = $('#cmdkInput');
    var list = $('#cmdkList');
    var openButton = $('#cmdkOpen');
    if (!palette || !input || !list) return;

    /* Clicks a control elsewhere on the page, so each command reuses the
       real feature instead of duplicating its logic. */
    function press(selector) {
      var element = $(selector);
      if (element) element.click();
    }

    function showProjects(filter) {
      goTo('#projects');
      press('.chip[data-filter="' + filter + '"]');
    }

    var commands = [
      { label: 'About',                   kind: 'section', icon: '#', run: function () { goTo('#about'); } },
      { label: 'Skills',                  kind: 'section', icon: '#', run: function () { goTo('#skills'); } },
      { label: 'Projects',                kind: 'section', icon: '#', run: function () { goTo('#projects'); } },
      { label: 'GitHub repositories',     kind: 'section', icon: '#', run: function () { goTo('#github'); } },
      { label: 'Experience',              kind: 'section', icon: '#', run: function () { goTo('#experience'); } },
      { label: 'Education',               kind: 'section', icon: '#', run: function () { goTo('#education'); } },
      { label: 'Awards',                  kind: 'section', icon: '#', run: function () { goTo('#awards'); } },
      { label: 'Contact',                 kind: 'section', icon: '#', run: function () { goTo('#contact'); } },
      { label: 'Show AI projects',        kind: 'filter',  icon: '~', run: function () { showProjects('ai'); } },
      { label: 'Show web projects',       kind: 'filter',  icon: '~', run: function () { showProjects('web'); } },
      { label: 'Show teaching projects',  kind: 'filter',  icon: '~', run: function () { showProjects('teaching'); } },
      { label: 'Show hackathon projects', kind: 'filter',  icon: '~', run: function () { showProjects('hackathon'); } },
      { label: 'Show all projects',       kind: 'filter',  icon: '~', run: function () { showProjects('all'); } },
      { label: 'Toggle theme',            kind: 'action',  icon: '>', run: function () { press('#themeToggle'); } },
      { label: 'Change my name',          kind: 'action',  icon: '>', run: function () {
          goTo('#hero');
          var change = $('#nameChange');
          if (change && !change.hidden) change.click();
          else if ($('#visitorName')) $('#visitorName').focus();
        } },
      { label: 'Refresh GitHub data',     kind: 'action',  icon: '>', run: function () { goTo('#github'); emit('github:refresh'); } },
      { label: 'Download CV',             kind: 'action',  icon: '>', run: function () { window.location.href = 'assets/musa-ibn-rashid-cv.pdf'; } },
      { label: 'Copy email address',      kind: 'action',  icon: '>', run: function () { goTo('#contact'); press('#copyEmail'); } },
      { label: 'Reset saved preferences', kind: 'action',  icon: '>', run: function () { press('#resetPrefs'); } },
      { label: 'Open GitHub',             kind: 'link',    icon: '^', run: function () { window.open('https://github.com/mibnrashid', '_blank', 'noopener'); } },
      { label: 'Open LinkedIn',           kind: 'link',    icon: '^', run: function () { window.open('https://linkedin.com/in/musaibnrashid', '_blank', 'noopener'); } },
      { label: 'Open Ice Offering',       kind: 'link',    icon: '^', run: function () { window.open('https://iceoffering.com', '_blank', 'noopener'); } }
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
        empty.textContent = 'No matching command. Try "projects" or "theme".';
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
      var comboKey = (event.ctrlKey || event.metaKey) && event.key && event.key.toLowerCase() === 'k';

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
     17. LIVE GITHUB REPOSITORIES
     Fetches every public repository from the GitHub REST API and renders
     them as cards with search, a language filter, sorting and paging.

     - Loading: skeleton cards and a "Loading..." status while waiting.
     - Timeout: the request is abandoned after 8 seconds.
     - Errors : a specific message (offline, rate-limited, timeout...) and
                a Retry button. If an older cached copy exists it is shown
                instead, with a note saying so.
     - Cache  : results are kept in localStorage for an hour. The API
                allows 60 unauthenticated requests per hour per visitor,
                and the cache also makes repeat visits instant.
     - Lazy   : nothing is requested until the section is close to view.
     ====================================================================== */
  function initGitHubRepos() {
    var section = $('#github');
    var list = $('#ghList');
    if (!section || !list) return;

    var USER = 'mibnrashid';
    var API_URL = 'https://api.github.com/users/' + USER + '/repos?per_page=100&sort=pushed';
    var PROFILE_URL = 'https://github.com/' + USER + '?tab=repositories';
    var CACHE_MS = 60 * 60 * 1000;
    var TIMEOUT_MS = 8000;
    var PAGE_SIZE = 6;

    // GitHub's own language colours, for the dot on each card
    var LANGUAGE_COLORS = {
      'TypeScript': '#3178c6', 'JavaScript': '#f1e05a', 'Python': '#3572a5',
      'HTML': '#e34c26', 'CSS': '#663399', 'Java': '#b07219', 'C#': '#178600',
      'Jupyter Notebook': '#da5b0b', 'R': '#198ce7', 'Lua': '#000080', 'C': '#555555'
    };

    var toolbar = $('#ghToolbar');
    var summary = $('#ghSummary');
    var status = $('#ghStatus');
    var message = $('#ghMessage');
    var messageTitle = $('#ghMessageTitle');
    var messageHint = $('#ghMessageHint');
    var messageAction = $('#ghMessageAction');
    var moreButton = $('#ghMore');
    var meta = $('#ghMeta');
    var search = $('#ghSearch');
    var language = $('#ghLanguage');
    var sort = $('#ghSort');
    var forks = $('#ghForks');

    var repos = [];
    var visibleCount = PAGE_SIZE;
    var isLoading = false;
    var hasFailed = false;
    var onMessageAction = null;

    /* --- Small helpers --- */

    function el(tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      // textContent, never innerHTML: repository names and descriptions come
      // from an outside source, so they are never interpreted as markup
      if (text !== undefined) node.textContent = text;
      return node;
    }

    function plural(count, word, wordPlural) {
      return count + ' ' + (count === 1 ? word : (wordPlural || word + 's'));
    }

    /* "3 days ago" - accepts an ISO string or a timestamp, and uses
       Intl.RelativeTimeFormat where available */
    function timeAgo(date) {
      var then = new Date(date).getTime();
      var seconds = Math.round((then - Date.now()) / 1000);
      var units = [
        ['year', 31536000], ['month', 2592000], ['week', 604800],
        ['day', 86400], ['hour', 3600], ['minute', 60]
      ];

      for (var i = 0; i < units.length; i++) {
        var value = Math.round(seconds / units[i][1]);
        if (Math.abs(value) >= 1) {
          if (window.Intl && Intl.RelativeTimeFormat) {
            return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(value, units[i][0]);
          }
          return plural(Math.abs(value), units[i][0]) + ' ago';
        }
      }
      return 'just now';
    }

    /* Keeps only the fields the page uses, so the cache stays small */
    function slim(repo) {
      return {
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count || 0,
        fork: Boolean(repo.fork),
        pushed: repo.pushed_at || repo.updated_at
      };
    }

    /* --- Network --- */

    function makeError(type, extra) {
      var error = new Error(type);
      error.type = type;
      if (extra) Object.keys(extra).forEach(function (key) { error[key] = extra[key]; });
      return error;
    }

    /* fetch() has no timeout of its own. AbortController cancels the
       request where supported; the timer rejects either way. */
    function fetchWithTimeout(url, ms) {
      if (!window.fetch || !window.Promise) return Promise.reject(makeError('unsupported'));

      var controller = window.AbortController ? new AbortController() : null;

      return new Promise(function (resolve, reject) {
        var timer = window.setTimeout(function () {
          if (controller) controller.abort();
          reject(makeError('timeout'));
        }, ms);

        fetch(url, controller ? { signal: controller.signal } : {}).then(function (response) {
          window.clearTimeout(timer);
          resolve(response);
        }, function () {
          window.clearTimeout(timer);
          reject(makeError(navigator.onLine === false ? 'offline' : 'network'));
        });
      });
    }

    function request() {
      return fetchWithTimeout(API_URL, TIMEOUT_MS).then(function (response) {
        if (!response.ok) {
          var remaining = response.headers.get('X-RateLimit-Remaining');
          var isRateLimited = (response.status === 403 || response.status === 429) && remaining === '0';
          throw makeError(isRateLimited ? 'rate-limit' : 'http', {
            status: response.status,
            reset: Number(response.headers.get('X-RateLimit-Reset')) * 1000
          });
        }
        return response.json();
      }).then(function (data) {
        if (!Array.isArray(data)) throw makeError('format');
        return data.map(slim);
      });
    }

    /* Every failure tells the visitor what happened and what to do next */
    function describeError(error) {
      switch (error.type) {
        case 'offline':
          return { title: 'You appear to be offline.',
                   hint: 'The repositories load live from GitHub. Reconnect and they will load automatically, or press Retry.' };
        case 'timeout':
          return { title: 'GitHub is taking too long to answer.',
                   hint: 'It may be busy right now. Press Retry, or browse the repositories on GitHub directly.' };
        case 'rate-limit':
          var at = error.reset ? new Date(error.reset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
          return { title: 'GitHub\'s hourly request limit has been reached.',
                   hint: 'GitHub allows 60 requests an hour per visitor' + (at ? ', and the limit resets at ' + at : '') +
                         '. Until then you can browse the repositories on GitHub directly.' };
        case 'unsupported':
          return { title: 'This browser cannot load live data.',
                   hint: 'Please use a current version of Chrome, Edge, Firefox or Safari, or browse the repositories on GitHub directly.' };
        case 'http':
          return { title: 'GitHub returned an error (' + error.status + ').',
                   hint: 'This is usually temporary. Press Retry in a moment.' };
        default:
          return { title: 'Could not load repositories from GitHub.',
                   hint: 'Something went wrong on the way. Check your connection and press Retry.' };
      }
    }

    /* --- Cache --- */

    function readCache() {
      var cached = storage.getJSON(KEYS.repos);
      return cached && Array.isArray(cached.repos) && typeof cached.time === 'number' ? cached : null;
    }

    /* --- States --- */

    function showMessage(title, hint, actionLabel, action, isError) {
      messageTitle.textContent = title;
      messageHint.textContent = hint;
      messageAction.textContent = actionLabel;
      messageAction.hidden = !actionLabel;
      onMessageAction = action;
      message.classList.toggle('is-error', Boolean(isError));
      message.hidden = false;
    }

    function hideMessage() {
      message.hidden = true;
    }

    function showLoading() {
      isLoading = true;
      hideMessage();
      moreButton.hidden = true;
      list.setAttribute('aria-busy', 'true');
      status.textContent = 'Loading repositories from GitHub…';

      list.innerHTML = '';
      for (var i = 0; i < PAGE_SIZE; i++) {
        var card = el('div', 'repo-card is-skeleton');
        card.setAttribute('aria-hidden', 'true');
        card.appendChild(el('span', 'skeleton-line is-title'));
        card.appendChild(el('span', 'skeleton-line'));
        card.appendChild(el('span', 'skeleton-line'));
        card.appendChild(el('span', 'skeleton-line is-short'));
        list.appendChild(card);
      }
    }

    function showError(error) {
      var text = describeError(error);
      list.innerHTML = '';
      list.setAttribute('aria-busy', 'false');
      toolbar.hidden = true;
      summary.hidden = true;
      moreButton.hidden = true;
      status.textContent = 'Repositories could not be loaded.';
      showMessage(text.title, text.hint, 'Retry', function () { load(true); }, true);
      renderMeta(null, false);
    }

    /* "Updated 5 minutes ago · Refresh · View on GitHub" */
    function renderMeta(time, isStale) {
      meta.innerHTML = '';

      if (time) {
        meta.appendChild(document.createTextNode(
          (isStale ? 'Showing a saved copy from ' : 'Updated ') + timeAgo(time) + ' · '
        ));
        var refresh = el('button', 'term-link', 'refresh');
        refresh.type = 'button';
        refresh.addEventListener('click', function () { load(true); });
        meta.appendChild(refresh);
        meta.appendChild(document.createTextNode(' · '));
      }

      var link = el('a', '', 'view on GitHub →');
      link.href = PROFILE_URL;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      meta.appendChild(link);
    }

    function renderSummary() {
      var stars = 0;
      var languageCounts = {};

      repos.forEach(function (repo) {
        stars += repo.stars;
        if (repo.language) languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      });

      var languages = Object.keys(languageCounts).sort(function (a, b) {
        return languageCounts[b] - languageCounts[a] || a.localeCompare(b);
      });
      var original = repos.filter(function (repo) { return !repo.fork; }).length;

      var items = [
        [repos.length, 'public repositories'],
        [original, 'original'],
        [languages.length, 'languages'],
        [stars, stars === 1 ? 'star' : 'stars']
      ];
      if (languages[0]) items.push([languages[0], 'most used']);

      summary.innerHTML = '';
      items.forEach(function (item) {
        var li = el('li');
        li.appendChild(el('strong', '', String(item[0])));
        li.appendChild(document.createTextNode(item[1]));
        summary.appendChild(li);
      });
      summary.hidden = false;

      // Rebuild the language options, keeping the current choice if it still exists
      var current = language.value;
      language.innerHTML = '';
      language.appendChild(new Option('All (' + repos.length + ')', 'all'));
      languages.forEach(function (name) {
        language.appendChild(new Option(name + ' (' + languageCounts[name] + ')', name));
      });
      language.appendChild(new Option('Not specified', 'none'));
      language.value = current === 'all' || languageCounts[current] || current === 'none' ? current : 'all';
    }

    function currentMatches() {
      var query = search.value.trim().toLowerCase();
      var lang = language.value;

      var matches = repos.filter(function (repo) {
        if (!forks.checked && repo.fork) return false;
        if (lang === 'none' && repo.language) return false;
        if (lang !== 'all' && lang !== 'none' && repo.language !== lang) return false;
        if (!query) return true;
        return (repo.name + ' ' + (repo.description || '')).toLowerCase().indexOf(query) > -1;
      });

      var sorters = {
        updated: function (a, b) { return (b.pushed || '').localeCompare(a.pushed || ''); },
        stars:   function (a, b) { return b.stars - a.stars || a.name.localeCompare(b.name); },
        name:    function (a, b) { return a.name.toLowerCase().localeCompare(b.name.toLowerCase()); }
      };

      return matches.sort(sorters[sort.value] || sorters.updated);
    }

    function buildCard(repo, index) {
      var card = el('a', 'repo-card');
      card.href = repo.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      if (!prefersReducedMotion) card.style.animationDelay = (index % PAGE_SIZE) * 40 + 'ms';

      var head = el('div', 'repo-head');
      head.appendChild(el('span', 'repo-name', repo.name));
      if (repo.fork) head.appendChild(el('span', 'repo-badge', 'fork'));
      card.appendChild(head);

      var description = el('p', 'repo-desc', repo.description || 'No description provided.');
      if (!repo.description) description.classList.add('is-empty');
      card.appendChild(description);

      var details = el('div', 'repo-meta');
      if (repo.language) {
        var lang = el('span', 'repo-lang', repo.language);
        lang.style.setProperty('--lang-color', LANGUAGE_COLORS[repo.language] || 'var(--muted)');
        details.appendChild(lang);
      }
      details.appendChild(el('span', '', '★ ' + repo.stars));
      if (repo.pushed) details.appendChild(el('span', '', 'updated ' + timeAgo(repo.pushed)));
      card.appendChild(details);

      return card;
    }

    function render() {
      var matches = currentMatches();
      var shown = matches.slice(0, visibleCount);

      list.innerHTML = '';
      shown.forEach(function (repo, index) { list.appendChild(buildCard(repo, index)); });

      status.textContent = matches.length
        ? 'Showing ' + shown.length + ' of ' + plural(matches.length, 'repository', 'repositories')
        : 'No repositories to show.';

      if (!matches.length) {
        var query = search.value.trim();
        showMessage(
          query ? 'No repositories match "' + query + '".' : 'No repositories match these filters.',
          'Try another word or language, or reset the filters to see everything.',
          'Reset filters',
          resetFilters,
          false
        );
      } else {
        hideMessage();
      }

      var remaining = matches.length - shown.length;
      moreButton.hidden = remaining <= 0;
      moreButton.textContent = 'Show more (' + remaining + ' left)';
    }

    function resetFilters() {
      search.value = '';
      language.value = 'all';
      sort.value = 'updated';
      forks.checked = true;
      visibleCount = PAGE_SIZE;
      render();
      search.focus();
    }

    function receive(data, time, isStale) {
      isLoading = false;
      hasFailed = false;
      repos = data;
      list.setAttribute('aria-busy', 'false');
      toolbar.hidden = false;
      renderSummary();
      render();
      renderMeta(time, isStale);
    }

    /* force = true skips the cache (Retry and Refresh) */
    function load(force) {
      if (isLoading) return;

      var cached = readCache();
      if (cached && !force && Date.now() - cached.time < CACHE_MS) {
        receive(cached.repos, cached.time, false);
        return;
      }

      showLoading();

      request().then(function (data) {
        var time = Date.now();
        storage.setJSON(KEYS.repos, { time: time, repos: data });
        receive(data, time, false);
        if (force) toast('GitHub repositories refreshed.', 'success');
      }).catch(function (error) {
        isLoading = false;

        // An old copy is better than an empty section
        if (cached) {
          receive(cached.repos, cached.time, true);
          toast(describeError(error).title + ' Showing the copy saved earlier.', 'error');
        } else {
          showError(error);
        }
        hasFailed = true;   // after receive(), which clears it
      });
    }

    /* --- Controls --- */

    function onFilterChange() {
      visibleCount = PAGE_SIZE;
      render();
    }

    search.addEventListener('input', onFilterChange);
    language.addEventListener('change', onFilterChange);
    sort.addEventListener('change', onFilterChange);
    forks.addEventListener('change', onFilterChange);

    search.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && search.value) {
        event.stopPropagation();
        search.value = '';
        onFilterChange();
      }
    });

    messageAction.addEventListener('click', function () {
      if (onMessageAction) onMessageAction();
    });

    moreButton.addEventListener('click', function () {
      var firstNew = visibleCount;
      visibleCount += PAGE_SIZE;
      render();
      // Move keyboard focus to the first newly revealed card
      var cards = $$('.repo-card', list);
      if (cards[firstNew]) cards[firstNew].focus();
    });

    // Recover on its own once the connection comes back
    window.addEventListener('online', function () {
      if (hasFailed) load(true);
    });

    document.addEventListener('github:refresh', function () { load(true); });

    /* --- Start: only when the section is about to scroll into view --- */
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        load(false);
      }, { rootMargin: '600px 0px' });
      observer.observe(section);
    } else {
      load(false);
    }
  }

  /* ======================================================================
     18. EXPAND / COLLAPSE EXPERIENCE DETAILS
     Adds a "Show details" button above each .timeline-more panel. The
     panels are visible in the HTML, so without JavaScript nothing is lost.
     ====================================================================== */
  function initTimelineDetails() {
    $$('.timeline-more').forEach(function (panel) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'timeline-toggle';
      button.textContent = 'Show details';
      button.setAttribute('aria-expanded', 'false');
      if (panel.id) button.setAttribute('aria-controls', panel.id);

      panel.classList.add('is-collapsible');
      // Hidden from screen readers while collapsed, matching what is seen
      panel.setAttribute('aria-hidden', 'true');
      panel.parentNode.insertBefore(button, panel);

      button.addEventListener('click', function () {
        var isOpen = panel.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(isOpen));
        button.textContent = isOpen ? 'Hide details' : 'Show details';
        panel.setAttribute('aria-hidden', String(!isOpen));
      });
    });
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
    initTimelineDetails();
    initReveal();
    initCounters();
    initForm();
    initCopyEmail();
    initBackToTop();
    initCommandPalette();
    initGitHubRepos();
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
