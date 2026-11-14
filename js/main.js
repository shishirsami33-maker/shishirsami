/**
 * Shishir's Lab - Core JavaScript Engine
 * Handles clean URLs, navigation, entrance animation, lightbox, masonry filtering,
 * modal dialogs, and video controls.
 */

// Clean URLs in browser address bar (strips .html cleanly if present)
(function enforceCleanUrlBar() {
  if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'file:') {
    const pathname = window.location.pathname;
    if (pathname.endsWith('.html')) {
      const clean = pathname.replace(/(?:index)?\.html$/, '') || '/';
      window.history.replaceState(null, '', clean + window.location.search + window.location.hash);
    }
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initEntranceAnimation();
  initHeader();
  initGlanceModal();
  initContactPanel();
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
   3.1 Contact Panel Modal / Slide-Over
   -------------------------------------------------------------------------- */
function initContactPanel() {
  const contactTriggers = document.querySelectorAll('[data-open-contact]');
  const contactModal = document.getElementById('contactModal');
  if (!contactModal) return;

  const closeBtn = document.getElementById('contactModalCloseBtn');

  function open() {
    contactModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    contactModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  contactTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', close);
  contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal.classList.contains('active')) {
      close();
    }
  });

  // Clipboard copy handler for contact details
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.color = '#D4FF24';
        btn.style.borderColor = '#D4FF24';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2000);
      }).catch(() => {
        // Fallback prompt
        window.prompt('Copy contact info:', text);
      });
    });
  });
}

/* --------------------------------------------------------------------------
   3.5 Reusable 3D Curved Cylindrical Carousel Engine
   -------------------------------------------------------------------------- */
class Curved3DCarousel {
  constructor(config) {
    this.scene = config.scene;
    this.track = config.track;
    this.prevBtn = config.prevBtn;
    this.nextBtn = config.nextBtn;
    this.currentEl = config.currentEl;
    this.totalEl = config.totalEl;
    this.scrubTrack = config.scrubTrack;
    this.scrubFill = config.scrubFill;
    this.onCardRender = config.onCardRender;
    this.onCardClick = config.onCardClick;

    this.items = [];
    this.currentIndex = 0;
    this.cardElements = [];

    // Drag / Touch state
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.dragFraction = 0;
    this.hasMoved = false;

    this.initEvents();
  }

  setItems(items, initialIndex = 0) {
    this.items = items || [];
    this.currentIndex = Math.max(0, Math.min(initialIndex, Math.max(0, this.items.length - 1)));
    this.dragFraction = 0;
    this.buildCards();
    this.update();
  }

  buildCards() {
    this.track.innerHTML = '';
    this.cardElements = [];

    if (this.items.length === 0) {
      this.track.innerHTML = `
        <div style="position: absolute; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.85rem; text-align: center; width: 100%; top: 50%; transform: translateY(-50%);">
          [NO ITEMS AVAILABLE IN THIS VIEW]
        </div>
      `;
      if (this.totalEl) this.totalEl.textContent = '00';
      if (this.currentEl) this.currentEl.textContent = '00';
      if (this.scrubFill) this.scrubFill.style.width = '0%';
      return;
    }

    this.items.forEach((item, index) => {
      const card = document.createElement('div');
      const isLandscape = item.aspectRatio === 'landscape' || (item.aspectNumber && item.aspectNumber > 1.18);
      const formatClass = isLandscape ? 'format-landscape' : 'format-portrait';
      card.className = `card-3d ${formatClass}`;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${item.title || 'Exhibition Card'}`);

      card.innerHTML = this.onCardRender(item, index);

      // Dynamic aspect-ratio refinement on image load
      const imgEl = card.querySelector('.card-3d-img');
      if (imgEl) {
        imgEl.addEventListener('load', () => {
          if (imgEl.naturalWidth && imgEl.naturalHeight) {
            const ratio = imgEl.naturalWidth / imgEl.naturalHeight;
            if (ratio > 1.18) {
              card.classList.add('format-landscape');
              card.classList.remove('format-portrait');
            } else {
              card.classList.add('format-portrait');
              card.classList.remove('format-landscape');
            }
          }
        });
      }

      // Card click handling
      card.addEventListener('click', (e) => {
        if (this.hasMoved) return; // Prevent triggering if user was dragging
        const diff = index - this.currentIndex;
        if (Math.abs(diff) === 0) {
          if (this.onCardClick) this.onCardClick(item, index);
        } else {
          this.goTo(index);
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const diff = index - this.currentIndex;
          if (Math.abs(diff) === 0) {
            if (this.onCardClick) this.onCardClick(item, index);
          } else {
            this.goTo(index);
          }
        }
      });

      this.track.appendChild(card);
      this.cardElements.push(card);
    });

    if (this.totalEl) {
      this.totalEl.textContent = String(this.items.length).padStart(2, '0');
    }
  }

  update(isInteractiveDrag = false) {
    const total = this.items.length;
    if (total === 0) return;

    const isMobile = window.innerWidth < 640;
    const isTablet = window.innerWidth < 1024;
    const radius = isMobile ? 380 : (isTablet ? 520 : 660);
    const angleStep = isMobile ? 26 : 22; // degrees per card

    this.cardElements.forEach((card, index) => {
      const offset = (index - this.currentIndex) + this.dragFraction;
      const absOffset = Math.abs(offset);

      if (isInteractiveDrag) {
        card.classList.add('is-dragging');
      } else {
        card.classList.remove('is-dragging');
      }

      // Hide cards outside active viewing hemisphere for 60fps performance
      if (absOffset > 4.2) {
        card.style.transform = 'translate3d(0, 0, -2000px) scale(0)';
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.classList.remove('is-center');
        return;
      }

      const angleDeg = offset * angleStep;
      const angleRad = (angleDeg * Math.PI) / 180;

      // Cylindrical coordinates
      const x = Math.sin(angleRad) * radius;
      const z = (Math.cos(angleRad) - 1) * radius - (absOffset * 35);
      const rotY = -angleDeg * 0.92;
      const scale = Math.max(0.72, 1 - absOffset * 0.08);
      const opacity = Math.max(0.12, 1 - absOffset * 0.22);
      const zIndex = Math.round(100 - absOffset * 10);

      card.style.transform = `translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      card.style.opacity = opacity.toFixed(3);
      card.style.zIndex = zIndex;
      card.style.pointerEvents = absOffset < 2.5 ? 'auto' : 'none';

      if (absOffset < 0.45) {
        card.classList.add('is-center');
      } else {
        card.classList.remove('is-center');
      }
    });

    // Update Counter & Scrubber fill bar
    if (this.currentEl) {
      this.currentEl.textContent = String(this.currentIndex + 1).padStart(2, '0');
    }
    if (this.scrubFill && total > 0) {
      const pct = (this.currentIndex / Math.max(1, total - 1)) * 100;
      this.scrubFill.style.width = `${Math.min(100, Math.max(5, pct))}%`;
    }
  }

  goTo(targetIndex) {
    const total = this.items.length;
    if (total === 0) return;
    this.currentIndex = Math.max(0, Math.min(targetIndex, total - 1));
    this.dragFraction = 0;
    this.update();
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goTo(this.currentIndex - 1);
    } else {
      this.goTo(this.items.length - 1);
    }
  }

  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.goTo(this.currentIndex + 1);
    } else {
      this.goTo(0);
    }
  }

  initEvents() {
    // Navigation buttons
    if (this.prevBtn) this.prevBtn.addEventListener('click', (e) => { e.stopPropagation(); this.prev(); });
    if (this.nextBtn) this.nextBtn.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });

    // Scrubber click to seek
    if (this.scrubTrack) {
      this.scrubTrack.addEventListener('click', (e) => {
        const rect = this.scrubTrack.getBoundingClientRect();
        const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const targetIdx = Math.round(clickRatio * (this.items.length - 1));
        this.goTo(targetIdx);
      });
    }

    // Touch & Mouse Drag Physics
    const onStart = (clientX) => {
      this.isDragging = true;
      this.hasMoved = false;
      this.startX = clientX;
      this.currentX = clientX;
      this.dragFraction = 0;
    };

    const onMove = (clientX) => {
      if (!this.isDragging) return;
      this.currentX = clientX;
      const deltaX = this.currentX - this.startX;
      if (Math.abs(deltaX) > 6) this.hasMoved = true;

      const sensitivity = window.innerWidth < 640 ? 180 : 260;
      this.dragFraction = deltaX / sensitivity;
      requestAnimationFrame(() => this.update(true));
    };

    const onEnd = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      const deltaX = this.currentX - this.startX;

      if (Math.abs(deltaX) > 35) {
        if (deltaX < 0) {
          this.next();
        } else {
          this.prev();
        }
      } else {
        this.dragFraction = 0;
        this.update();
      }
      setTimeout(() => { this.hasMoved = false; }, 60);
    };

    // Mouse drag
    this.scene.addEventListener('mousedown', (e) => {
      if (e.target.closest('.carousel-nav-btn')) return;
      onStart(e.clientX);
    });
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) onMove(e.clientX);
    });
    window.addEventListener('mouseup', () => {
      if (this.isDragging) onEnd();
    });

    // Touch swipe
    this.scene.addEventListener('touchstart', (e) => {
      if (e.target.closest('.carousel-nav-btn')) return;
      onStart(e.touches[0].clientX);
    }, { passive: true });
    this.scene.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        onMove(e.touches[0].clientX);
      }
    }, { passive: true });
    this.scene.addEventListener('touchend', () => {
      if (this.isDragging) onEnd();
    });

    // Keyboard navigation (ArrowLeft / ArrowRight)
    this.scene.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });

    // Wheel navigation (debounced)
    let wheelCooldown = false;
    this.scene.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || Math.abs(e.deltaY) > 30) {
        if (wheelCooldown) return;
        wheelCooldown = true;
        setTimeout(() => { wheelCooldown = false; }, 200);
        if (e.deltaX > 20 || e.deltaY > 20) {
          this.next();
        } else if (e.deltaX < -20 || e.deltaY < -20) {
          this.prev();
        }
      }
    }, { passive: true });

    // Window resize
    window.addEventListener('resize', () => {
      this.update();
    });
  }
}

/* --------------------------------------------------------------------------
   4. Spotlight 3D Curved Carousel & Editorial Lightbox (Home Page)
   -------------------------------------------------------------------------- */
let currentLightboxIndex = 0;
let spotlightItems = [];
let spotlightCarousel = null;

function initSpotlight() {
  const grid = document.getElementById('spotlightGrid');
  const sceneEl = document.getElementById('spotlight3dScene');
  const trackEl = document.getElementById('spotlight3dTrack');
  if (!window.SHISHIR_DATA || !window.SHISHIR_DATA.spotlight) return;

  spotlightItems = window.SHISHIR_DATA.spotlight;
  let showingAll = false;

  // 1. Initialize 3D Curved Carousel (Primary Showcase)
  if (sceneEl && trackEl) {
    spotlightCarousel = new Curved3DCarousel({
      scene: sceneEl,
      track: trackEl,
      prevBtn: document.getElementById('spotlightPrevBtn'),
      nextBtn: document.getElementById('spotlightNextBtn'),
      currentEl: document.getElementById('spotlightCounterCurrent'),
      totalEl: document.getElementById('spotlightCounterTotal'),
      scrubTrack: document.getElementById('spotlightScrubTrack'),
      scrubFill: document.getElementById('spotlightScrubFill'),
      onCardRender: (item, index) => {
        const mediaThumb = item.thumb || item.image;
        return `
          <div class="card-3d-media-box">
            <div class="card-3d-backdrop-blur" style="background-image: url('${mediaThumb}');"></div>
            <img class="card-3d-img" src="${mediaThumb}" alt="${item.alt || item.title}" loading="lazy">
            <div class="card-3d-overlay">
              <div class="card-3d-top-row">
                <span class="card-3d-badge">[${String(index + 1).padStart(2, '0')}]</span>
                <span class="card-3d-category-badge">${item.category || 'MOMENT'}</span>
              </div>
              <div class="card-3d-bottom-info">
                <span class="card-3d-meta-sub">${item.year} &bull; ${item.location || 'Dhaka, Bangladesh'}</span>
                <h3 class="card-3d-title">${item.title}</h3>
                <div class="card-3d-action-pill">
                  <span>INSPECT MOMENT</span>
                  <span>↗</span>
                </div>
              </div>
            </div>
          </div>
        `;
      },
      onCardClick: (item, index) => {
        openLightbox(spotlightItems.indexOf(item));
      }
    });

    spotlightCarousel.setItems(spotlightItems, 0);

    // View Mode Toggle (3D Curved Carousel vs Photo Grid)
    const carouselViewBtn = document.getElementById('spotlightCarouselViewBtn');
    const gridViewBtn = document.getElementById('spotlightGridViewBtn');
    const carouselContainer = document.getElementById('spotlightCarouselContainer');
    const toggleAllBtn = document.getElementById('toggleAllSpotlightBtn');

    if (carouselViewBtn && gridViewBtn) {
      carouselViewBtn.addEventListener('click', () => {
        carouselViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        if (carouselContainer) carouselContainer.style.display = 'flex';
        if (grid) grid.style.display = 'none';
        if (toggleAllBtn) toggleAllBtn.style.display = 'none';
        spotlightCarousel.update();
      });

      gridViewBtn.addEventListener('click', () => {
        gridViewBtn.classList.add('active');
        carouselViewBtn.classList.remove('active');
        if (carouselContainer) carouselContainer.style.display = 'none';
        if (grid) grid.style.display = 'grid';
        if (toggleAllBtn) toggleAllBtn.style.display = 'inline-flex';
      });
    }
  }

  // 2. Initialize Fallback Grid (for Grid View mode)
  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = '';
    const itemsToDisplay = showingAll ? spotlightItems : spotlightItems.filter(i => i.isCurated);

    itemsToDisplay.forEach((item, index) => {
      const card = document.createElement('div');
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
   5. Portfolio Page: Featured Video, 3D Curved Carousel, Filters & Tree
   -------------------------------------------------------------------------- */
let activeCategory = 'events'; // Default to first continuous category (All Work removed)
let activeSubcategory = 'all';
let searchQuery = '';
let visibleCount = 12;
const PAGE_SIZE = 12;
let portfolioCarousel = null;

function initPortfolio() {
  initFeaturedVideo();
  initCategoryFilters();
  initSearch();
  initPortfolioTree();
  initPortfolioCarousel();
  renderMasonry();
}

// 5.0 Initialize 3D Curved Carousel for Portfolio Showcase
function initPortfolioCarousel() {
  const pSceneEl = document.getElementById('portfolio3dScene');
  const pTrackEl = document.getElementById('portfolio3dTrack');
  if (!pSceneEl || !pTrackEl) return;

  portfolioCarousel = new Curved3DCarousel({
    scene: pSceneEl,
    track: pTrackEl,
    prevBtn: document.getElementById('portfolioPrevBtn'),
    nextBtn: document.getElementById('portfolioNextBtn'),
    currentEl: document.getElementById('portfolioCounterCurrent'),
    totalEl: document.getElementById('portfolioCounterTotal'),
    scrubTrack: document.getElementById('portfolioScrubTrack'),
    scrubFill: document.getElementById('portfolioScrubFill'),
    onCardRender: (item, index) => {
      const badgeLabel = item.subCategoryName || item.categoryName || 'PROJECT';
      const mediaThumb = item.thumb || item.image;
      const metaInfo = item.role || item.org || (item.tags && item.tags[0]) || 'Shishir’s Lab';
      const actionText = item.category === 'certificates' 
        ? 'VIEW CREDENTIAL' 
        : (item.category === 'systems' ? 'LAUNCH APP' : (item.category === 'events' ? 'VIEW EVENT' : 'OPEN CASE STUDY'));
      return `
        <div class="card-3d-media-box">
          <div class="card-3d-backdrop-blur" style="background-image: url('${mediaThumb}');"></div>
          <img class="card-3d-img" src="${mediaThumb}" alt="${item.title}" loading="lazy">
          <div class="card-3d-overlay">
            <div class="card-3d-top-row">
              <span class="card-3d-badge">[${String(index + 1).padStart(2, '0')}]</span>
              <span class="card-3d-category-badge">${badgeLabel}</span>
            </div>
            <div class="card-3d-bottom-info">
              <span class="card-3d-meta-sub">${metaInfo}</span>
              <h3 class="card-3d-title">${item.title}</h3>
              <div class="card-3d-action-pill">
                <span>${actionText}</span>
                <span>↗</span>
              </div>
            </div>
          </div>
        </div>
      `;
    },
    onCardClick: (item, index) => {
      openProjectModal(item);
    }
  });

  // View Mode Toggle for Portfolio (3D Curved Carousel vs Masonry Grid)
  const pCarouselViewBtn = document.getElementById('portfolioCarouselViewBtn');
  const pGridViewBtn = document.getElementById('portfolioGridViewBtn');
  const pCarouselContainer = document.getElementById('portfolioCarouselContainer');
  const pGridContainer = document.getElementById('masonryGrid');
  const pRevealControls = document.getElementById('masonryRevealControls');

  if (pCarouselViewBtn && pGridViewBtn) {
    pCarouselViewBtn.addEventListener('click', () => {
      pCarouselViewBtn.classList.add('active');
      pGridViewBtn.classList.remove('active');
      if (pCarouselContainer) pCarouselContainer.style.display = 'flex';
      if (pGridContainer) pGridContainer.style.display = 'none';
      if (pRevealControls) pRevealControls.style.display = 'none';
      if (portfolioCarousel) portfolioCarousel.update();
    });

    pGridViewBtn.addEventListener('click', () => {
      pGridViewBtn.classList.add('active');
      pCarouselViewBtn.classList.remove('active');
      if (pCarouselContainer) pCarouselContainer.style.display = 'none';
      if (pGridContainer) pGridContainer.style.display = 'block';
      if (pRevealControls) pRevealControls.style.display = 'flex';
    });
  }
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

// 5.2 Category Filter Tabs & Mobile Category Navigation
function initCategoryFilters() {
  const tabButtons = document.querySelectorAll('.category-tab-btn');
  const subcatBar = document.getElementById('designSubcategoriesBar');
  const subcatBtns = document.querySelectorAll('.subcat-btn');
  const mobileCatSelect = document.getElementById('mobileCategorySelect');
  const scrollLeftBtn = document.getElementById('catScrollLeftBtn');
  const scrollRightBtn = document.getElementById('catScrollRightBtn');
  const tabsScroll = document.getElementById('categoryTabsScroll');

  // Dynamically update tab counts & mobile dropdown counts
  if (window.SHISHIR_DATA && window.SHISHIR_DATA.projects) {
    const all = window.SHISHIR_DATA.projects;
    tabButtons.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      const countSpan = btn.querySelector('.tab-count');
      if (countSpan) {
        const count = all.filter(p => p.category === cat).length;
        countSpan.textContent = count;
      }
    });

    if (mobileCatSelect) {
      Array.from(mobileCatSelect.options).forEach(opt => {
        const cat = opt.value;
        const count = all.filter(p => p.category === cat).length;
        const baseLabel = opt.textContent.replace(/\s*\(\d+\)$/, '').trim();
        opt.textContent = `${baseLabel} (${count})`;
      });
    }
  }

  // Unified Category Selector Helper
  window.selectPortfolioCategory = function(categoryKey, shouldScrollTab = true) {
    activeCategory = categoryKey;
    visibleCount = PAGE_SIZE;

    // Update Tab Buttons
    tabButtons.forEach(btn => {
      const isTarget = btn.getAttribute('data-category') === categoryKey;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      if (isTarget && shouldScrollTab) {
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });

    // Sync Mobile Selector
    if (mobileCatSelect && mobileCatSelect.value !== categoryKey) {
      mobileCatSelect.value = categoryKey;
    }

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
  };

  // Tab Button Click Listeners
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      window.selectPortfolioCategory(cat, true);
    });
  });

  // Mobile Dropdown Change Listener
  if (mobileCatSelect) {
    mobileCatSelect.addEventListener('change', (e) => {
      window.selectPortfolioCategory(e.target.value, true);
    });
  }

  // Left / Right Scroll Buttons
  if (scrollLeftBtn && tabsScroll) {
    scrollLeftBtn.addEventListener('click', () => {
      tabsScroll.scrollBy({ left: -220, behavior: 'smooth' });
    });
  }

  if (scrollRightBtn && tabsScroll) {
    scrollRightBtn.addEventListener('click', () => {
      tabsScroll.scrollBy({ left: 220, behavior: 'smooth' });
    });
  }

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

      if (typeof window.selectPortfolioCategory === 'function') {
        window.selectPortfolioCategory(targetCat, true);
      }

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
    // Search query match: if searching, search across all projects seamlessly!
    if (searchQuery) {
      const matchTitle = item.title && item.title.toLowerCase().includes(searchQuery);
      const matchDesc = item.desc && item.desc.toLowerCase().includes(searchQuery);
      const matchOrg = item.org && item.org.toLowerCase().includes(searchQuery);
      const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery));
      return (matchTitle || matchDesc || matchOrg || matchTags);
    }

    // Category match
    if (activeCategory && item.category !== activeCategory) {
      return false;
    }

    // Subcategory match for Design Studio
    if (activeCategory === 'design' && activeSubcategory !== 'all') {
      if (item.subCategory !== activeSubcategory) return false;
    }

    return true;
  });

  // For Design Studio: ensure exact sequence (Social Media -> Raws -> Logos -> Custom Merch -> Banners)
  if (activeCategory === 'design' && activeSubcategory === 'all') {
    const designTrackOrder = { 'social': 1, 'raws': 2, 'brand': 3, 'merch': 4, 'posters': 5 };
    filtered.sort((a, b) => {
      const orderA = designTrackOrder[a.subCategory] || 99;
      const orderB = designTrackOrder[b.subCategory] || 99;
      return orderA - orderB;
    });
  }

  if (counterText) {
    if (searchQuery) {
      counterText.textContent = `${filtered.length} items found for "${searchQuery}"`;
    } else {
      counterText.textContent = `${filtered.length} items in category`;
    }
  }

  // Sync 3D Curved Carousel Display
  if (portfolioCarousel) {
    portfolioCarousel.setItems(filtered, 0);
  }
  const itemsCounter = document.getElementById('portfolioItemsCounter');
  if (itemsCounter) {
    if (searchQuery) {
      itemsCounter.textContent = `${filtered.length} items found for "${searchQuery}"`;
    } else {
      itemsCounter.textContent = `Showing ${filtered.length} items in category`;
    }
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
    const directLiveBtn = item.link 
      ? `<a href="${item.link}" target="_blank" rel="noopener noreferrer" class="card-direct-live-pill mono" title="Open live URL: ${item.link}" onclick="event.stopPropagation()">
           <span>LIVE ↗</span>
         </a>`
      : '';

    card.innerHTML = `
      <div class="card-media-box">
        <img class="card-media-img" src="${mediaThumb}" alt="${item.title}" loading="lazy">
        <span class="card-media-badge">${badgeLabel}</span>
      </div>
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        <div class="card-meta-row">
          <span class="card-tag">${item.role || item.org || item.tags?.[0] || 'Shishir’s Lab'}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            ${directLiveBtn}
            <span class="card-open-hint mono">VIEW ↗</span>
          </div>
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
    if (item.link) {
      const linkLabel = item.link.includes('facebook') ? 'Official Facebook Post' : 'Live Platform URL';
      metaHTML += `
        <div class="modal-meta-item" style="grid-column: 1 / -1;">
          <strong>${linkLabel}</strong>
          <span><a href="${item.link}" target="_blank" rel="noopener noreferrer" style="color: var(--lime); font-weight: 600; text-decoration: underline; word-break: break-all;">${item.link} ↗</a></span>
        </div>
      `;
    }
    metaGrid.innerHTML = metaHTML;
  }

  // Description & Bullets
  if (descEl) {
    if (item.bullets && Array.isArray(item.bullets) && item.bullets.length > 0) {
      let html = '';
      if (item.desc) {
        html += `<p style="margin-bottom: 14px; line-height: 1.6; color: var(--text-primary); font-size: 0.98rem;">${item.desc}</p>`;
      }
      html += `<div class="modal-bullets-box" style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 16px 20px; margin-top: 8px;">`;
      html += `<div class="mono" style="font-size: 0.75rem; color: var(--lime); font-weight: 700; margin-bottom: 10px; letter-spacing: 0.06em;">DOCUMENTED HIGHLIGHTS &amp; RESPONSIBILITIES:</div>`;
      html += `<ul style="margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">`;
      item.bullets.forEach(b => {
        html += `<li style="color: var(--text-secondary); line-height: 1.55; font-size: 0.94rem;">${b}</li>`;
      });
      html += `</ul></div>`;
      descEl.innerHTML = html;
    } else {
      descEl.textContent = item.desc || '';
    }
  }

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
      const defaultLabel = item.category === 'systems' 
        ? 'Launch Live Application' 
        : (item.link.includes('facebook') ? 'View Official Event Post' : 'Visit Live Project');
      a.innerHTML = `${item.linkLabel || defaultLabel} ↗`;
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

