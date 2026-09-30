/* ==========================================================
   Stackly — contact page script
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* AOS (incl. the hero entrance) is initialised once in script.js, after the preloader has faded */

  /* ---------- GSAP scroll reveals unique to this page ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    /* Visit panel + map slide in from opposite sides */
    gsap.from('.c-visit__panel', {
      opacity: 0, x: -30, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.c-visit__body', start: 'top 82%' },
    });
    gsap.from('.c-visit__map', {
      opacity: 0, x: 30, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: '.c-visit__body', start: 'top 82%' },
    });

    /* FAQ rows */
    gsap.from('.c-faq__item', {
      opacity: 0, y: 16, duration: 0.6, stagger: 0.06, ease: 'power2.out',
      scrollTrigger: { trigger: '.c-faq__list', start: 'top 88%' },
    });
  }

  /* ---------- Visit tabs ---------- */
  const tabs    = document.querySelectorAll('.c-visit__tab');
  const details = document.querySelectorAll('.c-visit__detail');
  const mapEl     = document.getElementById('visitMap');
  const mapLinkEl = document.getElementById('visitMapLink');
  const mapData = {
    0: { query: 'Salem,+Tamil+Nadu', img: 'assets/images/map-salem.webp' },
    1: { query: 'Ashok+Nagar,+Bengaluru', img: 'assets/images/map-bangalore.webp' },
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = tab.getAttribute('data-loc');
      if (tab.classList.contains('is-active')) return;

      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true');

      details.forEach(d => d.classList.toggle('is-active', d.getAttribute('data-loc') === idx));

      if (mapEl && mapData[idx]) {
        mapEl.src = mapData[idx].img;
        if (mapLinkEl) {
          mapLinkEl.href = `https://www.google.com/maps?q=${mapData[idx].query}`;
        }
      }
    });
  });

  /* ---------- FAQ accordion (single open) ---------- */
  const faqItems = document.querySelectorAll('.c-faq__item');
  faqItems.forEach(item => {
    const q = item.querySelector('.c-faq__q');
    q?.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      faqItems.forEach(i => i.classList.remove('is-open'));
      if (!isOpen) item.classList.add('is-open');
    });
  });

  /* ---------- Contact form — custom text validation ---------- */
  const form        = document.getElementById('contactForm');
  const fieldName   = document.getElementById('fieldName');
  const fieldEmail  = document.getElementById('fieldEmail');
  const fieldTopic  = document.getElementById('fieldTopic');
  const fieldMsg    = document.getElementById('fieldMessage');

  const errorName   = document.getElementById('errorName');
  const errorEmail  = document.getElementById('errorEmail');
  const errorTopic  = document.getElementById('errorTopic');
  const errorMsg    = document.getElementById('errorMessage');

  /* helpers */
  function showError(el, msg) {
    el.textContent = msg;
    el.closest('.c-form__field').classList.add('has-error');
  }
  function clearError(el) {
    el.textContent = '';
    el.closest('.c-form__field').classList.remove('has-error');
  }
  function isValidEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
  }

  /* live clear on input */
  fieldName.addEventListener('input',  () => clearError(errorName));
  fieldEmail.addEventListener('input', () => clearError(errorEmail));
  fieldTopic.addEventListener('change',() => clearError(errorTopic));
  fieldMsg.addEventListener('input',   () => clearError(errorMsg));

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    /* Name — letters, spaces, hyphens, apostrophes only; 2–60 chars */
    const nameVal = fieldName.value.trim();
    if (!nameVal) {
      showError(errorName, 'Please enter your name.'); valid = false;
    } else if (nameVal.length < 2) {
      showError(errorName, 'Name must be at least 2 characters.'); valid = false;
    } else if (!/^[A-Za-z\s\-'\.]+$/.test(nameVal)) {
      showError(errorName, 'Name should only contain letters, spaces, or hyphens.'); valid = false;
    } else {
      clearError(errorName);
    }

    /* Email — basic format check */
    const emailVal = fieldEmail.value.trim();
    if (!emailVal) {
      showError(errorEmail, 'Please enter your email address.'); valid = false;
    } else if (!isValidEmail(emailVal)) {
      showError(errorEmail, 'Please enter a valid email (e.g. you@example.com).'); valid = false;
    } else {
      clearError(errorEmail);
    }

    /* Topic — must pick one */
    if (!fieldTopic.value) {
      showError(errorTopic, 'Please select a topic.'); valid = false;
    } else {
      clearError(errorTopic);
    }

    /* Message — min 10 chars */
    const msgVal = fieldMsg.value.trim();
    if (!msgVal) {
      showError(errorMsg, 'Please write your message.'); valid = false;
    } else if (msgVal.length < 10) {
      showError(errorMsg, 'Message must be at least 10 characters.'); valid = false;
    } else {
      clearError(errorMsg);
    }

    if (!valid) return;

    /* All good — reset and redirect */
    form.reset();
    window.location.href = '404.html';
  });

});