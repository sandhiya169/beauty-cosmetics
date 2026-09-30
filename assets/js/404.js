/* ==========================================================
   Stackly — 404 page script
   One orchestrated entrance + the "go back" action.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- entrance ---------- */
  if (window.gsap && !reduceMotion) {
    gsap.from('.error__media img', { scale: 1.15, duration: 1.4, ease: 'power2.out' });
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.error__code span', { yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.1)
      .from('[data-fade]', { opacity: 0, y: 16, duration: 0.7, stagger: 0.08 }, 0.3);
  }

  /* ---------- go back ---------- */
  const goBackBtn = document.getElementById('goBackBtn');
  goBackBtn?.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'index.html';
    }
  });

});