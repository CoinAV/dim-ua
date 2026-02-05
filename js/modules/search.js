/**
 * Search Module
 * Handles Real Estate search (Index) and Blog search/filtering (Blog).
 */

export function initRealEstateSearch() {
    const searchBtn = document.getElementById('btnRealEstateSearch');
    const resetBlock = document.getElementById('search-reset-block');

    if (!searchBtn) return;

    const performSearch = () => {
        const searchRoomsEl = document.getElementById('searchRooms');
        const searchPriceEl = document.getElementById('searchPrice');

        const searchRooms = searchRoomsEl ? searchRoomsEl.value : '';
        const searchPrice = searchPriceEl ? searchPriceEl.value : '';

        const cards = document.querySelectorAll('.card'); // Note: This class might change if we refactor cards.css
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

            if (isSearching && isSold) {
                matchRooms = false;
                matchPrice = false;
            }

            if (matchRooms && matchPrice) {
                card.classList.remove('hidden');
                card.classList.add('visible');
                card.style.display = 'block';
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
            const listingsSection = document.getElementById('listings');
            if (listingsSection) listingsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    searchBtn.addEventListener('click', performSearch);
}

export function initSearchReset() {
    const resetBtn = document.querySelector('#search-reset-block button');

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            const roomsInput = document.getElementById('searchRooms');
            const priceInput = document.getElementById('searchPrice');

            if (roomsInput) roomsInput.value = '';
            if (priceInput) priceInput.value = '';

            const searchBtn = document.getElementById('btnRealEstateSearch');
            if (searchBtn) searchBtn.click();
        });
    }
}

export function initBlogSearch() {
    const searchInput = document.getElementById('blogSearchInput');
    if (!searchInput) return;

    const categoryBtns = document.querySelectorAll('.category-tag'); // Note: class might change in tag refactor
    const blogCards = document.querySelectorAll('.blog-card'); // Note: class might change
    const blogGrid = document.querySelector('.blog-grid');

    let noResultsMsg = document.getElementById('blog-no-results');
    if (!noResultsMsg && blogGrid) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'blog-no-results';
        noResultsMsg.innerHTML = '<p style="text-align:center; width:100%; padding: 40px; color: #666; font-size: 1.1rem;">За вашим запитом нічого не знайдено 😔</p>';
        noResultsMsg.style.display = 'none';
        blogGrid.appendChild(noResultsMsg);
    }

    function filterContent() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const activeBtn = document.querySelector('.category-tag.active');
        const activeCategory = activeBtn ? activeBtn.getAttribute('data-category') : 'all';

        let visibleCount = 0;

        blogCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const text = card.querySelector('p')?.textContent.toLowerCase() || '';
            const cardCategory = card.getAttribute('data-category') || 'all';

            const matchesSearch = title.includes(searchTerm) || text.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || cardCategory === activeCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
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

        if (noResultsMsg) {
            noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    searchInput.addEventListener('input', filterContent);

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            categoryBtns.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            filterContent();
        });
    });
}
