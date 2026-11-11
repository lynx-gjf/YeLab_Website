/* ==========================================================================
   The Ye Group - simplify version
   Shared behaviour: typewriter headline, scroll reveal, carousel, nav
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. Mobile navigation + active link highlighting
     ------------------------------------------------------------------ */
  function initNav() {
    var nav = document.getElementById('siteNav');
    var toggle = document.getElementById('menuToggle');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
      // Close the dropdown after following a link
      nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') nav.classList.remove('open');
      });
    }

    // Mark the nav item that points at the current file
    var here = location.pathname.split('/').pop() || 'index.html';
    var aliases = { '': 'index.html' };
    here = aliases[here] || here;

    document.querySelectorAll('nav a').forEach(function (a) {
      var target = (a.getAttribute('href') || '').split('#')[0];
      if (!target) target = 'index.html';
      if (target === here) a.classList.add('current');
    });
  }

  /* ------------------------------------------------------------------
     2. Typewriter headline
        Mirrors the Elementor "typing" headline used on thejiaogroup.cn:
        a static prefix ("Welcome to ") plus a dynamic phrase that is
        typed out, held, deleted, then typed again.
     ------------------------------------------------------------------ */
  function initTypewriter() {
    var out = document.getElementById('typedText');
    if (!out) return;

    var phrases = JSON.parse(out.getAttribute('data-phrases') || '["The Ye Group"]');
    var typeSpeed = parseInt(out.getAttribute('data-type-speed') || '110', 10);
    var deleteSpeed = parseInt(out.getAttribute('data-delete-speed') || '55', 10);
    var holdTime = parseInt(out.getAttribute('data-hold') || '2200', 10);

    // Honour reduced-motion: just show the first phrase, no animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      out.textContent = phrases[0];
      var caret0 = out.nextElementSibling;
      if (caret0 && caret0.classList.contains('caret')) caret0.remove();
      return;
    }

    var pi = 0, ci = 0, deleting = false;

    function tick() {
      var word = phrases[pi];

      if (!deleting) {
        ci++;
        out.textContent = word.slice(0, ci);
        if (ci === word.length) {
          deleting = true;
          // Only loop into the next phrase when there is more than one
          setTimeout(tick, phrases.length > 1 ? holdTime : holdTime);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        if (phrases.length === 1) {
          // Single phrase: hold, clear, retype
          ci = 0;
          out.textContent = '';
          deleting = false;
          pi = 0;
          setTimeout(tick, 700);
          return;
        }
        ci--;
        out.textContent = word.slice(0, ci);
        if (ci === 0) {
          deleting = false;
          pi = (pi + 1) % phrases.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    }

    tick();
  }

  /* ------------------------------------------------------------------
     3. Scroll reveal (fadeInUp)
        Any element with class="reveal" fades up when it enters view.
        Staggered by data-delay (ms) when present.
     ------------------------------------------------------------------ */
  function forceRevealAll() {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      forceRevealAll();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { el.classList.add('is-visible'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (el) { io.observe(el); });

    // Safety net: a backgrounded tab does not fire intersection callbacks,
    // so anything still hidden shortly before the user is likely to look
    // at it gets revealed anyway.
    setTimeout(function () {
      items.forEach(function (el) {
        if (!el.classList.contains('is-visible')) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
        }
      });
    }, 1500);
  }

  /* ------------------------------------------------------------------
     4. Research highlights carousel
     ------------------------------------------------------------------ */
  function initCarousel() {
    var slides = document.querySelectorAll('.carousel-slide');
    if (slides.length < 2) return;

    var dots = document.querySelectorAll('.carousel-dots button');
    var current = 0;
    var timer = null;
    var root = document.querySelector('.carousel');

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle('active', n === current); });
      dots.forEach(function (d, n) { d.classList.toggle('active', n === current); });
    }

    function start() {
      stop();
      timer = setInterval(function () { show(current + 1); }, 6500);
    }

    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); start(); });
    });

    var prev = document.getElementById('prevSlide');
    var next = document.getElementById('nextSlide');
    if (prev) prev.addEventListener('click', function () { show(current - 1); start(); });
    if (next) next.addEventListener('click', function () { show(current + 1); start(); });

    if (root) {
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
    }

    // Keyboard support when the carousel is on screen
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(current - 1); start(); }
      if (e.key === 'ArrowRight') { show(current + 1); start(); }
    });

    start();
  }

  /* ------------------------------------------------------------------
     5. Publications year filter (publications.html only)
     ------------------------------------------------------------------ */
  function initPubFilter() {
    var toolbar = document.getElementById('pubToolbar');
    if (!toolbar) return;

    var blocks = document.querySelectorAll('.year-block');
    var buttons = toolbar.querySelectorAll('button');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var want = btn.getAttribute('data-year');
        blocks.forEach(function (block) {
          block.style.display = (want === 'all' || block.id === 'y' + want) ? '' : 'none';
        });
      });
    });
  }

  /* ------------------------------------------------------------------
     6. Smooth in-page scrolling with a sticky-header offset
     ------------------------------------------------------------------ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href*="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var raw = anchor.getAttribute('href') || '';
        var hashIndex = raw.indexOf('#');
        if (hashIndex === -1) return;

        var targetFile = raw.slice(0, hashIndex).split('/').pop();
        var here = (location.pathname.split('/').pop() || 'index.html');
        var isSameFile = !targetFile || targetFile === here;
        if (!isSameFile) return; // let the browser navigate, then scroll on load

        var id = raw.slice(hashIndex + 1);
        if (!id) return;
        var el = document.getElementById(id);
        if (!el) return;

        e.preventDefault();
        var offset = document.querySelector('header') ? document.querySelector('header').offsetHeight + 12 : 0;
        var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });

    // After landing on index.html#about from another page, correct the offset
    window.addEventListener('load', function () {
      if (!location.hash) return;
      var el = document.querySelector(location.hash);
      if (!el) return;
      var offset = document.querySelector('header') ? document.querySelector('header').offsetHeight + 12 : 0;
      var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
      setTimeout(function () { window.scrollTo({ top: top, behavior: 'smooth' }); }, 120);
    });
  }

  /* ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    try {
      initNav();
      initTypewriter();
      initReveal();
      initCarousel();
      initPubFilter();
      initSmoothScroll();
    } catch (err) {
      // Never leave the page blank because of a script failure
      forceRevealAll();
      var typed = document.getElementById('typedText');
      if (typed && !typed.textContent) {
        typed.textContent = (JSON.parse(typed.getAttribute('data-phrases') || '[]')[0]) || 'The Ye Group';
      }
      if (window.console) console.error('The Ye Group site.js:', err);
    }
  });
})();
