(function() {
  'use strict';

  const state = {
    quotes: [],
    categories: [],
    searchQuery: '',
    selectedCategory: '',
    editingId: null,
    deletingId: null,
    theme: localStorage.getItem('theme') || 'dark'
  };

  const els = {
    loadingScreen: document.getElementById('loadingScreen'),
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    themeToggle: document.getElementById('themeToggle'),
    logoutBtn: document.getElementById('logoutBtn'),
    addQuoteBtn: document.getElementById('addQuoteBtn'),
    totalQuotes: document.getElementById('totalQuotes'),
    featuredQuotes: document.getElementById('featuredQuotes'),
    totalCategories: document.getElementById('totalCategories'),
    adminSearchInput: document.getElementById('adminSearchInput'),
    adminCategoryFilter: document.getElementById('adminCategoryFilter'),
    quotesTableBody: document.getElementById('quotesTableBody'),
    adminNoResults: document.getElementById('adminNoResults'),
    quoteModal: document.getElementById('quoteModal'),
    modalTitle: document.getElementById('modalTitle'),
    modalClose: document.getElementById('modalClose'),
    modalCancel: document.getElementById('modalCancel'),
    modalSubmit: document.getElementById('modalSubmit'),
    quoteForm: document.getElementById('quoteForm'),
    quoteId: document.getElementById('quoteId'),
    quoteText: document.getElementById('quoteText'),
    quoteAuthor: document.getElementById('quoteAuthor'),
    quoteCategory: document.getElementById('quoteCategory'),
    categoryList: document.getElementById('categoryList'),
    quoteImage: document.getElementById('quoteImage'),
    quoteFeatured: document.getElementById('quoteFeatured'),
    deleteModal: document.getElementById('deleteModal'),
    deleteModalClose: document.getElementById('deleteModalClose'),
    deleteCancel: document.getElementById('deleteCancel'),
    deleteConfirm: document.getElementById('deleteConfirm'),
    toastContainer: document.getElementById('toastContainer')
  };

  function init() {
    applyTheme(state.theme);
    bindEvents();
    checkAuthAndLoad();
  }

  function bindEvents() {
    window.addEventListener('scroll', handleScroll);
    els.navToggle?.addEventListener('click', toggleNav);
    els.themeToggle?.addEventListener('click', toggleTheme);
    els.logoutBtn?.addEventListener('click', handleLogout);
    els.addQuoteBtn?.addEventListener('click', () => openModal());
    els.modalClose?.addEventListener('click', closeModal);
    els.modalCancel?.addEventListener('click', closeModal);
    els.quoteModal?.addEventListener('click', (e) => {
      if (e.target === els.quoteModal) closeModal();
    });
    els.quoteForm?.addEventListener('submit', handleSaveQuote);
    els.deleteModalClose?.addEventListener('click', closeDeleteModal);
    els.deleteCancel?.addEventListener('click', closeDeleteModal);
    els.deleteModal?.addEventListener('click', (e) => {
      if (e.target === els.deleteModal) closeDeleteModal();
    });
    els.deleteConfirm?.addEventListener('click', handleDeleteConfirm);
    els.adminSearchInput?.addEventListener('input', handleSearch);
    els.adminCategoryFilter?.addEventListener('change', handleCategoryChange);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        closeDeleteModal();
      }
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

  async function checkAuthAndLoad() {
    const { session } = await checkAuth();
    if (!session) {
      window.location.href = 'login.html';
      return;
    }
    await loadQuotes();
    hideLoading();
  }

  function hideLoading() {
    if (els.loadingScreen) {
      els.loadingScreen.classList.add('hidden');
    }
  }

  async function handleLogout() {
    const { error } = await signOut();
    if (error) {
      showToast('Logout failed', 'error');
      return;
    }
    window.location.href = 'login.html';
  }

  async function loadQuotes() {
    const client = getSupabaseClient();
    if (!client) {
      showToast('Failed to initialize Supabase', 'error');
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

      updateStats();
      populateCategoryFilter();
      populateCategoryDatalist();
      renderTable();
    } catch (err) {
      console.error('Error loading quotes:', err);
      showToast('Failed to load quotes', 'error');
    }
  }

  function updateStats() {
    if (els.totalQuotes) {
      animateNumber(els.totalQuotes, state.quotes.length);
    }
    if (els.featuredQuotes) {
      const featuredCount = state.quotes.filter(q => q.featured).length;
      animateNumber(els.featuredQuotes, featuredCount);
    }
    if (els.totalCategories) {
      animateNumber(els.totalCategories, state.categories.length);
    }
  }

  function animateNumber(element, target) {
    const duration = 600;
    const start = parseInt(element.textContent) || 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeOut);
      element.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function populateCategoryFilter() {
    if (!els.adminCategoryFilter) return;
    const currentValue = els.adminCategoryFilter.value;
    els.adminCategoryFilter.innerHTML = '<option value="">All Categories</option>';
    state.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      els.adminCategoryFilter.appendChild(option);
    });
    els.adminCategoryFilter.value = currentValue;
  }

  function populateCategoryDatalist() {
    if (!els.categoryList) return;
    els.categoryList.innerHTML = '';
    state.categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      els.categoryList.appendChild(option);
    });
  }

  function handleSearch(e) {
    state.searchQuery = e.target.value.trim().toLowerCase();
    renderTable();
  }

  function handleCategoryChange(e) {
    state.selectedCategory = e.target.value;
    renderTable();
  }

  function renderTable() {
    if (!els.quotesTableBody) return;

    const filtered = state.quotes.filter(q => {
      const matchesSearch = !state.searchQuery ||
        (q.quote && q.quote.toLowerCase().includes(state.searchQuery)) ||
        (q.author && q.author.toLowerCase().includes(state.searchQuery));
      const matchesCategory = !state.selectedCategory || q.category === state.selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
      els.quotesTableBody.innerHTML = '';
      if (els.adminNoResults) els.adminNoResults.style.display = 'block';
      if (els.quotesTableBody.closest('.quotes-table-wrapper')) {
        els.quotesTableBody.closest('.quotes-table-wrapper').style.display = 'none';
      }
      return;
    }

    if (els.adminNoResults) els.adminNoResults.style.display = 'none';
    if (els.quotesTableBody.closest('.quotes-table-wrapper')) {
      els.quotesTableBody.closest('.quotes-table-wrapper').style.display = 'block';
    }

    els.quotesTableBody.innerHTML = filtered.map(q => `
      <tr>
        <td data-label="Quote" class="table-quote">
          <div class="table-quote-text">${escapeHtml(q.quote)}</div>
        </td>
        <td data-label="Author" class="table-author">${escapeHtml(q.author || 'Unknown')}</td>
        <td data-label="Category" class="table-category">
          <span><i class="fas fa-tag"></i> ${escapeHtml(q.category || 'Uncategorized')}</span>
        </td>
        <td data-label="Featured" class="table-featured">
          <button class="btn-pin ${q.featured ? 'pinned' : ''}" data-id="${q.id}" title="${q.featured ? 'Unpin' : 'Pin as featured'}">
            <i class="fas fa-thumbtack"></i>
          </button>
        </td>
        <td data-label="Actions" class="table-actions">
          <button class="btn-edit" data-id="${q.id}" title="Edit">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn-delete" data-id="${q.id}" title="Delete">
            <i class="fas fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');

    els.quotesTableBody.querySelectorAll('.btn-pin').forEach(btn => {
      btn.addEventListener('click', () => toggleFeatured(btn.dataset.id));
    });

    els.quotesTableBody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });

    els.quotesTableBody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => openDeleteModal(btn.dataset.id));
    });
  }

  function openModal() {
    state.editingId = null;
    if (els.modalTitle) els.modalTitle.textContent = 'Add Quote';
    if (els.quoteId) els.quoteId.value = '';
    if (els.quoteText) els.quoteText.value = '';
    if (els.quoteAuthor) els.quoteAuthor.value = '';
    if (els.quoteCategory) els.quoteCategory.value = '';
    if (els.quoteImage) els.quoteImage.value = '';
    if (els.quoteFeatured) els.quoteFeatured.checked = false;
    if (els.quoteModal) els.quoteModal.classList.add('active');
    els.quoteText?.focus();
  }

  function openEditModal(id) {
    const quote = state.quotes.find(q => q.id === id);
    if (!quote) return;

    state.editingId = id;
    if (els.modalTitle) els.modalTitle.textContent = 'Edit Quote';
    if (els.quoteId) els.quoteId.value = quote.id;
    if (els.quoteText) els.quoteText.value = quote.quote || '';
    if (els.quoteAuthor) els.quoteAuthor.value = quote.author || '';
    if (els.quoteCategory) els.quoteCategory.value = quote.category || '';
    if (els.quoteImage) els.quoteImage.value = quote.image || '';
    if (els.quoteFeatured) els.quoteFeatured.checked = !!quote.featured;
    if (els.quoteModal) els.quoteModal.classList.add('active');
    els.quoteText?.focus();
  }

  function closeModal() {
    if (els.quoteModal) els.quoteModal.classList.remove('active');
    state.editingId = null;
  }

  function openDeleteModal(id) {
    state.deletingId = id;
    if (els.deleteModal) els.deleteModal.classList.add('active');
  }

  function closeDeleteModal() {
    if (els.deleteModal) els.deleteModal.classList.remove('active');
    state.deletingId = null;
  }

  function setModalLoading(loading) {
    if (!els.modalSubmit) return;
    els.modalSubmit.disabled = loading;
    els.modalSubmit.classList.toggle('btn-loading', loading);
  }

  function setDeleteLoading(loading) {
    if (!els.deleteConfirm) return;
    els.deleteConfirm.disabled = loading;
    els.deleteConfirm.classList.toggle('btn-loading', loading);
  }

  async function handleSaveQuote(e) {
    e.preventDefault();

    const quoteData = {
      quote: els.quoteText?.value.trim(),
      author: els.quoteAuthor?.value.trim(),
      category: els.quoteCategory?.value.trim(),
      image: els.quoteImage?.value.trim() || null,
      featured: els.quoteFeatured?.checked || false
    };

    if (!quoteData.quote || !quoteData.author || !quoteData.category) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      showToast('Failed to initialize Supabase', 'error');
      return;
    }

    setModalLoading(true);

    try {
      let result;

      if (state.editingId) {
        if (quoteData.featured) {
          await client.from('quotes').update({ featured: false }).neq('id', state.editingId);
        }

        result = await client
          .from('quotes')
          .update(quoteData)
          .eq('id', state.editingId)
          .select();
      } else {
        if (quoteData.featured) {
          await client.from('quotes').update({ featured: false }).neq('id', '00000000-0000-0000-0000-000000000000');
        }

        result = await client
          .from('quotes')
          .insert([quoteData])
          .select();
      }

      if (result.error) throw result.error;

      showToast(state.editingId ? 'Quote updated successfully' : 'Quote added successfully', 'success');
      closeModal();
      await loadQuotes();
    } catch (err) {
      console.error('Save error:', err);
      showToast(err.message || 'Failed to save quote', 'error');
    } finally {
      setModalLoading(false);
    }
  }

  async function toggleFeatured(id) {
    const quote = state.quotes.find(q => q.id === id);
    if (!quote) return;

    const client = getSupabaseClient();
    if (!client) {
      showToast('Failed to initialize Supabase', 'error');
      return;
    }

    const newFeatured = !quote.featured;

    try {
      if (newFeatured) {
        await client.from('quotes').update({ featured: false }).neq('id', id);
      }

      const { error } = await client
        .from('quotes')
        .update({ featured: newFeatured })
        .eq('id', id);

      if (error) throw error;

      showToast(newFeatured ? 'Quote pinned as featured' : 'Quote unpinned', 'success');
      await loadQuotes();
    } catch (err) {
      console.error('Toggle featured error:', err);
      showToast(err.message || 'Failed to update featured status', 'error');
    }
  }

  async function handleDeleteConfirm() {
    if (!state.deletingId) return;

    const client = getSupabaseClient();
    if (!client) {
      showToast('Failed to initialize Supabase', 'error');
      return;
    }

    setDeleteLoading(true);

    try {
      const { error } = await client
        .from('quotes')
        .delete()
        .eq('id', state.deletingId);

      if (error) throw error;

      showToast('Quote deleted successfully', 'success');
      closeDeleteModal();
      await loadQuotes();
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Failed to delete quote', 'error');
    } finally {
      setDeleteLoading(false);
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
