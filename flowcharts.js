// Flowchart data - optimized for no-scroll viewing
const flowcharts = {
    'technical': {
        title: 'Technical Architecture',
        nodes: [
            { title: 'User Interface', desc: 'React + TypeScript frontend with real-time WebSocket connections', tech: ['React', 'TypeScript', 'WebSocket'] },
            { title: 'Authentication', desc: 'JWT-based auth with bcrypt password hashing', tech: ['JWT', 'bcrypt'] },
            { title: 'API Gateway', desc: 'FastAPI backend handling HTTP and WebSocket connections', tech: ['FastAPI', 'Python'] },
            { title: 'AI Modes', desc: '', split: [
                { title: 'Pacify Mode', desc: 'Balanced AI with safety guardrails' },
                { title: 'Defy Mode', desc: 'Uncensored technical responses' }
            ]},
            { title: 'Data Layer', desc: 'Multi-tenant architecture with complete data isolation', tech: ['PostgreSQL', 'Redis'] },
            { title: 'Deployment', desc: 'Containerized with Docker for consistency', tech: ['Docker'] }
        ]
    },
    'user-flow': {
        title: 'User Flow Journey',
        nodes: [
            { title: 'Landing', desc: 'User arrives and chooses sign up or log in' },
            { title: 'Authentication', desc: 'Credentials validated, JWT token issued' },
            { title: 'Dashboard', desc: 'View conversation history, start new chat' },
            { title: 'Mode Selection', desc: 'Choose Pacify (balanced) or Defy (uncensored)' },
            { title: 'Real-time Chat', desc: 'WebSocket connection with streaming responses' },
            { title: 'Persistence', desc: 'Conversations saved with encryption' }
        ]
    },
    'security': {
        title: 'Security Flow',
        nodes: [
            { title: 'Request', desc: 'API receives request with auth headers' },
            { title: 'Token Validation', desc: 'JWT verified for signature and expiration' },
            { title: 'Rate Limiting', desc: 'Request count checked, excessive requests throttled' },
            { title: 'Authorization', desc: 'User permissions validated for resource access' },
            { title: 'Encryption', desc: 'Data encrypted at rest, TLS for communication' },
            { title: 'Audit Logging', desc: 'Security events logged, suspicious activity flagged' }
        ]
    }
};

function openFlowchart(type) {
    const modal = document.getElementById('flowchart-modal');
    const data = flowcharts[type];
    
    let html = `
        <div class="flowchart-overlay" onclick="closeFlowchart()">
            <div class="flowchart-content" onclick="event.stopPropagation()">
                <button class="flowchart-close" onclick="closeFlowchart()">×</button>
                <h1 class="flowchart-title">${data.title}</h1>
                <div class="flowchart-container">
    `;
    
    data.nodes.forEach((node, index) => {
        if (node.split) {
            html += `
                <div class="flow-split-container" style="animation-delay: ${index * 0.1}s">
                    <div class="flow-grid">
                        ${node.split.map((subNode, subIndex) => `
                            <div class="flow-node flow-split" style="animation-delay: ${(index * 0.1) + (subIndex * 0.05)}s">
                                <h3>${subNode.title}</h3>
                                <p>${subNode.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="flow-node" style="animation-delay: ${index * 0.1}s">
                    <h3>${node.title}</h3>
                    <p>${node.desc}</p>
                    ${node.tech ? `
                        <div class="tech-badges">
                            ${node.tech.map((t, i) => `<span class="tech-badge" style="animation-delay: ${(index * 0.1) + 0.2 + (i * 0.05)}s">${t}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
        
        if (index < data.nodes.length - 1) {
            html += `<div class="flow-arrow" style="animation-delay: ${(index * 0.1) + 0.05}s">↓</div>`;
        }
    });
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    modal.innerHTML = html;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Trigger animations
    setTimeout(() => {
        const overlay = modal.querySelector('.flowchart-overlay');
        if (overlay) overlay.classList.add('active');
    }, 10);
}

function closeFlowchart() {
    const modal = document.getElementById('flowchart-modal');
    const overlay = modal.querySelector('.flowchart-overlay');
    
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    } else {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFlowchart();
    }
});
