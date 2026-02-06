// Fixed bundle.js - CSP compliant (no inline styles)

// ============================
// 1. COOKIE BANNER
// ============================
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');

    if (!banner || !acceptBtn) return;

    const cookieAccepted = localStorage.getItem('cookieAccepted');
    if (!cookieAccepted) {
        setTimeout(() => {
            banner.classList.remove('cookie-banner--hidden');
            banner.setAttribute('aria-hidden', 'false');
        }, 1000);
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieAccepted', 'true');
        banner.classList.add('cookie-banner--hidden');
        banner.setAttribute('aria-hidden', 'true');
    });
}

// ============================
// 2. NAVBAR BURGER MENU
// ============================
function initBurgerMenu() {
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');

    if (!burger || !navLinks) return;

    burger.addEventListener('click', () => {
        const isExpanded = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#navbar')) {
            burger.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('active');
        }
    });
}

// ============================
// 3. FLOATING NAVBAR ON SCROLL
// ============================
function initFloatingNav() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('floating');
        } else {
            navbar.classList.remove('floating');
        }

        if (currentScroll > lastScroll && currentScroll > 150) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }

        lastScroll = currentScroll;
    });
}

// ============================
// 4. TAGS (FILTER) FUNCTIONALITY
// ============================
function initTags() {
    const tags = document.querySelectorAll('.tag');

    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
        });
    });
}

// ============================
// 5. LISTING CARDS CLICK -> MODAL
// ============================
function initListingCards() {
    const modal = document.getElementById('listing-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal__close');
    const overlay = modal.querySelector('.modal__overlay');
    const cards = document.querySelectorAll('.listing-card');

    function openModal(data) {
        modal.querySelector('.modal__title').textContent = data.title || '';
        modal.querySelector('.modal__address').textContent = data.address || '';
        modal.querySelector('.modal__price').textContent = data.price || '';
        modal.querySelector('.modal__rooms').textContent = data.rooms || '';
        modal.querySelector('.modal__area').textContent = data.area || '';
        modal.querySelector('.modal__floor').textContent = data.floor || '';
        modal.querySelector('.modal__description').textContent = data.description || '';

        const img = modal.querySelector('.modal__image');
        img.src = data.image || '';
        img.alt = data.title || '';

        modal.classList.add('modal--open');
        document.body.classList.add('no-scroll');
    }

    function closeModal() {
        modal.classList.remove('modal--open');
        document.body.classList.remove('no-scroll');
    }

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const data = {
                title: card.querySelector('.listing-card__title')?.textContent || '',
                address: card.querySelector('.listing-card__location')?.textContent || '',
                price: card.querySelector('.listing-card__price')?.textContent || '',
                rooms: card.querySelector('.listing-card__rooms')?.textContent || '',
                area: card.querySelector('.listing-card__area')?.textContent || '',
                floor: card.querySelector('.listing-card__floor')?.textContent || '',
                description: card.dataset.description || 'Опис відсутній.',
                image: card.querySelector('.listing-card__image')?.src || ''
            };
            openModal(data);
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('modal--open')) {
            closeModal();
        }
    });

    modal.querySelectorAll('img').forEach(img => {
        img.classList.add('zoomable');
    });
}

// ============================
// 6. LIGHTBOX FOR IMAGES
// ============================
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.lightbox__img');
    const closeBtn = lightbox.querySelector('.lightbox__close');

    document.querySelectorAll('.zoomable').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            lightboxImg.src = img.src;
            lightbox.classList.add('lightbox--open');
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('lightbox--open');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('lightbox--open')) {
            closeLightbox();
        }
    });
}

// ============================
// 7. SEARCH FORM LISTINGS
// ============================
function initSearch() {
    const searchForm = document.querySelector('.search-form');
    if (!searchForm) return;

    const searchInput = searchForm.querySelector('.search-form__input');
    const searchBtn = searchForm.querySelector('.search-form__btn');
    const cards = document.querySelectorAll('.listing-card');

    let noResults = document.getElementById('no-results');
    if (!noResults && cards.length > 0) {
        const grid = cards[0].parentElement;
        noResults = document.createElement('div');
        noResults.id = 'no-results';
        noResults.className = 'd-none text-center w-100 p-20';
        noResults.innerHTML = '<p>Нічого не знайдено. Спробуйте змінити запит.</p>';
        grid.appendChild(noResults);
    }

    let resetBlock = document.getElementById('reset-search');
    if (!resetBlock && searchForm.parentElement) {
        resetBlock = document.createElement('div');
        resetBlock.id = 'reset-search';
        resetBlock.className = 'd-none text-center mt-20';
        resetBlock.innerHTML = '<button class="btn btn--outline">Скинути фільтр</button>';
        searchForm.parentElement.appendChild(resetBlock);

        const resetBtn = resetBlock.querySelector('button');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                searchInput.value = '';
                performSearch();
            });
        }
    }

    function performSearch() {
        const term = searchInput.value.toLowerCase().trim();
        const activeTag = document.querySelector('.tag.active');
        const activeCategory = activeTag ? activeTag.getAttribute('data-category') : 'all';

        noResults?.classList.add('d-none');
        resetBlock?.classList.add('d-none');

        let hasResults = false;

        cards.forEach(card => {
            const title = card.querySelector('.listing-card__title')?.textContent.toLowerCase() || '';
            const address = card.querySelector('.listing-card__location')?.textContent.toLowerCase() || '';
            const price = card.querySelector('.listing-card__price')?.textContent.toLowerCase() || '';
            const category = card.getAttribute('data-category') || 'all';

            const matchesSearch = title.includes(term) || address.includes(term) || price.includes(term);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;

            if (matchesSearch && matchesCategory) {
                card.classList.remove('d-none');
                hasResults = true;
            } else {
                card.classList.add('d-none');
            }
        });

        if (noResults) {
            if (hasResults) {
                noResults.classList.add('d-none');
            } else {
                noResults.classList.remove('d-none');
            }
        }

        const isSearching = term !== '';
        if (resetBlock) {
            if (isSearching) {
                resetBlock.classList.remove('d-none');
            } else {
                resetBlock.classList.add('d-none');
            }
        }
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }
}

// ============================
// 8. BLOG SEARCH (BLOG PAGE)
// ============================
function initBlogSearch() {
    const searchInput = document.getElementById('blogSearchInput');
    if (!searchInput) return;

    const categoryBtns = document.querySelectorAll('.tag');
    const blogCards = document.querySelectorAll('.blog-card');
    const blogGrid = document.querySelector('.blog-grid');

    let noResultsMsg = document.getElementById('blog-no-results');
    if (!noResultsMsg && blogGrid) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'blog-no-results';
        noResultsMsg.className = 'd-none text-center w-100 p-20';
        noResultsMsg.innerHTML = '<p>Нічого не знайдено</p>';
        blogGrid.appendChild(noResultsMsg);
    }

    function filter() {
        const term = searchInput.value.toLowerCase().trim();
        const activeBtn = document.querySelector('.tag.active');
        const activeCat = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
        let count = 0;

        blogCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const text = card.querySelector('p')?.textContent.toLowerCase() || '';
            const cardCat = card.getAttribute('data-category') || '';

            const matchTerm = title.includes(term) || text.includes(term);
            const matchCat = activeCat === 'all' || cardCat === activeCat;

            if (matchTerm && matchCat) {
                card.classList.remove('d-none');
                count++;
            } else {
                card.classList.add('d-none');
            }
        });

        if (noResultsMsg) {
            if (count === 0) {
                noResultsMsg.classList.remove('d-none');
            } else {
                noResultsMsg.classList.add('d-none');
            }
        }
    }

    searchInput.addEventListener('input', filter);

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filter();
        });
    });
}

// ============================
// 9. SCROLL ANIMATIONS
// ============================
function initScrollAnimations() {
    const elements = document.querySelectorAll('.listing-card, .blog-card, .fade-in-up');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

// ============================
// 10. CONTACT FORM
// ============================
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Надсилання...';
        submitBtn.classList.add('loading');

        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 1500));

        submitBtn.textContent = '✓ Відправлено';
        submitBtn.classList.remove('loading');

        setTimeout(() => {
            form.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 3000);
    });
}

// ============================
// INIT ALL
// ============================
document.addEventListener('DOMContentLoaded', () => {
    initCookieBanner();
    initBurgerMenu();
    initFloatingNav();
    initTags();
    initListingCards();
    initLightbox();
    initSearch();
    initBlogSearch();
    initScrollAnimations();
    initContactForm();
});
