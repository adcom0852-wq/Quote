(function() {
  'use strict';

  const els = {
    loadingScreen: document.getElementById('loadingScreen'),
    loginForm: document.getElementById('loginForm'),
    emailInput: document.getElementById('emailInput'),
    passwordInput: document.getElementById('passwordInput'),
    passwordToggle: document.getElementById('passwordToggle'),
    loginBtn: document.getElementById('loginBtn'),
    themeToggle: document.getElementById('themeToggle'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    toastContainer: document.getElementById('toastContainer')
  };

  function init() {
    applyTheme(localStorage.getItem('theme') || 'dark');
    checkExistingSession();
    bindEvents();
  }

  function bindEvents() {
    els.loginForm?.addEventListener('submit', handleLogin);
    els.passwordToggle?.addEventListener('click', togglePassword);
    els.themeToggle?.addEventListener('click', toggleTheme);
    els.navToggle?.addEventListener('click', () => {
      els.navToggle.classList.toggle('active');
      els.navMenu?.classList.toggle('active');
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = els.themeToggle?.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  }

  function togglePassword() {
    if (!els.passwordInput || !els.passwordToggle) return;
    const isPassword = els.passwordInput.type === 'password';
    els.passwordInput.type = isPassword ? 'text' : 'password';
    const icon = els.passwordToggle.querySelector('i');
    if (icon) {
      icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    }
  }

  async function checkExistingSession() {
    const { session } = await checkAuth();
    if (session) {
      window.location.href = 'admin.html';
    } else {
      hideLoading();
    }
  }

  function hideLoading() {
    if (els.loadingScreen) {
      els.loadingScreen.classList.add('hidden');
    }
  }

  function setLoading(loading) {
    if (!els.loginBtn) return;
    els.loginBtn.disabled = loading;
    els.loginBtn.classList.toggle('btn-loading', loading);
  }

  async function handleLogin(e) {
    e.preventDefault();
    const email = els.emailInput?.value.trim();
    const password = els.passwordInput?.value;

    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      showToast('Failed to initialize Supabase', 'error');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 800);
    } catch (err) {
      console.error('Login error:', err);
      showToast(err.message || 'Invalid email or password', 'error');
      setLoading(false);
    }
  }

  function showToast(message, type = 'info') {
    if (!els.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info';
    toast.innerHTML = `
      <div class="toast-icon ${type}"><i class="fas ${iconClass}"></i></div>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;
    els.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
