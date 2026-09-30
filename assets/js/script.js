/* ==========================================================
   Stackly — main script
   ========================================================== */

/* ---- Page-ready signal ----
   Hero animations (AOS + image zoom) must play AFTER the preloader has fully faded out,
   otherwise they finish behind it and the visitor never sees them.
   Anything that should wait for that moment registers with:  stacklyReady(() => { ... }) */
(function () {
  const queue = [];
  let done = false;
  window.stacklyReady = function (cb) { done ? cb() : queue.push(cb); };
  window.stacklyFireReady = function () {
    if (done) return;
    done = true;
    document.documentElement.classList.add('is-ready');
    queue.splice(0).forEach(cb => cb());
  };
})();

/* ---- Preloader ---- */
(function () {
  const loader = document.getElementById('preloader');
  if (!loader) { window.stacklyFireReady(); return; }   /* no preloader on this page */

  const FADE_MS = 560;   /* keep in step with the #preloader opacity transition (.55s) in style.css */

  /* page starts locked */
  document.body.classList.add('is-loading');

  /* minimum display time: random between 1000–1800 ms */
  const minTime = 1000 + Math.random() * 800;
  const startedAt = Date.now();

  function dismiss() {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, minTime - elapsed);
    setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
      /* hero entrance starts only once the loader has completely faded away */
      setTimeout(window.stacklyFireReady, FADE_MS);
    }, remaining);
  }

  /* fire after DOM + all sub-resources (images, fonts, iframes) */
  if (document.readyState === 'complete') {
    dismiss();
  } else {
    window.addEventListener('load', dismiss);
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- AOS (single init for every page) ---------- */
  if (window.AOS) {
    const startAOS = () => {
      AOS.init({ duration: 800, once: true, offset: 80, easing: 'ease-out-cubic', disable: reduceMotion });

      /* Layout keeps moving after init (fonts, lazy images, JS-built lists, filters),
         which leaves AOS holding stale trigger points. Re-measure whenever the page height changes. */
      let refreshTimer;
      const refreshAOS = () => { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => AOS.refresh(), 120); };
      window.addEventListener('load', refreshAOS);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshAOS);
      if ('ResizeObserver' in window) new ResizeObserver(refreshAOS).observe(document.body);

      /* Once a reveal has finished, hand the element back to its own CSS. AOS otherwise leaves
         transform:translateZ(0) and an 800ms transition on the node, which overrides hover states. */
      const AOS_ATTRS = ['data-aos', 'data-aos-delay', 'data-aos-duration', 'data-aos-offset',
                         'data-aos-anchor-placement', 'data-aos-easing', 'data-aos-once'];
      new MutationObserver(muts => muts.forEach(({ target: el }) => {
        if (!el.classList.contains('aos-animate') || el._aosSettle) return;
        const wait = (parseInt(el.dataset.aosDelay, 10) || 0) + (parseInt(el.dataset.aosDuration, 10) || 800) + 150;
        el._aosSettle = setTimeout(() => {
          AOS_ATTRS.forEach(a => el.removeAttribute(a));
          el.classList.remove('aos-init', 'aos-animate');
        }, wait);
      })).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
    };

    /* Start once the preloader has fully faded, so first-screen (hero) reveals are actually seen */
    window.stacklyReady(startAOS);
  }

  /* ---------- Lenis smooth scroll ---------- */
  let lenis;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', () => { if (window.ScrollTrigger) ScrollTrigger.update(); });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* ---------- GSAP + ScrollTrigger ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    /* Hero text/blocks are revealed with AOS (data-aos in the markup, started by stacklyReady).
       The home hero photos also do a slow zoom-settle: park them scaled-up while the preloader
       is up, then release them at the same moment the AOS reveals begin. */
    if (!reduceMotion) {
      const zoomImgs = [
        ['.hero__bg img',    1.2],
        ['.hero__media img', 1.22],
      ].map(([sel, from]) => {
        const el = document.querySelector(sel);
        return el && { el, from, rest: gsap.getProperty(el, 'scale') };   /* rest = scale set in CSS */
      }).filter(Boolean);

      zoomImgs.forEach(({ el, from }) => gsap.set(el, { scale: from }));
      window.stacklyReady(() => {
        zoomImgs.forEach(({ el, from, rest }) =>
          gsap.to(el, { scale: rest, duration: from > 1.21 ? 1.6 : 2, ease: 'power2.out' }));
      });
    }

    /* Nav scroll swap */
    ScrollTrigger.create({
      start: 60, end: 99999,
      toggleClass: { targets: '#siteNav', className: 'is-scrolled' },
    });

    /* Scroll progress bar */
    gsap.to('#scrollFill', {
      width: '100%', ease: 'none',
      scrollTrigger: {
        trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true,
      },
    });

    /* Philosophy image parallax */
    document.querySelectorAll('[data-parallax]').forEach(el => {
      gsap.to(el.querySelector('img'), {
        yPercent: 12, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    /* Spotlight bg parallax */
    document.querySelectorAll('[data-parallax-strong]').forEach(el => {
      gsap.to(el.querySelector('img'), {
        yPercent: 16, scale: 1.05, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    /* Philosophy heading reveal */
    gsap.from('[data-split-reveal]', {
      opacity: 0, y: 26, duration: 1,
      scrollTrigger: { trigger: '[data-split-reveal]', start: 'top 82%' },
    });

    /* Stat count-up */
    document.querySelectorAll('.stat__num').forEach(el => {
      const raw = el.textContent.trim();
      const num = parseInt(raw, 10);
      if (isNaN(num)) return;
      const suffix = raw.replace(/[0-9]/g, '');
      const counter = { val: 0 };
      gsap.to(counter, {
        val: num, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
        onUpdate: () => { el.textContent = Math.round(counter.val) + suffix; },
      });
    });

    /* Ritual steps stagger in */
    gsap.utils.toArray('.ritual-step').forEach((step, i) => {
      gsap.from(step, {
        opacity: 0, y: 40, duration: 0.9,
        scrollTrigger: { trigger: step, start: 'top 85%' },
        delay: i * 0.08,
      });
    });

    /* Bestseller rows animate in — single staggered batch on the list */
    const bestRows = gsap.utils.toArray('.best-row');
    if (bestRows.length) {
      gsap.from(bestRows, {
        opacity: 0, y: 20, duration: 0.65, stagger: 0.09,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.best-list',
          start: 'top 88%',
          onEnter: () => gsap.set(bestRows, { clearProps: 'all' }), // safety reset
        },
        onComplete: () => gsap.set(bestRows, { clearProps: 'opacity,y,transform' }),
      });
    }

    /* Gallery pieces scale in */
    gsap.utils.toArray('.gallery__piece').forEach((item, i) => {
      gsap.from(item, {
        opacity: 0, scale: 0.94, duration: 0.65,
        scrollTrigger: { trigger: item, start: 'top 95%' },
        delay: (i % 4) * 0.06,
      });
    });

    /* Spotlight big word slide up */
    gsap.from('.spotlight__word-row', {
      opacity: 0, y: 40, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.spotlight', start: 'top 75%' },
    });

    /* Spotlight strips stagger in */
    gsap.from('.spotlight__strip', {
      opacity: 0, y: 16, duration: 0.6, stagger: 0.1,
      scrollTrigger: { trigger: '.spotlight__strips', start: 'top 90%' },
    });

    /* Newsletter big text reveal */
    gsap.from('.newsletter__big-text span', {
      opacity: 0, y: 30, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.newsletter__big-text', start: 'top 85%' },
    });

    /* Marquee infinite drift */
    const mTrack = document.getElementById('marqueeTrack');
    if (mTrack && !reduceMotion) {
      gsap.to(mTrack, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 });
    }
  }

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  const siteNav   = document.getElementById('siteNav');

  function openMenu() {
    navToggle.classList.add('is-open');
    navMobile.classList.add('is-open');
    siteNav.classList.add('menu-open');
    document.body.style.overflow = 'hidden';   // lock background scroll
    if (lenis) lenis.stop();
  }

  function closeMenu() {
    navToggle.classList.remove('is-open');
    navMobile.classList.remove('is-open');
    siteNav.classList.remove('menu-open');
    document.body.style.overflow = '';          // restore scroll
    if (lenis) lenis.start();
  }

  navToggle?.addEventListener('click', () => {
    navMobile.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  navMobile?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- Category accordion ---------- */
  const catPanels = document.querySelectorAll('.cat-panel');
  catPanels.forEach(panel => {
    panel.addEventListener('click', () => {
      if (panel.classList.contains('is-open')) return;
      catPanels.forEach(p => p.classList.remove('is-open'));
      panel.classList.add('is-open');
    });
    /* keyboard support */
    panel.setAttribute('tabindex', '0');
    panel.setAttribute('role', 'button');
    panel.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        panel.click();
      }
    });
  });

  /* ---------- Testimonial slider (rewritten for new markup) ---------- */
  const slides   = document.querySelectorAll('.story-slide');
  const dotsWrap = document.getElementById('storyDots');
  const prevBtn  = document.getElementById('storyPrev');
  const nextBtn  = document.getElementById('storyNext');
  let current = 0, timer;

  if (slides.length && dotsWrap) {
    /* build dots */
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Story ${i + 1}`);
      if (i === 0) b.classList.add('is-active');
      b.addEventListener('click', () => { goTo(i); resetTimer(); });
      dotsWrap.appendChild(b);
    });
    const dots = dotsWrap.querySelectorAll('button');

    function goTo(idx) {
      const prev = current;
      if (idx === prev) return;
      slides[prev].classList.add('is-leaving');
      slides[prev].classList.remove('is-active');
      dots[prev].classList.remove('is-active');
      setTimeout(() => slides[prev].classList.remove('is-leaving'), 600);
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 5500);
    }

    prevBtn?.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); resetTimer(); });

    resetTimer();
  }

  /* ---------- Newsletter form ---------- */
  const form      = document.getElementById('newsletterForm');
  const emailInput = document.getElementById('newsletterEmail');
  const fieldWrap  = document.getElementById('newsletterFieldWrap');
  const errorEl    = document.getElementById('newsletterError');
  const note       = document.getElementById('newsletterNote');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
    fieldWrap.classList.add('has-error');
    /* re-trigger shake animation on repeat errors */
    fieldWrap.style.animation = 'none';
    requestAnimationFrame(() => { fieldWrap.style.animation = ''; });
    emailInput.setAttribute('aria-invalid', 'true');
    emailInput.focus();
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
    fieldWrap.classList.remove('has-error');
    emailInput.removeAttribute('aria-invalid');
  }

  /* Clear error as the user types */
  emailInput?.addEventListener('input', clearError);

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = emailInput.value.trim();

    /* 1. Empty check */
    if (!val) {
      showError('⚠ Please enter your email address.');
      return;
    }

    /* 2. Format check (RFC-lite regex) */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(val)) {
      showError('⚠ Please enter a valid email address (e.g. you@example.com).');
      return;
    }

    /* 3. Valid — reset field and redirect */
    clearError();
    emailInput.value = '';
    note.textContent  = 'Thanks! Redirecting…';
    note.style.color  = 'var(--gold)';

    setTimeout(() => {
      window.location.href = '404.html';
    }, 600);
  });

});
