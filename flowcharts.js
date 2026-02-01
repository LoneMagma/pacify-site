// Flowchart data - redesigned for single-page, modular viewing
const flowcharts = {
    'technical': {
        title: 'Technical Architecture',
        nodes: [
            {
                id: 'ui',
                title: 'User Interface',
                shortDesc: 'React + TypeScript + WebSocket',
                fullDesc: 'React frontend with TypeScript for type safety. Real-time WebSocket connections enable streaming AI responses without page refreshes. Component-based architecture for maintainability.',
                tech: ['React', 'TypeScript', 'WebSocket']
            },
            {
                id: 'auth',
                title: 'Authentication',
                shortDesc: 'JWT + bcrypt hashing',
                fullDesc: 'Secure JWT-based authentication flow. Passwords hashed with bcrypt before storage. Tokens expire after configured duration and refresh automatically.',
                tech: ['JWT', 'bcrypt']
            },
            {
                id: 'api',
                title: 'API Gateway',
                shortDesc: 'FastAPI backend',
                fullDesc: 'FastAPI handles both HTTP REST endpoints and WebSocket connections. Async architecture for high concurrency. OpenAPI docs auto-generated.',
                tech: ['FastAPI', 'Python', 'Async']
            },
            {
                id: 'modes',
                title: 'AI Modes',
                shortDesc: 'Pacify & Defy personas',
                fullDesc: 'Two distinct AI personalities: Pacify (balanced, helpful, safety-conscious) and Defy (uncensored, technical, direct). Each has sub-personas for variety.',
                split: [
                    { title: 'Pacify', desc: 'Balanced AI with guardrails' },
                    { title: 'Defy', desc: 'Uncensored technical mode' }
                ]
            },
            {
                id: 'data',
                title: 'Data Layer',
                shortDesc: 'PostgreSQL + Redis',
                fullDesc: 'PostgreSQL for persistent storage with multi-tenant data isolation. Redis for session caching and rate limiting counters.',
                tech: ['PostgreSQL', 'Redis']
            },
            {
                id: 'deploy',
                title: 'Deployment',
                shortDesc: 'Docker containers',
                fullDesc: 'Fully containerized with Docker for consistent deployments across environments. Docker Compose for local development, ready for Kubernetes scaling.',
                tech: ['Docker', 'Nginx']
            }
        ]
    },
    'user-flow': {
        title: 'User Flow Journey',
        nodes: [
            {
                id: 'landing',
                title: 'Landing',
                shortDesc: 'Welcome & auth options',
                fullDesc: 'Clean landing page with clear call-to-action. Users can sign up for a new account or log in to existing one. OAuth options planned for future.'
            },
            {
                id: 'auth',
                title: 'Authentication',
                shortDesc: 'Secure login flow',
                fullDesc: 'Credentials validated server-side. Passwords checked against bcrypt hashes. On success, JWT token issued and stored in httpOnly cookie.'
            },
            {
                id: 'dashboard',
                title: 'Dashboard',
                shortDesc: 'Conversation management',
                fullDesc: 'View all conversation history organized by date. Start new chats, continue previous ones, or delete unwanted conversations. Search functionality included.'
            },
            {
                id: 'mode',
                title: 'Mode Selection',
                shortDesc: 'Choose AI persona',
                fullDesc: 'Toggle between Pacify (balanced, thoughtful responses) and Defy (uncensored, direct answers). Each mode has distinct personality and response style.'
            },
            {
                id: 'chat',
                title: 'Real-time Chat',
                shortDesc: 'WebSocket streaming',
                fullDesc: 'Messages streamed token-by-token via WebSocket for instant feedback. No waiting for complete responses. Supports markdown rendering.'
            },
            {
                id: 'persist',
                title: 'Persistence',
                shortDesc: 'Encrypted storage',
                fullDesc: 'All conversations automatically saved with end-to-end encryption. Data isolated per user - no cross-tenant access possible.'
            }
        ]
    },
    'security': {
        title: 'Security Flow',
        nodes: [
            {
                id: 'request',
                title: 'Request',
                shortDesc: 'Incoming API call',
                fullDesc: 'Every API request includes authentication headers. CORS policies restrict origins. Request body validated against schemas before processing.'
            },
            {
                id: 'token',
                title: 'Token Validation',
                shortDesc: 'JWT verification',
                fullDesc: 'JWT signature verified using secret key. Expiration time checked. Invalid or expired tokens rejected with 401 response.'
            },
            {
                id: 'rate',
                title: 'Rate Limiting',
                shortDesc: 'Throttle protection',
                fullDesc: 'Redis-backed rate limiting tracks requests per user. Excessive requests get 429 response. Prevents abuse and ensures fair usage.'
            },
            {
                id: 'authz',
                title: 'Authorization',
                shortDesc: 'Permission checks',
                fullDesc: 'After authentication, authorization verifies user can access requested resource. Users can only access their own data.'
            },
            {
                id: 'encrypt',
                title: 'Encryption',
                shortDesc: 'Data protection',
                fullDesc: 'All data encrypted at rest using AES-256. TLS 1.3 for all network communication. Secrets stored in environment variables.'
            },
            {
                id: 'audit',
                title: 'Audit Logging',
                shortDesc: 'Security monitoring',
                fullDesc: 'Security events logged with timestamps and user IDs. Failed login attempts tracked. Suspicious patterns trigger alerts.'
            }
        ]
    }
};

// State management
let activeNode = null;
let currentFlowchart = null;

function openFlowchart(type) {
    const modal = document.getElementById('flowchart-modal');
    const data = flowcharts[type];
    currentFlowchart = type;
    activeNode = null;

    const html = `
        <div class="flowchart-overlay" onclick="handleOverlayClick(event)">
            <div class="flowchart-panel">
                <button class="flowchart-close" onclick="closeFlowchart()" aria-label="Close">×</button>
                
                <div class="flowchart-header">
                    <h1 class="flowchart-title">${data.title}</h1>
                    <p class="flowchart-hint">Click any node for details</p>
                </div>
                
                <div class="flowchart-body">
                    <div class="flowchart-nodes">
                        ${generateNodes(data.nodes)}
                    </div>
                    
                    <div class="flowchart-detail" id="flowchart-detail">
                        <div class="detail-placeholder">
                            <p class="detail-prompt">Select a node to explore</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.innerHTML = html;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Trigger entrance animation
    requestAnimationFrame(() => {
        const overlay = modal.querySelector('.flowchart-overlay');
        if (overlay) overlay.classList.add('active');
    });
}

function generateNodes(nodes) {
    return nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;

        if (node.split) {
            return `
                <div class="flow-row">
                    <div class="flow-node flow-node-split" data-id="${node.id}" onclick="showNodeDetail('${node.id}')">
                        <span class="node-title">${node.title}</span>
                        <span class="node-short">${node.shortDesc}</span>
                        <div class="split-badges">
                            ${node.split.map(s => `<span class="split-badge">${s.title}</span>`).join('')}
                        </div>
                    </div>
                    ${!isLast ? '<div class="flow-connector"><span>↓</span></div>' : ''}
                </div>
            `;
        }

        return `
            <div class="flow-row">
                <div class="flow-node" data-id="${node.id}" onclick="showNodeDetail('${node.id}')">
                    <span class="node-title">${node.title}</span>
                    <span class="node-short">${node.shortDesc}</span>
                </div>
                ${!isLast ? '<div class="flow-connector"><span>↓</span></div>' : ''}
            </div>
        `;
    }).join('');
}

function showNodeDetail(nodeId) {
    const data = flowcharts[currentFlowchart];
    const node = data.nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Update active state
    document.querySelectorAll('.flow-node').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-id="${nodeId}"]`)?.classList.add('active');
    activeNode = nodeId;

    const detailPanel = document.getElementById('flowchart-detail');

    let techBadges = '';
    if (node.tech) {
        techBadges = `
            <div class="detail-tech">
                ${node.tech.map(t => `<span class="detail-badge">${t}</span>`).join('')}
            </div>
        `;
    }

    let splitInfo = '';
    if (node.split) {
        splitInfo = `
            <div class="detail-split">
                ${node.split.map(s => `
                    <div class="split-item">
                        <strong>${s.title}</strong>
                        <span>${s.desc}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    detailPanel.innerHTML = `
        <div class="detail-content">
            <h2 class="detail-title">${node.title}</h2>
            <p class="detail-desc">${node.fullDesc}</p>
            ${techBadges}
            ${splitInfo}
        </div>
    `;

    detailPanel.classList.add('has-content');
}

function handleOverlayClick(event) {
    if (event.target.classList.contains('flowchart-overlay')) {
        closeFlowchart();
    }
}

function closeFlowchart() {
    const modal = document.getElementById('flowchart-modal');
    const overlay = modal.querySelector('.flowchart-overlay');

    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            currentFlowchart = null;
            activeNode = null;
        }, 300);
    } else {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFlowchart();
    }
});
