/**
 * Shishir's Lab - Core JavaScript Engine
 * Handles navigation, entrance animation, lightbox, masonry filtering,
 * modal dialogs, and video controls.
 */

document.addEventListener('DOMContentLoaded', () => {
  initEntranceAnimation();
  initHeader();
  initGlanceModal();
  initSpotlight();
  initPortfolio();
  initProjectModal();
});

/* --------------------------------------------------------------------------
   1. Entrance Animation ("Entering Shishir’s Lab")
   -------------------------------------------------------------------------- */
function initEntranceAnimation() {
  const overlay = document.getElementById('entranceOverlay');
  if (!overlay) return;

  const skipBtn = document.getElementById('skipEntranceBtn');
  const alreadyVisited = sessionStorage.getItem('shishir_lab_entered');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (alreadyVisited || prefersReduced) {
    overlay.classList.add('hidden');
    return;
  }

  function dismiss() {
    overlay.classList.add('hidden');
    sessionStorage.setItem('shishir_lab_entered', 'true');
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', dismiss);
  }

  // Automatically fade out after 1.5 seconds
  setTimeout(() => {
    dismiss();
  }, 1600);
}

/* --------------------------------------------------------------------------
   2. Site Header & Mobile Navigation
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.mobile-nav-toggle');

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  if (toggle && header) {
    toggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('mobile-open');
      toggle.classList.toggle('active', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    header.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        header.classList.remove('mobile-open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* --------------------------------------------------------------------------
   3. "Shishir at a Glance" Under Construction Modal
   -------------------------------------------------------------------------- */
function initGlanceModal() {
  const glanceTriggers = document.querySelectorAll('[data-open-glance]');
  const glanceModal = document.getElementById('glanceModal');
  if (!glanceModal) return;

  const closeBtn = glanceModal.querySelector('.modal-close-btn');

  function open() {
    glanceModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    glanceModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  glanceTriggers.forEach(trig => {
    trig.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  glanceModal.addEventListener('click', (e) => {
    if (e.target === glanceModal) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && glanceModal.classList.contains('active')) {
      close();
    }
  });
}

/* --------------------------------------------------------------------------
   4. Spotlight Editorial Photo Grid & Lightbox (Home Page)
   -------------------------------------------------------------------------- */
let currentLightboxIndex = 0;
let spotlightItems = [];

function initSpotlight() {
  const grid = document.getElementById('spotlightGrid');
  if (!grid || !window.SHISHIR_DATA) return;

  spotlightItems = window.SHISHIR_DATA.spotlight;
  let showingAll = false;

  function renderGrid() {
    grid.innerHTML = '';
    const itemsToDisplay = showingAll ? spotlightItems : spotlightItems.filter(i => i.isCurated);

    itemsToDisplay.forEach((item, index) => {
      const card = document.createElement('div');
      // Create deliberate rhythm: 1st and 5th items can be featured wide
      const isWide = index === 0 || index === 4;
      card.className = `spotlight-card ${isWide ? 'featured-wide' : ''}`;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View moment: ${item.title}`);

      card.innerHTML = `
        <img class="spotlight-thumb" src="${item.thumb}" alt="${item.alt}" loading="lazy" width="540" height="540">
        <div class="spotlight-card-overlay">
          <div class="spotlight-badge-row">
            <span class="spotlight-index">[${String(index + 1).padStart(2, '0')}]</span>
            <span class="spotlight-year">${item.year}</span>
          </div>
          <div class="spotlight-info">
            <span class="spotlight-category">${item.category}</span>
            <h3 class="spotlight-title">${item.title}</h3>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openLightbox(spotlightItems.indexOf(item));
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(spotlightItems.indexOf(item));
        }
      });

      grid.appendChild(card);
    });
  }

  renderGrid();

  const toggleAllBtn = document.getElementById('toggleAllSpotlightBtn');
  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', () => {
      showingAll = !showingAll;
      renderGrid();
      toggleAllBtn.innerHTML = showingAll 
        ? 'Show Curated Selection (8) ↑' 
        : `View all moments (${spotlightItems.length}) ↓`;
    });
  }

  // Lightbox handlers
  const modal = document.getElementById('lightboxModal');
  if (!modal) return;

  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');
  const closeBtn = document.getElementById('lightboxCloseBtn');

  if (prevBtn) prevBtn.addEventListener('click', () => showPrevLightbox());
  if (nextBtn) nextBtn.addEventListener('click', () => showNextLightbox());
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrevLightbox();
    if (e.key === 'ArrowRight') showNextLightbox();
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) showNextLightbox();
    if (touchEndX - touchStartX > 50) showPrevLightbox();
  }, { passive: true });
}

function openLightbox(index) {
  const modal = document.getElementById('lightboxModal');
  if (!modal || !spotlightItems[index]) return;

  currentLightboxIndex = index;
  updateLightboxContent();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function showNextLightbox() {
  currentLightboxIndex = (currentLightboxIndex + 1) % spotlightItems.length;
  updateLightboxContent();
}

function showPrevLightbox() {
  currentLightboxIndex = (currentLightboxIndex - 1 + spotlightItems.length) % spotlightItems.length;
  updateLightboxContent();
}

function updateLightboxContent() {
  const item = spotlightItems[currentLightboxIndex];
  if (!item) return;

  const counter = document.getElementById('lightboxCounter');
  const img = document.getElementById('lightboxImg');
  const title = document.getElementById('lightboxTitle');
  const desc = document.getElementById('lightboxDesc');

  if (counter) counter.textContent = `${String(currentLightboxIndex + 1).padStart(2, '0')} / ${String(spotlightItems.length).padStart(2, '0')}`;
  if (img) {
    img.src = item.image;
    img.alt = item.alt;
  }
  if (title) title.textContent = item.title;
  if (desc) desc.textContent = item.caption;
}

/* --------------------------------------------------------------------------
   5. Portfolio Page: Featured Video, Masonry, Filters & Tree
   -------------------------------------------------------------------------- */
let activeCategory = 'all';
let activeSubcategory = 'all';
let searchQuery = '';
let visibleCount = 12;
const PAGE_SIZE = 12;

function initPortfolio() {
  initFeaturedVideo();
  initCategoryFilters();
  initSearch();
  initPortfolioTree();
  renderMasonry();
}

// 5.1 Featured Video - Play on demand & pause when leaving page
function initFeaturedVideo() {
  const posterWrapper = document.getElementById('featuredVideoPoster');
  const playerContainer = document.getElementById('featuredVideoContainer');
  if (!posterWrapper || !playerContainer || !window.SHISHIR_DATA) return;

  const vData = window.SHISHIR_DATA.featuredVideo;

  posterWrapper.addEventListener('click', () => {
    playerContainer.innerHTML = `
      <iframe 
        id="featuredIframe"
        src="https://www.youtube-nocookie.com/embed/${vData.embedId}?autoplay=1&start=${vData.startTime}&rel=0" 
        title="${vData.title}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        style="width: 100%; height: 100%; border: none;">
      </iframe>
    `;
  });

  // Stop playback when visitor leaves the page
  function stopPlayback() {
    const iframe = document.getElementById('featuredIframe');
    if (iframe) {
      iframe.remove();
      // restore poster
      playerContainer.appendChild(posterWrapper);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopPlayback();
  });
  window.addEventListener('beforeunload', stopPlayback);
  window.addEventListener('pagehide', stopPlayback);
}

// 5.2 Category Filter Tabs
function initCategoryFilters() {
  const tabButtons = document.querySelectorAll('.category-tab-btn');
  const subcatBar = document.getElementById('designSubcategoriesBar');
  const subcatBtns = document.querySelectorAll('.subcat-btn');

  // Dynamically update tab counts
  if (window.SHISHIR_DATA && window.SHISHIR_DATA.projects) {
    const all = window.SHISHIR_DATA.projects;
    tabButtons.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      const countSpan = btn.querySelector('.tab-count');
      if (countSpan) {
        const count = cat === 'all' ? all.length : all.filter(p => p.category === cat).length;
        countSpan.textContent = count;
      }
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      activeCategory = btn.getAttribute('data-category');
      visibleCount = PAGE_SIZE;

      // Show/hide design subcategory bar
      if (activeCategory === 'design') {
        if (subcatBar) subcatBar.classList.add('visible');
      } else {
        if (subcatBar) subcatBar.classList.remove('visible');
        activeSubcategory = 'all';
        subcatBtns.forEach(sb => sb.classList.remove('active'));
        const allSubBtn = document.querySelector('.subcat-btn[data-subcat="all"]');
        if (allSubBtn) allSubBtn.classList.add('active');
      }

      renderMasonry();
    });
  });

  subcatBtns.forEach(sb => {
    sb.addEventListener('click', () => {
      subcatBtns.forEach(b => b.classList.remove('active'));
      sb.classList.add('active');
      activeSubcategory = sb.getAttribute('data-subcat');
      visibleCount = PAGE_SIZE;
      renderMasonry();
    });
  });
}

// 5.3 Search Input
function initSearch() {
  const searchInput = document.getElementById('portfolioSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    visibleCount = PAGE_SIZE;
    renderMasonry();
  });
}

// 5.4 Portfolio Tree Interactions
function initPortfolioTree() {
  const branchNodes = document.querySelectorAll('.tree-branch-node');
  if (!branchNodes.length) return;

  branchNodes.forEach(node => {
    node.addEventListener('click', () => {
      const targetCat = node.getAttribute('data-target-category');
      if (!targetCat) return;

      // Reset search
      const searchInput = document.getElementById('portfolioSearchInput');
      if (searchInput) searchInput.value = '';
      searchQuery = '';

      // Activate corresponding category tab
      const matchingTab = document.querySelector(`.category-tab-btn[data-category="${targetCat}"]`);
      if (matchingTab) {
        document.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
        matchingTab.classList.add('active');
        activeCategory = targetCat;
      }

      const subcatBar = document.getElementById('designSubcategoriesBar');
      if (activeCategory === 'design' && subcatBar) {
        subcatBar.classList.add('visible');
      } else if (subcatBar) {
        subcatBar.classList.remove('visible');
      }

      visibleCount = PAGE_SIZE;
      renderMasonry();

      // Smooth scroll to work categories
      const targetSection = document.getElementById('work-categories');
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// 5.5 Render Masonry Grid
function renderMasonry() {
  const grid = document.getElementById('masonryGrid');
  const counterText = document.getElementById('filterCounterText');
  const revealProgress = document.getElementById('revealProgressText');
  const loadMoreBtn = document.getElementById('loadMoreWorkBtn');
  if (!grid || !window.SHISHIR_DATA) return;

  const allProjects = window.SHISHIR_DATA.projects;

  // Filter
  const filtered = allProjects.filter(item => {
    // Category match
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }

    // Subcategory match for Design Studio
    if (activeCategory === 'design' && activeSubcategory !== 'all') {
      if (item.subCategory !== activeSubcategory) return false;
    }

    // Search query match
    if (searchQuery) {
      const matchTitle = item.title.toLowerCase().includes(searchQuery);
      const matchDesc = item.desc && item.desc.toLowerCase().includes(searchQuery);
      const matchOrg = item.org && item.org.toLowerCase().includes(searchQuery);
      const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery));
      if (!matchTitle && !matchDesc && !matchOrg && !matchTags) return false;
    }

    return true;
  });

  if (counterText) {
    counterText.textContent = `${filtered.length} items found`;
  }

  // Progressive reveal slice
  const displayedItems = filtered.slice(0, visibleCount);

  grid.innerHTML = '';
  if (displayedItems.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 60px 20px; text-align: center; color: var(--text-muted); font-family: var(--font-mono);">
        [NO PROJECTS FOUND MATCHING CURRENT CRITERIA]
      </div>
    `;
    if (revealProgress) revealProgress.textContent = '';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    return;
  }

  displayedItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'masonry-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View project: ${item.title}`);

    const badgeLabel = item.subCategoryName || item.categoryName;
    const mediaThumb = item.thumb || item.image;

    card.innerHTML = `
      <div class="card-media-box">
        <img class="card-media-img" src="${mediaThumb}" alt="${item.title}" loading="lazy">
        <span class="card-media-badge">${badgeLabel}</span>
      </div>
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        <div class="card-meta-row">
          <span class="card-tag">${item.role || item.org || item.tags?.[0] || 'Shishir’s Lab'}</span>
          <span class="card-open-hint mono">VIEW ↗</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => openProjectModal(item));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProjectModal(item);
      }
    });

    grid.appendChild(card);
  });

  // Reveal progress & load more button
  if (revealProgress) {
    revealProgress.textContent = `Showing ${displayedItems.length} of ${filtered.length} items`;
  }

  if (loadMoreBtn) {
    if (displayedItems.length < filtered.length) {
      loadMoreBtn.style.display = 'inline-flex';
      loadMoreBtn.onclick = () => {
        visibleCount += PAGE_SIZE;
        renderMasonry();
      };
    } else {
      loadMoreBtn.style.display = 'none';
    }
  }
}

/* --------------------------------------------------------------------------
   6. Project Detail Modal
   -------------------------------------------------------------------------- */
function initProjectModal() {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const closeBtn = modal.querySelector('.modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeProjectModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProjectModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeProjectModal();
    }
  });
}

function openProjectModal(item) {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const titleEl = document.getElementById('projectModalTitle');
  const mediaHolder = document.getElementById('projectModalMedia');
  const metaGrid = document.getElementById('projectModalMeta');
  const descEl = document.getElementById('projectModalDesc');
  const tagsRow = document.getElementById('projectModalTags');
  const actionsRow = document.getElementById('projectModalActions');

  if (titleEl) titleEl.textContent = item.title;

  // Media render: video, image, or PDF preview
  if (mediaHolder) {
    mediaHolder.innerHTML = '';
    if (item.video) {
      mediaHolder.innerHTML = `
        <video controls preload="metadata" poster="${item.thumb || item.image}">
          <source src="${item.video}" type="video/mp4">
          Your browser does not support HTML5 video playback.
        </video>
      `;
    } else if (item.image) {
      mediaHolder.innerHTML = `<img src="${item.image}" alt="${item.title}">`;
    }
  }

  // Meta grid
  if (metaGrid) {
    let metaHTML = `
      <div class="modal-meta-item">
        <strong>Category</strong>
        <span>${item.categoryName}</span>
      </div>
    `;
    if (item.role) {
      metaHTML += `
        <div class="modal-meta-item">
          <strong>Role / Scope</strong>
          <span>${item.role}</span>
        </div>
      `;
    }
    if (item.org) {
      metaHTML += `
        <div class="modal-meta-item">
          <strong>Context / Organization</strong>
          <span>${item.org}</span>
        </div>
      `;
    }
    if (item.date) {
      metaHTML += `
        <div class="modal-meta-item">
          <strong>Milestone</strong>
          <span>${item.date}</span>
        </div>
      `;
    }
    metaGrid.innerHTML = metaHTML;
  }

  if (descEl) descEl.textContent = item.desc || '';

  // Tags
  if (tagsRow) {
    tagsRow.innerHTML = '';
    if (item.tags && item.tags.length) {
      item.tags.forEach(t => {
        const pill = document.createElement('span');
        pill.className = 'modal-tag-pill';
        pill.textContent = `#${t}`;
        tagsRow.appendChild(pill);
      });
    }
  }

  // Action links
  if (actionsRow) {
    actionsRow.innerHTML = '';
    if (item.link) {
      const a = document.createElement('a');
      a.className = 'btn btn-primary btn-sm';
      a.href = item.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = `${item.linkLabel || 'Launch Live'} ↗`;
      actionsRow.appendChild(a);
    }
    if (item.pdf) {
      const a = document.createElement('a');
      a.className = 'btn btn-secondary btn-sm';
      a.href = item.pdf;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = `Open PDF Document ↗`;
      actionsRow.appendChild(a);
    }
    if (item.image) {
      const a = document.createElement('a');
      a.className = 'btn btn-outline btn-sm';
      a.href = item.image;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = `View High-Res Image ↗`;
      actionsRow.appendChild(a);
    }
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  // Pause any playing modal video
  const vid = modal.querySelector('video');
  if (vid) vid.pause();

  modal.classList.remove('active');
  document.body.style.overflow = '';
}

