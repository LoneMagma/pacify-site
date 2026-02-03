/**
 * Pacify Portfolio Analytics Tracker
 * Lightweight, privacy-first analytics
 * Add this script to index.html before closing </body> tag
 */

(function () {
    'use strict';

    // Configuration - uses centralized config if available
    const API_ENDPOINT = window.CONFIG?.TRACK_ENDPOINT || 'https://your-railway-app.up.railway.app/api/track';
    const ENABLED = window.CONFIG?.ANALYTICS_ENABLED !== false;

    if (!ENABLED) return;

    // Graceful offline handling
    let isBackendAvailable = true;

    // Helper: Send tracking event
    function track(eventType, data = {}) {
        const payload = {
            event_type: eventType,
            page_path: window.location.pathname,
            referrer: document.referrer || null,
            ...data
        };

        // Use sendBeacon for reliability (works even on page unload)
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
            navigator.sendBeacon(API_ENDPOINT, blob);
        } else {
            // Fallback to fetch
            fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(() => { }); // Silent fail
        }
    }

    // Track page view on load
    track('page_view');

    // Track project card clicks
    document.addEventListener('click', function (e) {
        const projectCard = e.target.closest('.project-card');
        if (projectCard) {
            const projectTitle = projectCard.querySelector('.project-title');
            if (projectTitle) {
                track('project_click', {
                    project_name: projectTitle.textContent.trim()
                });
            }
        }
    });

    // Track flowchart opens (wrap existing function)
    if (typeof window.openFlowchart === 'function') {
        const originalOpen = window.openFlowchart;
        window.openFlowchart = function (type) {
            track('flowchart_open', { project_name: type });
            return originalOpen.apply(this, arguments);
        };
    }

    // Track CTA button clicks
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn');
        if (btn) {
            const text = btn.textContent.trim();
            track('cta_click', { project_name: text });
        }
    });

    // Track contact method clicks
    document.addEventListener('click', function (e) {
        const contactLink = e.target.closest('.contact-link, .social-icons a');
        if (contactLink) {
            const method = contactLink.getAttribute('aria-label') ||
                contactLink.textContent.trim();
            track('contact_click', { project_name: method });
        }
    });

    // Track scroll depth (25%, 50%, 75%, 100%)
    let maxScroll = 0;
    const milestones = [25, 50, 75, 100];
    const tracked = new Set();

    function trackScroll() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.scrollY;
        const percentage = Math.round((scrolled / documentHeight) * 100);

        if (percentage > maxScroll) {
            maxScroll = percentage;

            milestones.forEach(milestone => {
                if (percentage >= milestone && !tracked.has(milestone)) {
                    tracked.add(milestone);
                    track('scroll_depth', { project_name: `${milestone}%` });
                }
            });
        }
    }

    let scrollTimeout;
    window.addEventListener('scroll', function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(trackScroll, 200);
    }, { passive: true });

    console.log('%c📊 Analytics Active', 'color: #FB923C; font-weight: bold;');
})();
