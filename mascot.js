/**
 * Kawaii Robot Mascot - Interactive Eye Tracking & Animations
 * For Pacify Portfolio Site
 */

document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.querySelector('.hero');
    const svg = document.getElementById('mascot-svg');
    const leftPupil = document.getElementById('left-pupil');
    const rightPupil = document.getElementById('right-pupil');
    const mascotGroup = svg?.querySelector('.mascot-group');

    // Config
    const maxPupilMove = 12; // Increased for larger SVG scale
    const maxHeadTilt = 5;   // Slightly more tilt

    if (!svg || !leftPupil || !rightPupil) return;

    /**
     * Calculate and apply pupil movement based on mouse position
     */
    function updatePupils(mouseX, mouseY) {
        const container = svg.getBoundingClientRect();
        const centerX = container.left + container.width / 2;
        const centerY = container.top + container.height / 2;

        // Normalize mouse position relative to center (-1 to 1)
        const deltaX = (mouseX - centerX) / (window.innerWidth / 2);
        const deltaY = (mouseY - centerY) / (window.innerHeight / 2);

        // Clamp movement
        const moveX = Math.max(-maxPupilMove, Math.min(maxPupilMove, deltaX * maxPupilMove));
        const moveY = Math.max(-maxPupilMove, Math.min(maxPupilMove, deltaY * maxPupilMove));

        // Apply transform to both pupils
        leftPupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
        rightPupil.style.transform = `translate(${moveX}px, ${moveY}px)`;

        // Subtle head tilt
        if (mascotGroup) {
            const tiltX = -deltaY * maxHeadTilt;
            const tiltY = deltaX * maxHeadTilt;
            mascotGroup.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }
    }

    /**
     * Reset pupils and head to center position
     */
    function resetPosition() {
        leftPupil.style.transform = 'translate(0px, 0px)';
        rightPupil.style.transform = 'translate(0px, 0px)';

        if (mascotGroup) {
            mascotGroup.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
        }
    }

    // Mouse move handler
    heroSection.addEventListener('mousemove', (e) => {
        requestAnimationFrame(() => {
            updatePupils(e.clientX, e.clientY);
        });
    });

    // Reset on mouse leave
    heroSection.addEventListener('mouseleave', () => {
        resetPosition();
    });

    // Subtle easter egg: happy wiggle on click
    let clickTimeout;
    svg.addEventListener('click', () => {
        if (mascotGroup) {
            // Remove any existing animation
            mascotGroup.classList.remove('mascot-clicked');

            // Force reflow
            void mascotGroup.offsetWidth;

            // Add animation class
            mascotGroup.classList.add('mascot-clicked');

            // Remove class after animation completes
            clearTimeout(clickTimeout);
            clickTimeout = setTimeout(() => {
                mascotGroup.classList.remove('mascot-clicked');
            }, 600);
        }
    });

    // Touch support for mobile
    heroSection.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            requestAnimationFrame(() => {
                updatePupils(touch.clientX, touch.clientY);
            });
        }
    });

    heroSection.addEventListener('touchend', () => {
        resetPosition();
    });
});
