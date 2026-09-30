/* ==========================================================
   Stackly — dashboard.js (Customer + Admin)
   Markup lives in customer-dashboard.html / admin-dashboard.html.
   This file only handles behaviour.
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('menu');
  const content = document.getElementById('content');
  const side = document.getElementById('side');
  const scrim = document.getElementById('scrim');
  const ids = [...menu.querySelectorAll('button')].map(b => b.dataset.id);

  /* ---------- logged-in email (from ?email=) ---------- */
  const email = new URLSearchParams(location.search).get('email') || '';
  const whoEmail = document.getElementById('who');
  whoEmail.textContent = email || 'Guest';
  whoEmail.title = email;
  document.getElementById('whoAvatar').textContent = (email || 'G').charAt(0);

  /* ---------- remove product images that fail to load ---------- */
  content.querySelectorAll('.tile__sw img').forEach(img => {
    const drop = () => img.remove();
    img.addEventListener('error', drop);
    if (img.complete && img.naturalWidth === 0) drop();
  });

  /* ---------- panel switching (stays inside layout) ---------- */
  function show(id) {
    if (!ids.includes(id)) id = ids[0];
    menu.querySelectorAll('button').forEach(b => b.classList.toggle('is-active', b.dataset.id === id));
    content.querySelectorAll('.panel').forEach(p => p.classList.toggle('is-active', p.id === 'panel-' + id));
    window.scrollTo(0, 0);
    closeSide();
  }
  menu.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.dataset.id); });

  /* ---------- mobile sidebar ---------- */
  function openSide() { side.classList.add('is-open'); scrim.classList.add('is-open'); }
  function closeSide() { side.classList.remove('is-open'); scrim.classList.remove('is-open'); }
  document.getElementById('burger').addEventListener('click', () => side.classList.contains('is-open') ? closeSide() : openSide());
  scrim.addEventListener('click', closeSide);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSide(); });

  show(ids[0]);
});
