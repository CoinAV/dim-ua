/**
 * Navigation Module
 * Handles sticky navbar, burger menu, and active link states.
 */

export function initNavigation() {
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
