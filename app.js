(function() {
  'use strict';

  const state = {
    quotes: [],
    categories: [],
    featuredQuote: null,
    searchQuery: '',
    selectedCategory: '',
    theme: localStorage.getItem('theme') || 'dark'
  };

  const els = {
    loadingScreen: document.getElementById('loadingScreen'),
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    themeToggle: document.getElementById('themeToggle'),
    searchInput: document.getElementById('searchInput'),
    searchClear: document.getElementById('searchClear'),
    categoryFilter: document.getElementById('categoryFilter'),
    quotesGrid: document.getElementById('quotesGrid'),
    quotesCount: document.getElementById('quotesCount'),
    noResults: document.getElementById('noResults'),
    featuredSection: document.getElementById('featuredSection'),
    featuredCard: document.getElementById('featuredCard'),
    toastContainer: document.getElementById('toastContainer')
  };

  function init() {
    applyTheme(state.theme);
    bindEvents();
    loadQuotes();
  }

  function bindEvents() {
    window.addEventListener('scroll', handleScroll);
    els.navToggle?.addEventListener('click', toggleNav);
    els.themeToggle?.addEventListener('click', toggleTheme);
    els.searchInput?.addEventListener('input', handleSearch);
    els.searchClear?.addEventListener('click', clearSearch);
    els.categoryFilter?.addEventListener('change', handleCategoryChange);

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        els.navMenu?.classList.remove('active');
        els.navToggle?.classList.remove('active');
      });
    });
  }

  function handleScroll() {
    if (window.scrollY > 10) {
      els.navbar?.classList.add('scrolled');
    } else {
      els.navbar?.classList.remove('scrolled');
    }
  }

  function toggleNav() {
    els.navToggle?.classList.toggle('active');
    els.navMenu?.classList.toggle('active');
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', state.theme);
    applyTheme(state.theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = els.themeToggle?.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }

  function handleSearch(e) {
    state.searchQuery = e.target.value.trim().toLowerCase();
    if (els.searchClear) {
      els.searchClear.classList.toggle('visible', state.searchQuery.length > 0);
    }
    renderQuotes();
  }

  function clearSearch() {
    state.searchQuery = '';
    if (els.searchInput) els.searchInput.value = '';
    if (els.searchClear) els.searchClear.classList.remove('visible');
    renderQuotes();
  }

  function handleCategoryChange(e) {
    state.selectedCategory = e.target.value;
    renderQuotes();
  }

  function hideLoading() {
    if (els.loadingScreen) {
      els.loadingScreen.classList.add('hidden');
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

  async function loadQuotes() {
    const client = getSupabaseClient();
    if (!client) {
      showToast('Failed to initialize Supabase', 'error');
      hideLoading();
      return;
    }

    try {
      const { data, error } = await client
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      state.quotes = data || [];
      state.categories = [...new Set(state.quotes.map(q => q.category).filter(Boolean))].sort();
      state.featuredQuote = state.quotes.find(q => q.featured) || state.quotes[0] || null;

      populateCategoryFilter();
      renderFeatured();
      renderQuotes();
    } catch (err) {
      console.error('Error loading quotes:', err);
      showToast('Failed to load quotes', 'error');
    } finally {
      hideLoading();
    }
  }

  function populateCategoryFilter() {
    if (!els.categoryFilter) return;
    const currentValue = els.categoryFilter.value;
    els.categoryFilter.innerHTML = '<option value="">All Categories</option>';
    state.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      els.categoryFilter.appendChild(option);
    });
    els.categoryFilter.value = currentValue;
  }

  function renderFeatured() {
    if (!els.featuredCard || !state.featuredQuote) {
      if (els.featuredSection) els.featuredSection.style.display = 'none';
      return;
    }

    const q = state.featuredQuote;
    els.featuredCard.innerHTML = `
      ${q.image ? `<img src="${escapeHtml(q.image)}" alt="" class="featured-image" loading="lazy">` : ''}
      <div class="featured-content">
        <span class="featured-category"><i class="fas fa-tag"></i> ${escapeHtml(q.category || 'Uncategorized')}</span>
        <div class="featured-quote-icon"><i class="fas fa-quote-left"></i></div>
        <p class="featured-text">${escapeHtml(q.quote)}</p>
        <p class="featured-author">${escapeHtml(q.author || 'Unknown')}</p>
        <div class="featured-actions">
          <button class="btn btn-primary btn-share" data-id="${q.id}">
            <i class="fas fa-share-nodes"></i> Share
          </button>
        </div>
      </div>
    `;

    const shareBtn = els.featuredCard.querySelector('.btn-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => shareQuote(q));
    }
  }

  function renderQuotes() {
    if (!els.quotesGrid) return;

    const filtered = state.quotes.filter(q => {
      const matchesSearch = !state.searchQuery ||
        (q.quote && q.quote.toLowerCase().includes(state.searchQuery)) ||
        (q.author && q.author.toLowerCase().includes(state.searchQuery));
      const matchesCategory = !state.selectedCategory || q.category === state.selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (els.quotesCount) {
      els.quotesCount.textContent = `${filtered.length} quote${filtered.length !== 1 ? 's' : ''}`;
    }

    if (filtered.length === 0) {
      els.quotesGrid.innerHTML = '';
      if (els.noResults) els.noResults.style.display = 'block';
      return;
    }

    if (els.noResults) els.noResults.style.display = 'none';

    els.quotesGrid.innerHTML = filtered.map((q, index) => `
      <article class="quote-card glass-card" style="animation-delay: ${Math.min(index * 0.05, 0.5)}s">
        ${q.image ? `<img src="${escapeHtml(q.image)}" alt="" class="quote-card-image" loading="lazy">` : ''}
        <div class="quote-card-icon"><i class="fas fa-quote-left"></i></div>
        <p class="quote-card-text">${escapeHtml(q.quote)}</p>
        <p class="quote-card-author">${escapeHtml(q.author || 'Unknown')}</p>
        <div class="quote-card-footer">
          <span class="quote-card-category"><i class="fas fa-tag"></i> ${escapeHtml(q.category || 'Uncategorized')}</span>
          <div class="quote-card-actions">
            <button class="btn-icon btn-copy" data-id="${q.id}" title="Copy to clipboard">
              <i class="fas fa-copy"></i>
            </button>
            <button class="btn-icon btn-share" data-id="${q.id}" title="Share">
              <i class="fas fa-share-nodes"></i>
            </button>
          </div>
        </div>
      </article>
    `).join('');

    els.quotesGrid.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const quote = state.quotes.find(q => q.id === btn.dataset.id);
        if (quote) copyToClipboard(quote, btn);
      });
    });

    els.quotesGrid.querySelectorAll('.btn-share').forEach(btn => {
      btn.addEventListener('click', () => {
        const quote = state.quotes.find(q => q.id === btn.dataset.id);
        if (quote) shareQuote(quote);
      });
    });
  }

  async function copyToClipboard(quote, btn) {
    const text = `"${quote.quote}" — ${quote.author || 'Unknown'}`;
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fas fa-check"></i>';
      showToast('Quote copied to clipboard', 'success');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fas fa-copy"></i>';
      }, 2000);
    } catch (err) {
      showToast('Failed to copy quote', 'error');
    }
  }

  async function shareQuote(quote) {
    const text = `"${quote.quote}" — ${quote.author || 'Unknown'}`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspiring Quote',
          text: text,
          url: url
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(quote, { classList: { add() {}, remove() {} }, innerHTML: '' });
        }
      }
    } else {
      copyToClipboard(quote, { classList: { add() {}, remove() {} }, innerHTML: '' });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
