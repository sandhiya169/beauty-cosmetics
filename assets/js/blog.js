/* ==========================================================
   Stackly — Journal (blog) page script
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Article grid entrance ---------- */
  /* handled by AOS (data-aos on .article-card); a GSAP tween on the same nodes fought it */
  let introTween;

  /* ---------- Category filter ---------- */
  const filterWrap = document.getElementById('articlesFilter');
  const grid = document.getElementById('articleGrid');
  const emptyMsg = document.getElementById('articleGridEmpty');

  if (filterWrap && grid) {
    const pills = filterWrap.querySelectorAll('.filter-pill');
    const allCards = Array.from(grid.querySelectorAll('.article-card'));

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (pill.classList.contains('is-active')) return;
        pills.forEach(p => { p.classList.remove('is-active'); p.setAttribute('aria-selected', 'false'); });
        pill.classList.add('is-active');
        pill.setAttribute('aria-selected', 'true');

        /* the one-off entrance tween must not fight the filter animation */
        if (introTween) { introTween.scrollTrigger?.kill(); introTween.kill(); gsap.set(allCards, { clearProps: 'opacity,y,transform' }); }

        const filter = pill.dataset.filter;
        const toShow = [];
        const toHide = [];

        allCards.forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          if (match) toShow.push(card); else toHide.push(card);
        });

        /* Filtering changes the grid height, so every section below moves.
           Re-measure ScrollTrigger / AOS right away, otherwise the sections
           below keep their old trigger positions and reveal late (or stay
           hidden) until the user scrolls a bit. */
        const refreshLayout = () => {
          if (window.ScrollTrigger) ScrollTrigger.refresh();
          if (window.AOS && AOS.refreshHard) AOS.refreshHard();
        };

        const applyVisibility = () => {
          toHide.forEach(c => c.classList.add('is-hidden'));
          toShow.forEach(c => c.classList.remove('is-hidden'));
          if (emptyMsg) emptyMsg.classList.toggle('is-visible', toShow.length === 0);

          /* layout has changed now — refresh immediately, not after the animation */
          refreshLayout();

          if (hasGSAP) {
            gsap.killTweensOf(toShow);
            gsap.fromTo(toShow, { opacity: 0, y: 14 }, {
              opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out',
              overwrite: true,
              onComplete: () => gsap.set(toShow, { clearProps: 'opacity,y,transform' }),
            });
          }
        };

        const visibleNow = allCards.filter(c => !c.classList.contains('is-hidden'));
        if (hasGSAP && visibleNow.length) {
          gsap.killTweensOf(allCards);
          gsap.to(visibleNow, {
            opacity: 0, y: -10, duration: 0.15, ease: 'power1.in',
            onComplete: applyVisibility,
          });
        } else {
          applyVisibility();
        }
      });
    });
  }

  /* ---------- Hero topic rail → applies the matching grid filter ---------- */
  document.querySelectorAll('[data-hero-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      if (!filterWrap) return;
      const pill = filterWrap.querySelector(`.filter-pill[data-filter="${chip.dataset.heroFilter}"]`);
      if (pill && !pill.classList.contains('is-active')) pill.click();
    });
  });

  /* ---------- Reader favourites — row stagger ---------- */
  const favRows = document.querySelectorAll('.favorites-row');
  if (hasGSAP && favRows.length) {
    gsap.from(favRows, {
      opacity: 0, x: -18, duration: 0.6, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: '.favorites-list', start: 'top 88%' },
      onComplete: () => gsap.set(favRows, { clearProps: 'opacity,x,transform' }),
    });
  }

  /* ---------- Long-read pull quote ---------- */
  const pull = document.querySelector('.longread__pull');
  if (hasGSAP && pull) {
    gsap.from(pull, {
      opacity: 0, x: -16, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: pull, start: 'top 85%' },
    });
  }

  /* ---------- Topics cloud stagger ---------- */
  const topicPills = document.querySelectorAll('.topic-pill');
  if (hasGSAP && topicPills.length) {
    gsap.from(topicPills, {
      opacity: 0, y: 10, duration: 0.5, stagger: 0.035, ease: 'power1.out',
      scrollTrigger: { trigger: '.topics__cloud', start: 'top 90%' },
      onComplete: () => gsap.set(topicPills, { clearProps: 'opacity,y,transform' }),
    });
  }

  /* ---------- Editors card slider ---------- */
  const edCards       = document.querySelectorAll('.ed-card');
  const edDotWrap     = document.getElementById('editorDots');
  const edPrev        = document.getElementById('editorPrev');
  const edNext        = document.getElementById('editorNext');
  const edProgressFill= document.getElementById('editorProgressFill');
  const edCountCur    = document.getElementById('editorCountCur');
  const edCountTotal  = document.getElementById('editorCountTotal');
  let edCurrent = 0, edTimer;

  const pad = n => String(n + 1).padStart(2, '0');

  if (edCards.length && edDotWrap) {
    /* set total */
    if (edCountTotal) edCountTotal.textContent = pad(edCards.length - 1);

    /* build dots */
    edCards.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Editor ${i + 1}`);
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      if (i === 0) b.classList.add('is-active');
      b.addEventListener('click', () => { goToEd(i); resetEdTimer(); });
      edDotWrap.appendChild(b);
    });

    const edDots = edDotWrap.querySelectorAll('button');

    /* also make non-active cards clickable */
    edCards.forEach((card, i) => {
      card.addEventListener('click', () => { if (i !== edCurrent) { goToEd(i); resetEdTimer(); } });
    });

    function updateProgress(idx) {
      if (edProgressFill) {
        edProgressFill.style.width = ((idx + 1) / edCards.length * 100) + '%';
      }
      if (edCountCur) edCountCur.textContent = pad(idx);
    }

    function goToEd(idx) {
      if (idx === edCurrent) return;
      edCards[edCurrent].classList.remove('is-active');
      edDots[edCurrent].classList.remove('is-active');
      edDots[edCurrent].setAttribute('aria-selected', 'false');
      edCurrent = ((idx % edCards.length) + edCards.length) % edCards.length;
      edCards[edCurrent].classList.add('is-active');
      edDots[edCurrent].classList.add('is-active');
      edDots[edCurrent].setAttribute('aria-selected', 'true');
      updateProgress(edCurrent);
    }

    function resetEdTimer() {
      clearInterval(edTimer);
      if (!reduceMotion) edTimer = setInterval(() => goToEd(edCurrent + 1), 6000);
    }

    edPrev?.addEventListener('click', () => { goToEd(edCurrent - 1); resetEdTimer(); });
    edNext?.addEventListener('click', () => { goToEd(edCurrent + 1); resetEdTimer(); });

    updateProgress(0);
    resetEdTimer();
  }

  /* ---------- Recent feed — editorial list built from existing article cards ---------- */
  const recentFeed = document.getElementById('recentFeed');
  if (recentFeed) {
    const sourceCards = Array.from(document.querySelectorAll('#articleGrid .article-card'));
    const recent = sourceCards.slice(0, 4);

    recent.forEach((card, i) => {
      const cat      = card.dataset.category || 'skincare';
      const img      = card.querySelector('img');
      const imgSrc   = img ? img.src : '';
      const imgAlt   = img ? img.alt : '';
      const tag      = card.querySelector('.article-card__tag')?.textContent.trim() || '';
      const title    = card.querySelector('h3')?.textContent.trim() || '';
      const blurb    = card.querySelector('p')?.textContent.trim() || '';
      const metaSpans= card.querySelectorAll('.article-card__meta span');
      const date     = metaSpans[0]?.textContent.trim() || '';
      const readTime = metaSpans[2]?.textContent.trim() || '';
      const href     = '404.html';
      const idx      = String(i + 1).padStart(2, '0');

      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.className   = 'recent-row';
      a.href        = href;
      a.dataset.cat = cat;
      a.setAttribute('aria-label', title);

      a.innerHTML = `
        <span class="recent-row__idx" aria-hidden="true">${idx}</span>
        <div class="recent-row__text">
          <div class="recent-row__meta">
            <span class="recent-row__tag">${tag}</span>
            <span class="recent-row__dot" aria-hidden="true"></span>
            <span class="recent-row__time">${date} &middot; ${readTime}</span>
          </div>
          <span class="recent-row__title">${title}</span>
          <span class="recent-row__blurb">${blurb}</span>
        </div>
        <div class="recent-row__thumb" aria-hidden="true">
          <img src="${imgSrc}" alt="" loading="lazy">
        </div>
        <span class="recent-row__arrow"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>`;

      li.appendChild(a);
      recentFeed.appendChild(li);
    });

    /* GSAP stagger reveal */
    if (hasGSAP && !reduceMotion) {
      gsap.from('#recentFeed .recent-row', {
        opacity: 0, x: -16, duration: 0.5, stagger: 0.09, ease: 'power2.out',
        scrollTrigger: { trigger: recentFeed, start: 'top 88%' },
        onComplete: () => gsap.set('#recentFeed .recent-row', { clearProps: 'all' }),
      });
    }
  }

  /* ---------- Newsletter Form Validation & Redirect ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterError = document.getElementById('newsletterError');
  if (newsletterForm) {
    const input = newsletterForm.querySelector('input[type="email"]');
    
    // Hide error when user starts typing
    if (input && newsletterError) {
      input.addEventListener('input', () => {
        newsletterError.style.display = 'none';
      });
    }

    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input && input.value.trim() !== '' && input.checkValidity()) {
        if (newsletterError) newsletterError.style.display = 'none';
        newsletterForm.reset();
        window.location.href = '404.html';
      } else {
        if (newsletterError) newsletterError.style.display = 'block';
      }
    });
  }

});