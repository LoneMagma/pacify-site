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

// MODAL FUNCTIONALITY FOR ARCHITECTURE DIAGRAMS
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalClose = document.querySelector('.modal-close');

function openModal(element) {
    const diagram = element.getAttribute('data-diagram');
    
    // Map diagram types to image paths
    const imagePaths = {
        'user-flow': 'images/user-flow.png',
        'technical': 'images/technical-arch.png',
        'security': 'images/security-flow.png'
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

// SCROLL ANIMATIONS
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
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
        '.project-card, .learning-card, .feature-card'
    );
    
    animateElements.forEach(element => {
        element.classList.add('scroll-animate');
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

// MOBILE MENU (if needed in future)
// Can be expanded for hamburger menu functionality

// LOG TO CONSOLE (optional - for debugging)
console.log('%cPacify Portfolio Loaded ✓', 'color: #FB923C; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with HTML, CSS, and vanilla JavaScript', 'color: #14B8A6; font-size: 12px;');