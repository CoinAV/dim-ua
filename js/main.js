/**
 * Main Entry Point
 * Imports and initializes all modules.
 */

import { initNavigation } from './modules/navigation.js';
import { initGallery, initGalleryNavigation, initModalGallery } from './modules/gallery.js';
import { initRealEstateSearch, initSearchReset, initBlogSearch } from './modules/search.js';
import { initCookieConsent, initRevealAnimations, initPhoneButtons, initImageErrorHandling } from './modules/utils.js';

document.addEventListener("DOMContentLoaded", function () {
    // Core
    initNavigation();
    initImageErrorHandling();

    // Gallery
    initGallery();
    initGalleryNavigation(); // Now strictly module-based listeners
    initModalGallery();

    // Search
    initRealEstateSearch();
    initSearchReset();
    initBlogSearch();

    // Utils/UI
    initRevealAnimations();
    initPhoneButtons();
    initCookieConsent();

    // Log success
    console.log('Modules loaded successfully.');
});
