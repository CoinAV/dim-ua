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

// Доступно для onclick="..."
window.nextImage = function () { showImg(currentImg + 1); };
window.prevImage = function () { showImg(currentImg - 1); };

/* --- ЛОГІКА ПОШУКУ (Для Index.html) --- */
window.searchProperties = function () {
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
            hasResults = true;
        } else {
            card.classList.remove('visible');
            card.classList.add('hidden');
        }
    });

    const noResults = document.getElementById('no-results');
    if (noResults) noResults.style.display = hasResults ? 'none' : 'block';

    if (resetBlock) resetBlock.style.display = isSearching ? 'block' : 'none';

    if (isSearching) {
        const listingsSection = document.getElementById('listings');
        if (listingsSection) listingsSection.scrollIntoView({ behavior: 'smooth' });
    }
};

window.resetSearch = function () {
    const roomsInput = document.getElementById('searchRooms');
    const priceInput = document.getElementById('searchPrice');

    if (roomsInput) roomsInput.value = '';
    if (priceInput) priceInput.value = '';

    window.searchProperties();
};

/* ==========================================================================
   ІНІЦІАЛІЗАЦІЯ ПІСЛЯ ЗАВАНТАЖЕННЯ DOM
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initGallery();
    initModalGallery();
    initRevealAnimations();
    initPhoneButtons();
});

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
    const phoneDisplay = "(063) 388-98-56";
    const phoneTel = "+380633889856";

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
                btn.innerText = "📞 " + display;
                btn.title = "Натисніть ще раз, щоб подзвонити";
                btn.style.backgroundColor = "#1A1A1A";
            }
            // 2-й клік — дозволяємо стандартну дію (дзвінок)
        }, { passive: false });
    });
}
