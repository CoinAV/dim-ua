/**
 * Utils Module
 * Helper functions, animations, and common behaviors.
 */

export function initCookieConsent() {
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');

    if (!banner || !acceptBtn) return;

    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            banner.classList.add('show');
            banner.setAttribute('aria-hidden', 'false');
        }, 1500);
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        banner.classList.remove('show');
        banner.setAttribute('aria-hidden', 'true');
    });
}

export function initRevealAnimations() {
    const cards = document.querySelectorAll('.service-card, .blog-card, .contact-card, .review-item');
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

export function initPhoneButtons() {
    const decodePhone = (encoded) => { try { return atob(encoded); } catch (e) { return ""; } };
    const phoneDisplay = "(063) 388-98-56";
    const phoneTel = decodePhone("KzM4MDYzMzg4OTg1Ng==");

    const callButtons = [
        document.getElementById('btn-call-desktop'),
        document.querySelector('.mf-call'),
        document.getElementById('btn-order-call')
    ].filter(Boolean);

    callButtons.forEach((btn) => {
        const href = btn.getAttribute('href') || "";
        const telFromHref = href.startsWith("tel:") ? href.replace("tel:", "").trim() : "";
        const tel = (btn.dataset.phoneTel || telFromHref || phoneTel).trim();

        if (!href.startsWith("tel:") && tel) {
            btn.setAttribute("href", "tel:" + tel);
        }

        btn.dataset.revealed = btn.dataset.revealed || "0";
        btn.dataset.phoneDisplay = btn.dataset.phoneDisplay || phoneDisplay;
        btn.dataset.phoneTel = tel;

        btn.addEventListener("click", (e) => {
            const revealed = btn.dataset.revealed === "1";
            if (!revealed) {
                e.preventDefault();
                btn.dataset.revealed = "1";
                const display = btn.dataset.phoneDisplay || phoneDisplay;
                btn.innerHTML = "<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 5px;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> " + display;
                btn.title = "Натисніть ще раз, щоб подзвонити";
                btn.style.backgroundColor = "#1A1A1A";
            }
        }, { passive: false });
    });
}

export function initImageErrorHandling() {
    document.addEventListener('error', function (e) {
        if (e.target.tagName.toLowerCase() === 'img') {
            if (!e.target.src.includes('placehold.co')) {
                e.target.src = 'https://placehold.co/600x400?text=No+Image';
                e.target.alt = 'Image not found';
            }
        }
    }, true);
}
