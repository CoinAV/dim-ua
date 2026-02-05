(function () {
    /**
     * Navigation Logic
     */
    function initNavigation() {
        const burger = document.querySelector('.burger');
        const navLinks = document.querySelector('.nav-links');

        // Active State Logic (Robust for file:// and server)
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'index.html';
        const menuItems = document.querySelectorAll('.nav-links a');

        menuItems.forEach(item => {
            item.classList.remove('active');
            let href = item.getAttribute('href');

            // Normalize href for homepage check
            if (href === '/') href = 'index.html';

            // 1. Exact match with filename
            if (href === currentFile) {
                item.classList.add('active');
            }
            // 2. Fallback: browser resolved absolute match
            else if (item.href === window.location.href) {
                item.classList.add('active');
            }
            // 3. Special case: if we are on root / and item is /
            else if ((currentFile === '' || currentFile === 'index.html') && (href === 'index.html' || href === '/')) {
                item.classList.add('active');
            }
        });

        if (!burger || !navLinks) return;

        const closeMenu = () => {
            navLinks.classList.remove('active');
            burger.setAttribute('aria-expanded', 'false');
        };

        burger.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            burger.setAttribute('aria-expanded', String(isExpanded));
        });

        document.addEventListener('click', (e) => {
            if (!navLinks.classList.contains('active')) return;
            if (!navLinks.contains(e.target) && !burger.contains(e.target)) closeMenu();
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => closeMenu());
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) closeMenu();
        });
    }

    /**
     * Gallery Logic
     */
    let currentImg = 0;

    function showImg(n) {
        const imgs = document.querySelectorAll('.gallery-container img');
        if (!imgs || imgs.length === 0) return;

        if (imgs[currentImg]) imgs[currentImg].classList.remove('active');
        currentImg = (n + imgs.length) % imgs.length;
        if (imgs[currentImg]) imgs[currentImg].classList.add('active');
    }

    function initGalleryNavigation() {
        const prevBtns = document.querySelectorAll('.nav-arrow.left');
        const nextBtns = document.querySelectorAll('.nav-arrow.right');

        const nextImage = () => showImg(currentImg + 1);
        const prevImage = () => showImg(currentImg - 1);

        nextBtns.forEach(btn => btn.addEventListener('click', (e) => {
            e.preventDefault();
            nextImage();
        }));

        prevBtns.forEach(btn => btn.addEventListener('click', (e) => {
            e.preventDefault();
            prevImage();
        }));

        window.galleryNext = nextImage;
        window.galleryPrev = prevImage;
    }

    function initGallery() {
        const galleryContainer = document.querySelector('.gallery-container');
        if (!galleryContainer) return;

        if (!galleryContainer.hasAttribute('tabindex')) {
            galleryContainer.setAttribute('tabindex', '0');
        }

        const imgs = document.querySelectorAll('.gallery-container img');
        if (imgs.length > 0) {
            const hasActive = Array.from(imgs).some(img => img.classList.contains('active'));
            if (!hasActive) imgs[0].classList.add('active');
            currentImg = Math.max(0, Array.from(imgs).findIndex(img => img.classList.contains('active')));
        }

        let touchStartX = 0;
        galleryContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        galleryContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) showImg(currentImg + 1);
            if (touchEndX > touchStartX + 50) showImg(currentImg - 1);
        }, { passive: true });

        galleryContainer.addEventListener('keydown', (e) => {
            const modal = document.getElementById('imageModal');
            if (modal && modal.style.display === 'block') return;
            if (e.key === 'ArrowLeft') { e.preventDefault(); showImg(currentImg - 1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); showImg(currentImg + 1); }
        });
    }

    function initModalGallery() {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        const modalCaption = document.getElementById('modalCaption');
        const closeBtn = document.querySelector('.close-modal');

        if (!modal || !modalImg || !closeBtn) return;

        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-hidden', 'true');

        const galleryImages = document.querySelectorAll('.gallery-container img');
        if (!galleryImages || galleryImages.length === 0) return;

        let currentIndex = 0;
        let lastFocusedEl = null;

        const updateModalImage = () => {
            if (currentIndex >= galleryImages.length) currentIndex = 0;
            if (currentIndex < 0) currentIndex = galleryImages.length - 1;

            modalImg.src = galleryImages[currentIndex].src;
            const text = galleryImages[currentIndex].alt || 'Фото об’єкта';
            modalImg.alt = text;
            if (modalCaption) modalCaption.textContent = text;

            showImg(currentIndex); // Sync with background gallery
        };

        const openModal = (index) => {
            lastFocusedEl = document.activeElement;
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            currentIndex = index;
            showImg(currentIndex);
            updateModalImage();
            closeBtn.focus?.();
        };

        const closeModal = () => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto';
            if (lastFocusedEl) lastFocusedEl.focus();
        };

        const changeModalSlide = (n) => {
            currentIndex += n;
            updateModalImage();
        };

        galleryImages.forEach((img, index) => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => openModal(index));
            if (!img.hasAttribute('tabindex')) img.setAttribute('tabindex', '0');
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(index);
                }
            });
        });

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        const prevBtn = modal.querySelector('.modal-prev');
        const nextBtn = modal.querySelector('.modal-next');
        if (prevBtn) prevBtn.addEventListener('click', () => changeModalSlide(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => changeModalSlide(1));

        let touchStartX = 0;
        modal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        modal.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) changeModalSlide(1);
            if (touchEndX > touchStartX + 50) changeModalSlide(-1);
        }, { passive: true });

        document.addEventListener('keydown', (e) => {
            if (modal.style.display !== 'block') return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') changeModalSlide(-1);
            if (e.key === 'ArrowRight') changeModalSlide(1);
        });
    }

    /**
     * Search Logic
     */
    function initRealEstateSearch() {
        const searchBtn = document.getElementById('btnRealEstateSearch');
        const resetBlock = document.getElementById('search-reset-block');
        const noResults = document.getElementById('no-results');

        // Ensure hidden on load
        if (noResults) noResults.style.display = 'none';
        if (resetBlock) resetBlock.style.display = 'none';

        if (!searchBtn) return;

        searchBtn.addEventListener('click', () => {
            const searchRooms = document.getElementById('searchRooms')?.value;
            const searchPrice = document.getElementById('searchPrice')?.value;
            const cards = document.querySelectorAll('.card'); // Updated selector
            let hasResults = false;
            const isSearching = (searchRooms !== '' && searchRooms !== undefined) || (searchPrice !== '' && searchPrice !== undefined);

            cards.forEach(card => {
                const rooms = card.getAttribute('data-rooms');
                const price = parseFloat(card.getAttribute('data-price'));
                const isSold = card.classList.contains('sold');
                let match = true;

                if (searchRooms && rooms != searchRooms) match = false;
                if (searchPrice && price > Number(searchPrice)) match = false;
                if (isSearching && isSold) match = false;

                if (match) {
                    card.classList.remove('hidden');
                    card.classList.add('visible');
                    card.style.display = 'flex';
                    hasResults = true;
                } else {
                    card.classList.remove('visible');
                    card.classList.add('hidden');
                    card.style.display = 'none';
                }
            });

            const noResults = document.getElementById('no-results');
            if (noResults) noResults.style.display = hasResults ? 'none' : 'block';
            if (resetBlock) resetBlock.style.display = isSearching ? 'block' : 'none';

            if (isSearching) {
                document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    function initSearchReset() {
        const resetBtn = document.querySelector('#search-reset-block button');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                const r = document.getElementById('searchRooms');
                const p = document.getElementById('searchPrice');
                if (r) r.value = '';
                if (p) p.value = '';
                document.getElementById('btnRealEstateSearch')?.click();
            });
        }
    }

    function initBlogSearch() {
        const searchInput = document.getElementById('blogSearchInput');
        if (!searchInput) return;

        const categoryBtns = document.querySelectorAll('.tag'); // Check class
        const blogCards = document.querySelectorAll('.blog-card'); // Check class
        const blogGrid = document.querySelector('.blog-grid');

        let noResultsMsg = document.getElementById('blog-no-results');
        if (!noResultsMsg && blogGrid) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'blog-no-results';
            noResultsMsg.innerHTML = '<p style="text-align:center;width:100%;padding:40px;">Нічого не знайдено</p>';
            noResultsMsg.style.display = 'none';
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
                const cat = card.getAttribute('data-category') || 'all';

                const matchS = title.includes(term) || text.includes(term);
                const matchC = activeCat === 'all' || cat === activeCat;

                if (matchS && matchC) {
                    card.style.display = 'block';
                    count++;
                } else {
                    card.style.display = 'none';
                }
            });
            if (noResultsMsg) noResultsMsg.style.display = count === 0 ? 'block' : 'none';
        }

        searchInput.addEventListener('input', filter);
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                filter();
            });
        });
    }

    /**
     * Utils
     */
    function initCookieConsent() {
        const banner = document.getElementById('cookie-banner');
        if (!banner) return;
        if (!localStorage.getItem('cookieConsent')) {
            setTimeout(() => {
                banner.classList.add('show');
                banner.setAttribute('aria-hidden', 'false');
            }, 1000);
        }
        document.getElementById('accept-cookies')?.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'true');
            banner.classList.remove('show');
            banner.setAttribute('aria-hidden', 'true');
        });
    }

    function initRevealAnimations() {
        const cards = document.querySelectorAll('.card, .blog-card, .contact-card, .review-item');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.style.opacity = 1;
                    e.target.style.transform = 'translateY(0)';
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.1 });
        cards.forEach(c => observer.observe(c));
    }

    function initPhoneButtons() {
        const btns = document.querySelectorAll('a[href^="tel:"], .mf-call, #btn-call-desktop');
        btns.forEach(btn => {
            if (!btn.dataset.originalText) btn.dataset.originalText = btn.innerText;
            btn.addEventListener('click', (e) => {
                if (btn.dataset.revealed !== 'true') {
                    e.preventDefault();
                    btn.dataset.revealed = 'true';
                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> (063) 388-98-56';
                    btn.href = 'tel:+380633889856';
                    btn.style.backgroundColor = '#1A1A1A';
                }
            });
        });
    }

    function initImageErrorHandling() {
        document.addEventListener('error', e => {
            if (e.target.tagName.toLowerCase() === 'img' && !e.target.src.includes('placehold.co')) {
                e.target.src = 'https://placehold.co/600x400?text=No+Image';
            }
        }, true);
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        initNavigation();
        initImageErrorHandling();
        initGallery();
        initGalleryNavigation();
        initModalGallery();
        initRealEstateSearch();
        initSearchReset();
        initBlogSearch();
        initRevealAnimations();
        initPhoneButtons();
        initCookieConsent();
        console.log('Bundle loaded.');
    });

})();

