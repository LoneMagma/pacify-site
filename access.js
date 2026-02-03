/**
 * Pacify Admin Access Handler
 * Provides hidden access methods to admin panel
 * Authentication is still required after access - these just reveal the admin page
 */

(function () {
    'use strict';

    if (!window.CONFIG?.ADMIN_ACCESS_ENABLED) return;

    const ADMIN_PAGE = window.CONFIG?.ADMIN_PAGE || 'admin.html';
    const ADMIN_HASH = window.CONFIG?.ADMIN_HASH || '#!elevate';

    // Method 1: URL Hash - pacify.site/#!elevate
    function checkHashAccess() {
        if (window.location.hash === ADMIN_HASH) {
            // Clear hash to avoid exposure in history
            history.replaceState(null, '', window.location.pathname);
            redirectToAdmin();
        }
    }

    // Check on page load and hash change
    checkHashAccess();
    window.addEventListener('hashchange', checkHashAccess);

    // Method 2: Keyboard Shortcut - Ctrl+Shift+A
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            redirectToAdmin();
        }
    });

    // Method 3: Footer Logo Click Pattern - 5 clicks in 3 seconds
    const CLICK_COUNT = 5;
    const CLICK_WINDOW = 3000; // 3 seconds
    let clickTimestamps = [];

    function setupLogoTrigger() {
        // Find footer logo - check for data attribute or footer text
        const footerLogo = document.querySelector('[data-admin-trigger]') ||
            document.querySelector('.footer .logo') ||
            document.querySelector('.footer-text');

        if (!footerLogo) return;

        footerLogo.style.cursor = 'default'; // Don't give away it's clickable
        footerLogo.addEventListener('click', handleLogoClick);
    }

    function handleLogoClick() {
        const now = Date.now();

        // Remove clicks older than the window
        clickTimestamps = clickTimestamps.filter(t => now - t < CLICK_WINDOW);
        clickTimestamps.push(now);

        if (clickTimestamps.length >= CLICK_COUNT) {
            clickTimestamps = [];
            redirectToAdmin();
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupLogoTrigger);
    } else {
        setupLogoTrigger();
    }

    // Redirect handler
    function redirectToAdmin() {
        window.location.href = ADMIN_PAGE;
    }

    // Silent initialization
    console.log('%cAccess handler initialized', 'color: #888; font-size: 10px;');
})();
