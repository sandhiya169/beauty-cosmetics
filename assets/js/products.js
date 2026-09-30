/* ==========================================================
   Stackly — Shop (products) page script
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Hero category chips → jump + pre-filter ---------- */
  document.querySelectorAll('.shop-hero__chips a[data-jump]').forEach(chip => {
    chip.addEventListener('click', () => {
      const target = chip.dataset.jump;
      const tab = document.querySelector(`.shop__tab[data-filter="${target}"]`);
      if (tab) setTimeout(() => tab.click(), 350);
    });
  });

  /* ---------- Shop showcase — filter + image switcher ---------- */
  const filterWrap  = document.getElementById('shopFilter');
  const shopItems   = Array.from(document.querySelectorAll('.shop-item'));
  const visualImgs  = Array.from(document.querySelectorAll('.shop__visual-img'));
  const visualCat   = document.getElementById('shopVisualCat');
  const emptyMsg    = document.getElementById('productGridEmpty');

  /* show image for the first visible item on hover */
  function setVisual(visIdx, catName) {
    visualImgs.forEach((img, i) => img.classList.toggle('is-active', i === visIdx));
    if (visualCat) visualCat.textContent = catName || '';
  }

  shopItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const visIdx  = parseInt(item.dataset.vis, 10);
      const catName = item.querySelector('.shop-item__tag')?.textContent || '';
      setVisual(visIdx, catName);
    });
  });

  /* default — show first item's image */
  if (shopItems.length) {
    const first = shopItems[0];
    setVisual(parseInt(first.dataset.vis, 10), first.querySelector('.shop-item__tag')?.textContent || '');
  }

  /* filter tabs */
  if (filterWrap) {
    const tabs = filterWrap.querySelectorAll('.shop__tab');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('is-active')) return;
        tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');

        const filter = tab.dataset.filter;
        const toShow = [];
        const toHide = [];

        shopItems.forEach(item => {
          const match = filter === 'all' || item.dataset.category === filter;
          if (match) toShow.push(item); else toHide.push(item);
        });

        const apply = () => {
          toHide.forEach(i => i.classList.add('is-hidden'));
          toShow.forEach(i => i.classList.remove('is-hidden'));
          if (emptyMsg) emptyMsg.classList.toggle('is-visible', toShow.length === 0);

          /* update visual to first visible item */
          if (toShow.length) {
            const first = toShow[0];
            setVisual(parseInt(first.dataset.vis, 10), first.querySelector('.shop-item__tag')?.textContent || '');
          }

          /* list height changed — re-measure ScrollTrigger/AOS so sections below reveal on time */
          if (window.ScrollTrigger) ScrollTrigger.refresh();
          if (window.AOS && AOS.refreshHard) AOS.refreshHard();

          if (hasGSAP) {
            gsap.fromTo(toShow, { opacity: 0, x: 14 }, {
              opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out',
              onComplete: () => gsap.set(toShow, { clearProps: 'all' }),
            });
          }
        };

        if (hasGSAP) {
          gsap.to(shopItems.filter(i => !i.classList.contains('is-hidden')), {
            opacity: 0, x: -10, duration: 0.2, ease: 'power1.in', onComplete: apply,
          });
        } else {
          apply();
        }
      });
    });
  }

  /* ---------- Add to bag — shop-item__add buttons ---------- */
  document.querySelectorAll('.shop-item__add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (btn.classList.contains('is-added')) return;
      btn.classList.add('is-added');
      btn.innerHTML = '<i class="fa-solid fa-check"></i>';
      if (hasGSAP) gsap.fromTo(btn, { scale: 0.88 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
      setTimeout(() => {
        btn.classList.remove('is-added');
        btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
      }, 1800);
    });
  });

  /* ---------- Featured product "Add to bag" → redirect to 404 ---------- */
  document.querySelectorAll('.featured-product__buy .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = '404.html';
    });
  });

  /* ---------- Bundle "Add set" → redirect to 404 ---------- */
  document.querySelectorAll('.bundle-panel__cta').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = '404.html';
    });
  });

  /* ---------- Featured product pull-in ---------- */
  const featuredBits = document.querySelectorAll('.featured-product__rating, .featured-product__tags, .featured-product__buy');
  if (hasGSAP && featuredBits.length) {
    gsap.from(featuredBits, {
      opacity: 0, y: 16, duration: 0.7, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.featured-product', start: 'top 70%' },
    });
  }

  /* ---------- Bundle cards entrance ---------- */
  const bundleCards = document.querySelectorAll('.bundle-card');
  if (hasGSAP && bundleCards.length) {
    gsap.from(bundleCards, {
      opacity: 0, y: 30, duration: 0.7, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: '.bundles__grid', start: 'top 85%' },
      onComplete: () => gsap.set(bundleCards, { clearProps: 'opacity,y,transform' }),
    });
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