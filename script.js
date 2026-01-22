// SMOOTH SCROLL FOR NAVIGATION LINKS
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// DARK MODE TOGGLE
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
    const theme = html.getAttribute('data-theme');
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// MODAL FUNCTIONALITY FOR ARCHITECTURE DIAGRAMS
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalClose = document.querySelector('.modal-close');

function openModal(element) {
    const diagram = element.getAttribute('data-diagram');
    
    // Map diagram types to image paths
    const imagePaths = {
        'user-flow': 'images/UserFlowSVG.svg',
        'technical': 'images/TechnicalFlowSVG.svg',
        'security': 'images/SecurityFlowSVG.svg'
    };
    
    modal.style.display = 'block';
    modalImg.src = imagePaths[diagram] || '';
    modalImg.alt = element.querySelector('.placeholder-label').textContent;
    document.body.style.overflow = 'hidden';
}

// Close modal when clicking the X
if (modalClose) {
    modalClose.onclick = function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };
}

// Close modal when clicking outside the image
modal.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.style.display === 'block') {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// ENHANCED SCROLL ANIMATIONS - Subtle reveal effects
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll(
        '.project-card, .learning-card, .feature-card, .tech-badge, .confession-box'
    );
    
    animateElements.forEach((element, index) => {
        element.classList.add('scroll-animate');
        element.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(element);
    });
});

// HEADER SHADOW ON SCROLL
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
    }
    
    lastScroll = currentScroll;
});

// INTERACTIVE ARCHITECTURE DIAGRAMS
// Make diagram placeholders more informative on hover
document.addEventListener('DOMContentLoaded', function() {
    const diagrams = document.querySelectorAll('.diagram-placeholder');
    
    diagrams.forEach(diagram => {
        const label = diagram.getAttribute('data-diagram');
        const descriptions = {
            'user-flow': 'Complete user journey from signup to active usage',
            'technical': 'Backend architecture with FastAPI, WebSocket & Docker',
            'security': 'JWT authentication flow and data isolation strategy'
        };
        
        // Add tooltip on hover
        diagram.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'diagram-tooltip';
            tooltip.textContent = descriptions[label];
            tooltip.style.cssText = `
                position: absolute;
                bottom: 3rem;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.85);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                font-size: 0.85rem;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 10;
            `;
            this.appendChild(tooltip);
            setTimeout(() => tooltip.style.opacity = '1', 10);
        });
        
        diagram.addEventListener('mouseleave', function() {
            const tooltip = this.querySelector('.diagram-tooltip');
            if (tooltip) {
                tooltip.style.opacity = '0';
                setTimeout(() => tooltip.remove(), 300);
            }
        });
    });
});

// SKILLS PROGRESS TRACKING
// Add visual progress indicators to learning cards
document.addEventListener('DOMContentLoaded', function() {
    const learningCards = document.querySelectorAll('.learning-card:not(.learning-card-meta)');
    
    const skillLevels = {
        'Architecture & Design': 78,
        'Security Isn\'t Optional': 82,
        'Deployment & DevOps': 70
    };
    
    learningCards.forEach(card => {
        const title = card.querySelector('.learning-title').textContent;
        const level = skillLevels[title];
        
        if (level) {
            const progressBar = document.createElement('div');
            progressBar.className = 'skill-progress';
            progressBar.innerHTML = `
                <div class="progress-track">
                    <div class="progress-fill" data-level="${level}"></div>
                </div>
                <span class="progress-label">${level}% mastered</span>
            `;
            card.querySelector('.learning-title').after(progressBar);
        }
    });
    
    // Animate progress bars when they come into view
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target.querySelector('.progress-fill');
                const level = fill.getAttribute('data-level');
                setTimeout(() => {
                    fill.style.width = level + '%';
                }, 200);
                progressObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.skill-progress').forEach(el => {
        progressObserver.observe(el);
    });
});

// TECH STACK INTERACTIVE TOOLTIPS
document.addEventListener('DOMContentLoaded', function() {
    const techBadges = document.querySelectorAll('.tech-badge');
    
    const techInfo = {
        'FastAPI': 'Python backend framework for building APIs',
        'React': 'Frontend UI library for building interfaces',
        'TypeScript': 'Typed superset of JavaScript',
        'WebSocket': 'Real-time bidirectional communication protocol',
        'JWT Auth': 'JSON Web Token authentication system',
        'Docker': 'Containerization for consistent deployments'
    };
    
    techBadges.forEach(badge => {
        const tech = badge.textContent.trim();
        const info = techInfo[tech];
        
        if (info) {
            badge.setAttribute('title', info);
            badge.style.cursor = 'help';
        }
    });
});

// READING PROGRESS INDICATOR
document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, var(--burnt-orange), var(--teal));
        z-index: 1000;
        transition: width 0.1s ease-out;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.pageYOffset;
        const progress = (scrolled / documentHeight) * 100;
        progressBar.style.width = progress + '%';
    });
});

// LOG TO CONSOLE
console.log('%cPacify Portfolio Loaded ✓', 'color: #FB923C; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with HTML, CSS, and vanilla JavaScript', 'color: #14B8A6; font-size: 12px;');

// Add to your existing script.js

// SMART MICRO-CTAs
// Show contextual CTAs based on user scroll behavior
document.addEventListener('DOMContentLoaded', function() {
    
    // Track time spent on page
    let timeOnPage = 0;
    const timeTracker = setInterval(() => {
        timeOnPage++;
        
        // After 30 seconds of engagement, show gentle CTA
        if (timeOnPage === 30) {
            showEngagementCTA();
        }
    }, 1000);
    
    // Clean up on page leave
    window.addEventListener('beforeunload', () => {
        clearInterval(timeTracker);
    });
    
    // Scroll-based CTAs
    let hasSeenProjects = false;
    let hasSeenLearnings = false;
    
    window.addEventListener('scroll', () => {
        const projectsSection = document.getElementById('projects');
        const learningsSection = document.getElementById('learnings');
        
        if (projectsSection && !hasSeenProjects) {
            if (isInViewport(projectsSection)) {
                hasSeenProjects = true;
                // User has seen projects, they're interested
            }
        }
        
        if (learningsSection && !hasSeenLearnings) {
            if (isInViewport(learningsSection)) {
                hasSeenLearnings = true;
                // User is reading about skills, show relevant CTA
            }
        }
    });
});

// Helper function to check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Show subtle engagement CTA
function showEngagementCTA() {
    const existingCTA = document.querySelector('.floating-cta');
    if (existingCTA) return; // Don't show if already visible
    
    const cta = document.createElement('div');
    cta.className = 'floating-cta';
    cta.innerHTML = `
        <div class="floating-cta-content">
            <span class="floating-cta-text">Like what you see?</span>
            <a href="#about" class="floating-cta-button">Let's Connect</a>
            <button class="floating-cta-close">&times;</button>
        </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .floating-cta {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--white);
            border: 2px solid var(--burnt-orange);
            border-radius: 0.75rem;
            padding: 1rem 1.5rem;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            z-index: 999;
            animation: slideInUp 0.5s ease-out;
            max-width: 300px;
        }
        
        [data-theme="dark"] .floating-cta {
            background: #161B22;
            border-color: #39FF14;
            box-shadow: 0 8px 24px rgba(57, 255, 20, 0.2);
        }
        
        .floating-cta-content {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .floating-cta-text {
            font-size: 0.95rem;
            font-weight: 500;
            color: var(--charcoal);
        }
        
        [data-theme="dark"] .floating-cta-text {
            color: var(--charcoal);
        }
        
        .floating-cta-button {
            padding: 0.5rem 1rem;
            background-color: var(--burnt-orange);
            color: white;
            text-decoration: none;
            border-radius: 0.375rem;
            font-weight: 600;
            font-size: 0.9rem;
            white-space: nowrap;
            transition: all 0.3s ease;
        }
        
        [data-theme="dark"] .floating-cta-button {
            background-color: #39FF14;
            color: #0D1117;
        }
        
        .floating-cta-button:hover {
            transform: scale(1.05);
        }
        
        .floating-cta-close {
            background: none;
            border: none;
            color: var(--dark-gray);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
            transition: transform 0.2s ease;
        }
        
        .floating-cta-close:hover {
            transform: scale(1.2);
        }
        
        @keyframes slideInUp {
            from {
                transform: translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        @media (max-width: 768px) {
            .floating-cta {
                bottom: 1rem;
                right: 1rem;
                left: 1rem;
                max-width: none;
            }
            
            .floating-cta-content {
                flex-direction: column;
                align-items: stretch;
                text-align: center;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(cta);
    
    // Close button functionality
    cta.querySelector('.floating-cta-close').addEventListener('click', () => {
        cta.style.animation = 'slideInUp 0.3s ease-out reverse';
        setTimeout(() => cta.remove(), 300);
    });
    
    // Auto-hide after 15 seconds if not interacted with
    setTimeout(() => {
        if (document.body.contains(cta)) {
            cta.style.animation = 'slideInUp 0.3s ease-out reverse';
            setTimeout(() => cta.remove(), 300);
        }
    }, 15000);
}

// ENHANCED PROJECT CARD INTERACTIONS
// Add "Learn More" expansion for project details
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Add engagement tracking
        let hasHovered = false;
        
        card.addEventListener('mouseenter', function() {
            if (!hasHovered) {
                hasHovered = true;
                // Track that user is interested in this project
            }
        });
    });
});

// COPY EMAIL ON CLICK
// Make email addresses easy to copy
document.addEventListener('DOMContentLoaded', function() {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const email = this.getAttribute('href').replace('mailto:', '');
            
            // Copy to clipboard
            navigator.clipboard.writeText(email).then(() => {
                // Show confirmation
                showCopyConfirmation(this);
            }).catch(err => {
                console.log('Could not copy email', err);
            });
        });
    });
});

function showCopyConfirmation(element) {
    const tooltip = document.createElement('span');
    tooltip.className = 'copy-tooltip';
    tooltip.textContent = 'Email copied!';
    tooltip.style.cssText = `
        position: absolute;
        background: var(--burnt-orange);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.85rem;
        bottom: calc(100% + 0.5rem);
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        animation: fadeInOut 2s ease-out;
        pointer-events: none;
        z-index: 1000;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateX(-50%) translateY(5px); }
            20%, 80% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    element.style.position = 'relative';
    element.appendChild(tooltip);
    
    setTimeout(() => tooltip.remove(), 2000);
}

// FORM VALIDATION (if you add a contact form)
function setupContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = form.querySelector('[name="name"]').value.trim();
        const email = form.querySelector('[name="email"]').value.trim();
        const message = form.querySelector('[name="message"]').value.trim();
        
        // Basic validation
        if (!name || !email || !message) {
            showFormError('Please fill in all fields');
            return;
        }
        
        if (!isValidEmail(email)) {
            showFormError('Please enter a valid email address');
            return;
        }
        
        // If validation passes, you can submit or show success
        showFormSuccess('Message sent! I\'ll get back to you soon.');
        form.reset();
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormError(message) {
    // Implementation for showing form errors
    console.error(message);
}

function showFormSuccess(message) {
    // Implementation for showing success message
    console.log(message);
}

// Initialize form if it exists
document.addEventListener('DOMContentLoaded', setupContactForm);
