/* ==========================================================
   Stackly — auth.js
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(fieldEl, msg) {
    const input = fieldEl.querySelector('input');
    const err = fieldEl.querySelector('.authfield__error');
    input.classList.toggle('is-invalid', !!msg);
    if (err) { err.textContent = msg || ''; err.classList.toggle('is-shown', !!msg); }
    return !msg;
  }

  function validateEmail(fieldEl) {
    const val = fieldEl.querySelector('input').value.trim();
    if (!val) return setError(fieldEl, 'Email is required.');
    if (!EMAIL_RE.test(val)) return setError(fieldEl, 'Enter a valid email address.');
    return setError(fieldEl, '');
  }

  function validatePassword(fieldEl, { min = 6 } = {}) {
    const val = fieldEl.querySelector('input').value;
    if (!val) return setError(fieldEl, 'Password is required.');
    if (val.length < min) return setError(fieldEl, `Password must be at least ${min} characters.`);
    return setError(fieldEl, '');
  }

  /* toggle show/hide password */
  document.querySelectorAll('.authfield__toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.authfield__control').querySelector('input');
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.textContent = showing ? 'Show' : 'Hide';
    });
  });

  /* ---------------- LOGIN ---------------- */
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    const tabs = document.querySelectorAll('.authtab');
    let role = 'customer';

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        role = tab.dataset.role;
        document.getElementById('loginHeading').textContent =
          role === 'admin' ? 'Admin Login' : 'Welcome back';
        document.getElementById('loginSub').textContent =
          role === 'admin'
            ? 'Sign in with your administrator account.'
            : 'Sign in to view orders, rituals and rewards.';
      });
    });

    const emailField = document.getElementById('loginEmailField');
    const passField  = document.getElementById('loginPasswordField');
    const note = document.getElementById('loginNote');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const okEmail = validateEmail(emailField);
      const okPass  = validatePassword(passField);
      if (!okEmail || !okPass) {
        note.textContent = 'Please fix the highlighted fields.';
        note.className = 'authnote is-error';
        return;
      }
      const email = emailField.querySelector('input').value.trim();
      note.textContent = 'Looks good — taking you to your dashboard…';
      note.className = 'authnote is-success';
      const dest = role === 'admin' ? 'admin-dashboard.html' : 'customer-dashboard.html';
      setTimeout(() => {
        window.location.href = `${dest}?email=${encodeURIComponent(email)}`;
      }, 700);
    });

    /* Google button simply navigates to 404 as per its href, no JS timeout needed. */
  }

  /* ---------------- SIGNUP ---------------- */
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    const nameField  = document.getElementById('signupNameField');
    const emailField = document.getElementById('signupEmailField');
    const passField  = document.getElementById('signupPasswordField');
    const confField  = document.getElementById('signupConfirmField');
    const note = document.getElementById('signupNote');

    function validateName() {
      const val = nameField.querySelector('input').value.trim();
      if (!val) return setError(nameField, 'Full name is required.');
      if (val.length < 2) return setError(nameField, 'Enter your full name.');
      return setError(nameField, '');
    }

    function validateConfirm() {
      const pass = passField.querySelector('input').value;
      const conf = confField.querySelector('input').value;
      if (!conf) return setError(confField, 'Please confirm your password.');
      if (conf !== pass) return setError(confField, 'Passwords do not match.');
      return setError(confField, '');
    }

    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const okName  = validateName();
      const okEmail = validateEmail(emailField);
      const okPass  = validatePassword(passField, { min: 6 });
      const okConf  = validateConfirm();

      if (!(okName && okEmail && okPass && okConf)) {
        note.textContent = 'Please fix the highlighted fields.';
        note.className = 'authnote is-error';
        return;
      }

      /* No email or password is stored or transmitted — form is cleared immediately. */
      signupForm.reset();
      note.textContent = 'Account created — redirecting you to login…';
      note.className = 'authnote is-success';
      setTimeout(() => { window.location.href = 'login.html'; }, 1100);
    });
  }
});