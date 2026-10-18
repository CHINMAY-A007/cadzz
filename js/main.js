(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* PLACEHOLDER: FORM_ENDPOINT_URL
     Leave empty to use the mailto fallback below.
     When a real endpoint is supplied, set it to the full URL and the form posts JSON. */
  var FORM_ENDPOINT_URL = '';
  /* PLACEHOLDER: EMAIL_ADDRESS */
  var FALLBACK_EMAIL = 'contact@cadzz.example';

  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) {}
  }

  /* Theme toggle */
  var toggle = document.getElementById('theme-toggle');
  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function effectiveTheme() {
    return doc.getAttribute('data-theme') || systemTheme();
  }
  function syncToggle() {
    if (!toggle) return;
    var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    toggle.setAttribute('aria-pressed', effectiveTheme() === 'light' ? 'true' : 'false');
  }
  if (toggle) {
    syncToggle();
    toggle.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      doc.setAttribute('data-theme', next);
      safeSet('cadzz-theme', next);
      syncToggle();
    });
  }

  /* Footer year */
  var year = document.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }

  /* Mobile menu */
  var menuBtn = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');
  function closeMenu() {
    if (!menuBtn || !menu) return;
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) { closeMenu(); }
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !menu.hidden) {
        closeMenu();
        menuBtn.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900 && !menu.hidden) { closeMenu(); }
    });
  }

  /* Capability rail (sticky focus on larger screens, static list on phones) */
  var rail = document.querySelector('[data-rail]');
  var desktopQuery = window.matchMedia('(min-width: 620px)');
  if (rail && !reduceMotion && 'IntersectionObserver' in window) {
    var railRoot = rail.closest('.rail');
    var items = Array.prototype.slice.call(rail.querySelectorAll('[data-item]'));
    var sentinels = Array.prototype.slice.call(rail.querySelectorAll('[data-sentinel]'));
    var settle = rail.querySelector('[data-settle]');
    var running = false;

    function setActive(index) {
      for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle('is-active', i === index);
      }
      var ticks = railRoot.querySelectorAll('.rail__tick');
      for (var t = 0; t < ticks.length; t++) {
        ticks[t].classList.toggle('is-active', t === index);
      }
    }

    var observer = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.target === settle) {
          railRoot.classList.toggle('is-settled', entry.isIntersecting);
        } else if (entry.isIntersecting) {
          setActive(parseInt(entry.target.getAttribute('data-sentinel'), 10));
        }
      }
    }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });

    function start() {
      if (running || !desktopQuery.matches) return;
      running = true;
      for (var i = 0; i < sentinels.length; i++) { observer.observe(sentinels[i]); }
      if (settle) { observer.observe(settle); }
      setActive(0);
    }
    function stop() {
      if (!running) return;
      running = false;
      observer.disconnect();
      railRoot.classList.remove('is-settled');
      setActive(-1);
    }
    function sync() {
      if (desktopQuery.matches) { start(); } else { stop(); }
    }

    sync();
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', sync);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(sync);
    }
  }

  /* Contact form */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');

    var rules = {
      name: function (value) {
        if (!value.trim()) return 'Please enter your name.';
        if (value.trim().length < 2) return 'Please enter at least 2 characters.';
        return '';
      },
      phone: function (value) {
        var digits = value.replace(/[^0-9]/g, '');
        if (!value.trim()) return 'Please enter your phone number.';
        if (digits.length < 7 || digits.length > 15) return 'Please enter a valid phone number.';
        return '';
      },
      email: function (value) {
        if (!value.trim()) return 'Please enter your email.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) return 'Please enter a valid email address.';
        return '';
      },
      brief: function (value) {
        if (!value.trim()) return 'Please describe what you need.';
        if (value.trim().length < 10) return 'Please add a little more detail, at least 10 characters.';
        return '';
      }
    };

    function fieldFor(name) {
      return form.elements[name];
    }
    function errorFor(name) {
      return document.getElementById(name + '-error');
    }
    function setError(name, message) {
      var input = fieldFor(name);
      var box = errorFor(name);
      if (!input || !box) return;
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        box.textContent = message;
        box.hidden = false;
      } else {
        input.removeAttribute('aria-invalid');
        box.textContent = '';
        box.hidden = true;
      }
    }

    function validateField(name) {
      var input = fieldFor(name);
      if (!input || !rules[name]) return '';
      var message = rules[name](input.value);
      setError(name, message);
      return message;
    }

    Object.keys(rules).forEach(function (name) {
      var input = fieldFor(name);
      if (!input) return;
      input.addEventListener('blur', function () { validateField(name); });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') { validateField(name); }
      });
    });

    function showStatus(message, state) {
      if (!status) return;
      status.textContent = message;
      if (state) { status.setAttribute('data-state', state); }
      else { status.removeAttribute('data-state'); }
    }

    function buildMailto(data) {
      var subject = 'Cadzz enquiry from ' + (data.name || 'a visitor');
      var lines = [
        'Name: ' + data.name,
        'Phone: ' + data.phone,
        'Company: ' + (data.company || 'Not provided'),
        'Email: ' + data.email,
        '',
        data.brief
      ];
      return 'mailto:' + FALLBACK_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var firstInvalid = null;
      var invalidName = null;
      Object.keys(rules).forEach(function (name) {
        var message = validateField(name);
        if (message && !firstInvalid) {
          firstInvalid = fieldFor(name);
          invalidName = name;
        }
      });
      if (firstInvalid) {
        showStatus('Please check the highlighted fields.', '');
        firstInvalid.focus();
        return;
      }

      var data = {
        name: fieldFor('name').value.trim(),
        phone: fieldFor('phone').value.trim(),
        company: fieldFor('company') ? fieldFor('company').value.trim() : '',
        email: fieldFor('email').value.trim(),
        brief: fieldFor('brief').value.trim()
      };

      if (!FORM_ENDPOINT_URL) {
        window.location.href = buildMailto(data);
        showStatus('Your email app is opening with your message ready to send. If nothing opens, email ' + FALLBACK_EMAIL + ' directly.', 'success');
        form.reset();
        return;
      }

      var submitBtn = form.querySelector('.form__submit');
      if (submitBtn) { submitBtn.disabled = true; }
      showStatus('Sending.');

      window.fetch(FORM_ENDPOINT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (response) {
        if (!response.ok) { throw new Error('Request failed'); }
        showStatus('Thanks. Your message has been sent. We will reply shortly.', 'success');
        form.reset();
      }).catch(function () {
        showStatus('Something went wrong. Email ' + FALLBACK_EMAIL + ' directly and we will pick it up.', '');
      }).then(function () {
        if (submitBtn) { submitBtn.disabled = false; }
      });
    });
  }

  /* Scroll reveals */
  var revealItems = document.querySelectorAll('[data-reveal]');
  if (revealItems.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      for (var r = 0; r < revealItems.length; r++) { revealItems[r].classList.add('is-in'); }
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add('is-in');
            revealObserver.unobserve(entries[i].target);
          }
        }
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      for (var r = 0; r < revealItems.length; r++) { revealObserver.observe(revealItems[r]); }
    }
  }

  /* Process scroll line */
  var process = document.querySelector('.process');
  if (process) {
    var processFill = process.querySelector('.process__fill');
    var processSteps = process.querySelectorAll('[data-step]');
    function updateProcess() {
      var rect = process.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var start = vh * 0.78;
      var end = -rect.height + vh * 0.25;
      var p = (start - rect.top) / (start - end);
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      if (processFill) { processFill.style.setProperty('--p', p.toFixed(4)); }
      for (var i = 0; i < processSteps.length; i++) {
        var sr = processSteps[i].getBoundingClientRect();
        processSteps[i].classList.toggle('is-reached', sr.top < vh * 0.72);
      }
    }
    updateProcess();
    window.addEventListener('scroll', updateProcess, { passive: true });
    window.addEventListener('resize', updateProcess);
  }
})();

