/**
 * Pacify Site Configuration
 * Centralized configuration for API URLs and feature flags
 */

const CONFIG = {
    // Backend API Base URL - Update this after Railway deployment
    API_BASE: 'https://postgres-production-50733.up.railway.app',

    // Environment detection
    IS_DEV: window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1',

    // Feature flags
    ANALYTICS_ENABLED: true,
    ADMIN_ACCESS_ENABLED: true,

    // Admin access configuration
    ADMIN_HASH: '#!elevate',
    ADMIN_PAGE: 'admin.html',

    // Development overrides
    get API_ENDPOINT() {
        if (this.IS_DEV) {
            return 'http://localhost:8000';
        }
        return this.API_BASE;
    },

    // Tracking endpoint
    get TRACK_ENDPOINT() {
        return `${this.API_ENDPOINT}/api/track`;
    }
};

// Freeze to prevent modification
Object.freeze(CONFIG);

// Make available globally
window.CONFIG = CONFIG;
