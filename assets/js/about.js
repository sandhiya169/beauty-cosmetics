/* ==========================================================
   Stackly — about page script
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* AOS is initialised once in script.js */

  /* ---------- "How we build" — light each step's rail as it scrolls into view ---------- */
  const buildSteps = document.querySelectorAll('.ab-sustain__step');
  if (buildSteps.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-lit');
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -35% 0px', threshold: 0.2 });
      buildSteps.forEach(step => io.observe(step));
    } else {
      buildSteps.forEach(step => step.classList.add('is-lit'));
    }
  }

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Story timeline — items stagger in, pure GSAP ---------- */
  const tlItems = gsap.utils.toArray('.ab-tl-item');
  if (tlItems.length) {
    gsap.from(tlItems, {
      opacity: 0, x: -24, duration: 0.7, stagger: 0.18, ease: 'power2.out',
      scrollTrigger: { trigger: '.ab-timeline', start: 'top 78%' },
    });
  }

  /* ---------- Story timeline — progress line draws in as you scroll ---------- */
  if (!reduceMotion) {
    const prog = document.getElementById('timelineProgress');
    if (prog) {
      gsap.set(prog, { scaleY: 0, transformOrigin: 'top center' });
      gsap.to(prog, {
        scaleY: 1, ease: 'none',
        scrollTrigger: {
          trigger: '.ab-timeline', start: 'top 65%', end: 'bottom 75%', scrub: 0.6,
        },
      });
    }
  }

  /* ---------- Founder portrait — subtle scale-in on entrance ---------- */
  gsap.from('.ab-founder__media img', {
    scale: 1.12, duration: 1.1, ease: 'power2.out',
    scrollTrigger: { trigger: '.ab-founder', start: 'top 75%' },
  });

});