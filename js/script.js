/* ==========================================================================
   ОСНОВНИЙ СКРИПТ 21000.ONLINE
   Включає: Меню, Галерею, Модальне фото, Пошук, Анімації, Контакти
   ========================================================================== */


/* --- ЛОГІКА ГАЛЕРЕЇ (Глобальні функції для onclick в HTML) --- */
let currentImg = 0;

function showImg(n) {
    const imgs = document.querySelectorAll('.gallery-container img');
    if (!imgs || imgs.length === 0) return;

    if (imgs[currentImg]) imgs[currentImg].classList.remove('active');

    currentImg = (n + imgs.length) % imgs.length;

    if (imgs[currentImg]) imgs[currentImg].classList.add('active');
}

/* --------------------------------------------------------------------------
   8. NEW: SETUP GALLERY NAVIGATION (Replaces onclick)
   -------------------------------------------------------------------------- */
function initGalleryNavigation() {
    const prevBtns = document.querySelectorAll('.nav-arrow.left');
    const nextBtns = document.querySelectorAll('.nav-arrow.right');

    const nextImage = () => showImg(currentImg + 1);
    const prevImage = () => showImg(currentImg - 1);

    // Attach to all buttons found (in case multiple galleries exist or just robustness)
    nextBtns.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        nextImage();
    }));

    prevBtns.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        prevImage();
    }));

    // Expose for Modal usage if needed, or keep internal
    window.galleryNext = nextImage;
    window.galleryPrev = prevImage;
}


/* ==========================================================================
   ІНІЦІАЛІЗАЦІЯ ПІСЛЯ ЗАВАНТАЖЕННЯ DOM
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initGallery();
    initModalGallery();
    initRevealAnimations();
    initPhoneButtons();

    initBlogSearch();       // Пошук для Блогу
    initRealEstateSearch(); // Пошук для Головної (Нерухомість)
    initCookieConsent();
});

/* --------------------------------------------------------------------------
   ЛОГІКА ПОШУКУ НЕРУХОМОСТІ (Для Index.html)
   -------------------------------------------------------------------------- */
function initRealEstateSearch() {
    const searchBtn = document.getElementById('btnRealEstateSearch');
    const resetBtn = document.querySelector('#search-reset-block button'); // Кнопка скидання

    // Якщо кнопки пошуку немає на сторінці (наприклад, ми в блозі), виходимо
    if (!searchBtn) return;

    const performSearch = () => {
        const searchRoomsEl = document.getElementById('searchRooms');
        const searchPriceEl = document.getElementById('searchPrice');

        const searchRooms = searchRoomsEl ? searchRoomsEl.value : '';
        const searchPrice = searchPriceEl ? searchPriceEl.value : '';

        const cards = document.querySelectorAll('.service-card');
        const resetBlock = document.getElementById('search-reset-block');
        let hasResults = false;

        const isSearching = searchRooms !== '' || searchPrice !== '';

        cards.forEach(card => {
            const rooms = card.getAttribute('data-rooms');
            const price = parseFloat(card.getAttribute('data-price'));
            const isSold = card.classList.contains('sold');

            let matchRooms = true;
            let matchPrice = true;

            if (searchRooms && rooms != searchRooms) matchRooms = false;
            if (searchPrice && Number.isFinite(price) && price > Number(searchPrice)) matchPrice = false;

            // Ховаємо продані об'єкти, якщо йде активний пошук
            if (isSearching && isSold) {
                matchRooms = false;
                matchPrice = false;
            }

            if (matchRooms && matchPrice) {
                card.classList.remove('hidden');
                card.classList.add('visible');
                // Анімація появи
                card.style.display = 'block';
                hasResults = true;
            } else {
                card.classList.remove('visible');
                card.classList.add('hidden');
                card.style.display = 'none'; // Повне приховування
            }
        });

        // Блок "Нічого не знайдено"
        const noResults = document.getElementById('no-results');
        if (noResults) noResults.style.display = hasResults ? 'none' : 'block';

        // Блок скидання пошуку
        if (resetBlock) resetBlock.style.display = isSearching ? 'block' : 'none';

        // Прокрутка до результатів
        if (isSearching) {
            const listingsSection = document.getElementById('listings');
            if (listingsSection) listingsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Слухач на кнопку пошуку
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
}

/* --------------------------------------------------------------------------
   9. NEW: SEARCH RESET LOGIC (Replaces onclick)
   -------------------------------------------------------------------------- */
function initSearchReset() {
    // There might be multiple reset buttons or just one global one?
    // The HTML used: <button onclick="resetSearch()">
    // We can assume we might add an ID or class to it, OR select by onclick attribute if we were lazy, but let's do it properly.
    // We'll target the known button in #search-reset-block (for index) AND maybe others.

    // For now, let's look for any button with class 'reset-search-btn' OR specific ID.
    // In index.html it was: <button onclick="resetSearch()" ...>
    // We will add id="btnResetSearch" or class="btn-reset-search" in HTML.

    // Fallback: try to find the one in the specific block
    const resetBtn = document.querySelector('#search-reset-block button');

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            const roomsInput = document.getElementById('searchRooms');
            const priceInput = document.getElementById('searchPrice');

            if (roomsInput) roomsInput.value = '';
            if (priceInput) priceInput.value = '';

            // We need to trigger the search again. 
            // Since initRealEstateSearch scope is closed, we can simulate click on search button 
            // OR refactor performSearch to be global.
            // Simulating click is easier for now:
            const searchBtn = document.getElementById('btnRealEstateSearch');
            if (searchBtn) searchBtn.click();
        });
    }
}

/* --------------------------------------------------------------------------
   10. NEW: IMAGE ERROR HANDLING (Replaces onerror)
   -------------------------------------------------------------------------- */
function initImageErrorHandling() {
    // Global capture of error events on images
    // Note: 'error' event does not bubble, so we must use capture phase.
    document.addEventListener('error', function (e) {
        if (e.target.tagName.toLowerCase() === 'img') {
            // Check if already replaced to avoid infinite loop
            if (!e.target.src.includes('placehold.co')) {
                e.target.src = 'https://placehold.co/600x400?text=No+Image';
                e.target.alt = 'Image not found'; // Optional: update alt text
            }
        }
    }, true); // useCapture = true
}


/* --------------------------------------------------------------------------
   1. НАВІГАЦІЯ (Меню + Активне посилання + ESC)
   -------------------------------------------------------------------------- */
function initNavigation() {
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');

    // Активний пункт меню (клас .active)
    const currentLocation = window.location.pathname;
    const menuItems = document.querySelectorAll('.nav-links a');

    menuItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (
            href === currentLocation ||
            (currentLocation === '/' && href === '/') ||
            item.href === window.location.href
        ) {
            item.classList.add('active');
        }
    });

    if (!burger || !navLinks) return;

    const closeMenu = () => {
        navLinks.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
    };

    // Клік по бургеру
    burger.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        const isExpanded = navLinks.classList.contains('active');
        burger.setAttribute('aria-expanded', String(isExpanded));
    });

    // Закриття при кліку поза межами
    document.addEventListener('click', (e) => {
        if (!navLinks.classList.contains('active')) return;
        if (!navLinks.contains(e.target) && !burger.contains(e.target)) closeMenu();
    });

    // Закриття при кліку на посилання
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => closeMenu());
    });

    // Закриття клавішею Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) closeMenu();
    });
}

/* --------------------------------------------------------------------------
   2. ГАЛЕРЕЯ (Swipe + Keyboard, тільки коли є на сторінці)
   -------------------------------------------------------------------------- */
function initGallery() {
    const galleryContainer = document.querySelector('.gallery-container');
    if (!galleryContainer) return;

    // Робимо контейнер фокусованим для клавіатурної навігації
    if (!galleryContainer.hasAttribute('tabindex')) {
        galleryContainer.setAttribute('tabindex', '0');
    }

    // Ініціалізація: гарантуємо, що є активна картинка
    const imgs = document.querySelectorAll('.gallery-container img');
    if (imgs.length > 0) {
        const hasActive = Array.from(imgs).some(img => img.classList.contains('active'));
        if (!hasActive) imgs[0].classList.add('active');
        currentImg = Math.max(0, Array.from(imgs).findIndex(img => img.classList.contains('active')));
        if (currentImg < 0) currentImg = 0;
    }

    // Swipe
    let touchStartX = 0;
    let touchEndX = 0;

    galleryContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    galleryContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) window.nextImage();
        if (touchEndX > touchStartX + swipeThreshold) window.prevImage();
    }, { passive: true });

    // Keyboard навігація — тільки коли фокус в межах галереї
    galleryContainer.addEventListener('keydown', (e) => {
        // Не перехоплюємо стрілки, якщо відкрито модалку
        const modal = document.getElementById('imageModal');
        const isModalOpen = modal && modal.style.display === 'block';
        if (isModalOpen) return;

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            window.prevImage();
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            window.nextImage();
        }
    });
}

/* --------------------------------------------------------------------------
   3. МОДАЛЬНЕ ВІКНО ФОТО (Lightbox)
   - Синхронізується з галереєю: при перемиканні в модалці змінює active у галереї.
   -------------------------------------------------------------------------- */
function initModalGallery() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption'); // <--- 1. ДОДАНО: Знаходимо елемент підпису
    const closeBtn = document.querySelector('.close-modal');

    if (!modal || !modalImg || !closeBtn) return;

    // Accessibility
    modal.setAttribute('role', modal.getAttribute('role') || 'dialog');
    modal.setAttribute('aria-modal', modal.getAttribute('aria-modal') || 'true');
    modal.setAttribute('aria-hidden', modal.getAttribute('aria-hidden') || 'true');

    const galleryImages = document.querySelectorAll('.gallery-container img');
    if (!galleryImages || galleryImages.length === 0) return;

    let currentIndex = 0;
    let lastFocusedEl = null;

    const openModal = (index) => {
        lastFocusedEl = document.activeElement;
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        currentIndex = index;
        syncToGalleryIndex(currentIndex);
        updateModalImage();
        closeBtn.focus?.();
    };

    const closeModal = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
        if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
            lastFocusedEl.focus();
        }
    };

    const updateModalImage = () => {
        const total = galleryImages.length;
        if (total === 0) return;

        if (currentIndex >= total) currentIndex = 0;
        if (currentIndex < 0) currentIndex = total - 1;

        modalImg.src = galleryImages[currentIndex].src;

        // <--- 2. ДОДАНО: Логіка для тексту підпису
        const text = galleryImages[currentIndex].alt || 'Фото об’єкта';
        modalImg.alt = text;
        if (modalCaption) {
            modalCaption.textContent = text;
        }
        // ----------------------------------------

        syncToGalleryIndex(currentIndex);
    };

    const syncToGalleryIndex = (index) => {
        showImg(index);
    };

    // Events
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

    window.changeModalSlide = function (n) {
        currentIndex += n;
        updateModalImage();
    };

    // Кнопки навігації (доступні для клавіатури)
    const prevBtn = modal.querySelector('.modal-prev');
    const nextBtn = modal.querySelector('.modal-next');
    if (prevBtn) prevBtn.addEventListener('click', () => window.changeModalSlide(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => window.changeModalSlide(1));

    // Swipe inside modal
    let touchStartX = 0;
    let touchEndX = 0;
    modal.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    modal.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) window.changeModalSlide(1);
        if (touchEndX > touchStartX + threshold) window.changeModalSlide(-1);
    }, { passive: true });

    // Keyboard inside modal
    document.addEventListener('keydown', function (e) {
        const isOpen = modal.style.display === 'block';
        if (!isOpen) return;

        // Trap focus всередині модалки
        if (e.key === 'Tab') {
            const focusable = Array.from(modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);

            if (focusable.length > 0) {
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                    return;
                }
                if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                    return;
                }
            }
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            window.changeModalSlide(-1);
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            window.changeModalSlide(1);
        }
    });
}

/* --------------------------------------------------------------------------
   4. АНІМАЦІЯ ПОЯВИ (Intersection Observer)
   -------------------------------------------------------------------------- */
function initRevealAnimations() {
    const cards = document.querySelectorAll('.service-card');
    if (cards.length === 0) return;

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    cards.forEach(card => observer.observe(card));
}

/* --------------------------------------------------------------------------
   5. КНОПКИ ТЕЛЕФОНУ (Показ номера на Desktop)
   -------------------------------------------------------------------------- */
function initPhoneButtons() {
    // CTA: 1-й клік показує номер, 2-й клік — дзвінок (tel:)
    const decodePhone = (encoded) => { try { return atob(encoded); } catch (e) { return ""; } };
    const phoneDisplay = "(063) 388-98-56";
    const phoneTel = decodePhone("KzM4MDYzMzg4OTg1Ng==");

    const desktopCallBtn = document.getElementById('btn-call-desktop');
    const mobileCallBtn = document.querySelector('.mf-call');
    const orderCallBtn = document.getElementById('btn-order-call');

    const callButtons = [desktopCallBtn, mobileCallBtn, orderCallBtn].filter(Boolean);

    callButtons.forEach((btn) => {
        // Якщо в HTML вже заданий tel: — беремо його як джерело правди
        const href = btn.getAttribute('href') || "";
        const telFromHref = href.startsWith("tel:") ? href.replace("tel:", "").trim() : "";
        const tel = (btn.dataset.phoneTel || telFromHref || phoneTel).trim();

        // Важливо: href залишаємо tel:, але блокуємо 1-й клік через preventDefault()
        if (!href.startsWith("tel:") && tel) {
            btn.setAttribute("href", "tel:" + tel);
        }

        btn.dataset.revealed = btn.dataset.revealed || "0";
        btn.dataset.phoneDisplay = btn.dataset.phoneDisplay || phoneDisplay;
        btn.dataset.phoneTel = tel;

        btn.addEventListener("click", (e) => {
            const revealed = btn.dataset.revealed === "1";
            if (!revealed) {
                e.preventDefault(); // 1-й клік — не дзвонимо
                btn.dataset.revealed = "1";

                const display = btn.dataset.phoneDisplay || phoneDisplay;
                btn.innerHTML = "<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> " + display;
                btn.title = "Натисніть ще раз, щоб подзвонити";
                btn.style.backgroundColor = "#1A1A1A";
            }
            // 2-й клік — дозволяємо стандартну дію (дзвінок)
        }, { passive: false });
    });
}



/* --------------------------------------------------------------------------
   6. ПОШУК ТА ФІЛЬТРАЦІЯ БЛОГУ (Тільки для blog.html)
   -------------------------------------------------------------------------- */
function initBlogSearch() {
    // Перевіряємо, чи ми на сторінці блогу (чи є інпут пошуку)
    const searchInput = document.getElementById('blogSearchInput');
    if (!searchInput) return; // Якщо інпуту немає, зупиняємо функцію (щоб не було помилок на інших сторінках)

    const categoryBtns = document.querySelectorAll('.category-tag');
    const blogCards = document.querySelectorAll('.blog-card');
    const blogGrid = document.querySelector('.blog-grid');

    // Створення повідомлення "Нічого не знайдено", якщо його ще немає
    let noResultsMsg = document.getElementById('blog-no-results');
    if (!noResultsMsg && blogGrid) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'blog-no-results'; // ID для уникнення дублювання
        noResultsMsg.innerHTML = '<p style="text-align:center; width:100%; padding: 40px; color: #666; font-size: 1.1rem;">За вашим запитом нічого не знайдено 😔</p>';
        noResultsMsg.style.display = 'none';
        blogGrid.appendChild(noResultsMsg);
    }

    function filterContent() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        // Знаходимо активну кнопку, або вважаємо 'all' за замовчуванням
        const activeBtn = document.querySelector('.category-tag.active');
        const activeCategory = activeBtn ? activeBtn.getAttribute('data-category') : 'all';

        let visibleCount = 0;

        blogCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const text = card.querySelector('p')?.textContent.toLowerCase() || '';
            const cardCategory = card.getAttribute('data-category') || 'all';

            // Логіка: Пошук тексту AND Категорія
            const matchesSearch = title.includes(searchTerm) || text.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                // Невелика анімація появи
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px)';
            }
        });

        // Управління повідомленням "Нічого не знайдено"
        if (noResultsMsg) {
            noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    // Слухач на введення тексту
    searchInput.addEventListener('input', filterContent);

    // Слухачі на кнопки категорій
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Перемикання класу active
            categoryBtns.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Фільтрація
            filterContent();
        });
    });
}

/* --------------------------------------------------------------------------
   7. COOKIE CONSENT (Згода на кукі)
   -------------------------------------------------------------------------- */
function initCookieConsent() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');

    if (!banner || !acceptBtn) return;

    // Перевіряємо, чи користувач вже погодився раніше
    if (!localStorage.getItem('cookieConsent')) {
        // Якщо ні, показуємо банер з невеликою затримкою (1.5 сек)
        setTimeout(() => {
            banner.classList.add('show');
            banner.setAttribute('aria-hidden', 'false');
        }, 1500);
    }

    // Подія кліку на кнопку
    acceptBtn.addEventListener('click', () => {
        // Записуємо згоду в пам'ять браузера
        localStorage.setItem('cookieConsent', 'true');

        // Ховаємо банер
        banner.classList.remove('show');
        banner.setAttribute('aria-hidden', 'true');
    });
}