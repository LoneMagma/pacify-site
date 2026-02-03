/**
 * Admin Dashboard JavaScript
 * Handles authentication, data fetching, and UI updates
 */

const API_BASE = 'YOUR_BACKEND_URL'; // Replace with your Railway URL
const TOKEN_KEY = 'pacify_admin_token';

// DOM Elements
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const refreshBtn = document.getElementById('refresh-btn');

// Chart instances
let projectsChart = null;
let sourcesChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        verifyAndShowDashboard(token);
    }
    
    // Setup event listeners
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    refreshBtn.addEventListener('click', loadDashboardData);
});

// === Authentication ===

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        
        const data = await response.json();
        localStorage.setItem(TOKEN_KEY, data.access_token);
        
        showDashboard();
        loadDashboardData();
    } catch (error) {
        showError('Invalid username or password');
    }
}

function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    hideDashboard();
    clearForm();
}

async function verifyAndShowDashboard(token) {
    try {
        const response = await fetch(`${API_BASE}/api/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            showDashboard();
            loadDashboardData();
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
    }
}

// === UI State ===

function showDashboard() {
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'block';
}

function hideDashboard() {
    loginContainer.style.display = 'flex';
    dashboardContainer.style.display = 'none';
}

function showError(message) {
    loginError.textContent = message;
    loginError.classList.add('show');
    setTimeout(() => loginError.classList.remove('show'), 5000);
}

function clearForm() {
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// === Data Fetching ===

async function loadDashboardData() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    
    // Show loading state
    refreshBtn.style.opacity = '0.5';
    refreshBtn.style.pointerEvents = 'none';
    
    try {
        // Fetch analytics data
        const response = await fetch(`${API_BASE}/api/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch analytics');
        }
        
        const data = await response.json();
        updateMetrics(data);
        updateCharts(data);
        updateActivity(data);
        
        // Fetch live count
        const liveResponse = await fetch(`${API_BASE}/api/analytics/live`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (liveResponse.ok) {
            const liveData = await liveResponse.json();
            document.getElementById('live-count').textContent = liveData.live_visitors;
        }
        
        // Update timestamp
        const now = new Date();
        document.getElementById('last-updated').textContent = 
            `Updated at ${now.toLocaleTimeString()}`;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        if (error.message.includes('401')) {
            handleLogout();
        }
    } finally {
        refreshBtn.style.opacity = '1';
        refreshBtn.style.pointerEvents = 'auto';
    }
}

// === UI Updates ===

function updateMetrics(data) {
    document.getElementById('total-views').textContent = 
        formatNumber(data.total_views);
    
    document.getElementById('views-today').textContent = 
        formatNumber(data.views_today);
    
    document.getElementById('views-week').textContent = 
        formatNumber(data.views_this_week);
    
    // Calculate average daily views
    const avgDaily = Math.round(data.views_this_week / 7);
    document.getElementById('avg-daily').textContent = formatNumber(avgDaily);
}

function updateCharts(data) {
    // Projects Chart
    const projectsCanvas = document.getElementById('projects-chart');
    const projectsCtx = projectsCanvas.getContext('2d');
    
    if (projectsChart) {
        projectsChart.destroy();
    }
    
    projectsChart = new Chart(projectsCtx, {
        type: 'bar',
        data: {
            labels: data.top_projects.map(p => p.name),
            datasets: [{
                label: 'Clicks',
                data: data.top_projects.map(p => p.clicks),
                backgroundColor: '#CC5937',
                borderColor: '#B84D2E',
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1a2332',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                    grid: { color: '#E5DDD5' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
    
    // Sources Chart
    const sourcesCanvas = document.getElementById('sources-chart');
    const sourcesCtx = sourcesCanvas.getContext('2d');
    
    if (sourcesChart) {
        sourcesChart.destroy();
    }
    
    const colors = [
        '#CC5937', '#8B7355', '#6B8E23', '#5D4037',
        '#A0522D', '#D2691E', '#CD853F', '#DEB887'
    ];
    
    sourcesChart = new Chart(sourcesCtx, {
        type: 'doughnut',
        data: {
            labels: data.traffic_sources.map(s => s.source),
            datasets: [{
                data: data.traffic_sources.map(s => s.count),
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: '#1a2332',
                    padding: 12
                }
            }
        }
    });
}

function updateActivity(data) {
    const activityList = document.getElementById('activity-list');
    
    if (!data.recent_activity || data.recent_activity.length === 0) {
        activityList.innerHTML = '<div class="activity-loading">No recent activity</div>';
        return;
    }
    
    activityList.innerHTML = data.recent_activity.map(event => {
        const type = formatEventType(event.type);
        const details = formatEventDetails(event);
        const time = formatTimeAgo(event.timestamp);
        
        return `
            <div class="activity-item">
                <div class="activity-info">
                    <div class="activity-type">
                        <span class="event-badge ${event.type}">${type}</span>
                    </div>
                    <div class="activity-details">${details}</div>
                    <div class="activity-location">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        ${event.location}
                    </div>
                </div>
                <div class="activity-time">${time}</div>
            </div>
        `;
    }).join('');
}

// === Helpers ===

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatEventType(type) {
    const types = {
        'page_view': 'Page View',
        'project_click': 'Project Click',
        'flowchart_open': 'Flowchart',
        'cta_click': 'CTA Click',
        'contact_click': 'Contact Click',
        'scroll_depth': 'Scroll'
    };
    return types[type] || type;
}

function formatEventDetails(event) {
    if (event.project) {
        return event.project;
    }
    if (event.page) {
        return event.page === '/' ? 'Home Page' : event.page;
    }
    return 'Unknown';
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// Auto-refresh every 30 seconds
setInterval(() => {
    if (dashboardContainer.style.display !== 'none') {
        loadDashboardData();
    }
}, 30000);

console.log('%cAdmin Dashboard Ready', 'color: #CC5937; font-weight: bold; font-size: 16px;');
