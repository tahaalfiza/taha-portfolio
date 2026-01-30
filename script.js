/* ==========================================
   TAHA WORK - INFINITE CANVAS PORTFOLIO
   Interactive Canvas Engine
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initThemeToggle();
    initCanvas();
    initCustomCursor();
    initNavigation();
    initZoomControls();
    initMinimap();
    initParticles();
});

/* ==========================================
   LOADING SCREEN
   ========================================== */
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1500);
}

/* ==========================================
   THEME TOGGLE
   ========================================== */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

/* ==========================================
   INFINITE CANVAS ENGINE
   ========================================== */
function initCanvas() {
    const container = document.getElementById('canvasContainer');
    const canvas = document.getElementById('canvas');

    let state = {
        scale: 1,
        minScale: 0.3,
        maxScale: 2,
        panX: 0,
        panY: 0,
        isDragging: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        velocity: { x: 0, y: 0 },
        friction: 0.92
    };

    // Center on home section initially
    const homeSection = document.getElementById('section-home');
    if (homeSection) {
        state.panX = -(parseFloat(homeSection.style.left) / 100 * 4000) + window.innerWidth / 2;
        state.panY = -(parseFloat(homeSection.style.top) / 100 * 3000) + window.innerHeight / 2;
    }

    updateTransform();

    // Mouse events
    container.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Touch events
    container.addEventListener('touchstart', startDragTouch, { passive: false });
    document.addEventListener('touchmove', dragTouch, { passive: false });
    document.addEventListener('touchend', endDrag);

    // Wheel event - FIXED: scroll aligns with sections
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Keyboard
    document.addEventListener('keydown', handleKeyboard);

    function startDrag(e) {
        if (e.target.closest('.section-content') && !e.target.closest('.draggable')) return;

        state.isDragging = true;
        state.startX = e.clientX - state.panX;
        state.startY = e.clientY - state.panY;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        state.velocity = { x: 0, y: 0 };

        container.style.cursor = 'grabbing';
        document.getElementById('cursor')?.classList.add('cursor-drag');
    }

    function startDragTouch(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            state.isDragging = true;
            state.startX = touch.clientX - state.panX;
            state.startY = touch.clientY - state.panY;
            state.lastX = touch.clientX;
            state.lastY = touch.clientY;
        }
    }

    function drag(e) {
        if (!state.isDragging) return;

        const dx = e.clientX - state.lastX;
        const dy = e.clientY - state.lastY;

        state.velocity.x = dx;
        state.velocity.y = dy;

        state.panX = e.clientX - state.startX;
        state.panY = e.clientY - state.startY;

        state.lastX = e.clientX;
        state.lastY = e.clientY;

        updateTransform();
        updateMinimap();
    }

    function dragTouch(e) {
        if (!state.isDragging || e.touches.length !== 1) return;
        e.preventDefault();

        const touch = e.touches[0];
        state.panX = touch.clientX - state.startX;
        state.panY = touch.clientY - state.startY;
        state.lastX = touch.clientX;
        state.lastY = touch.clientY;

        updateTransform();
        updateMinimap();
    }

    function endDrag() {
        if (!state.isDragging) return;

        state.isDragging = false;
        container.style.cursor = 'grab';
        document.getElementById('cursor')?.classList.remove('cursor-drag');

        applyMomentum();
    }

    function applyMomentum() {
        if (Math.abs(state.velocity.x) < 0.5 && Math.abs(state.velocity.y) < 0.5) return;

        state.velocity.x *= state.friction;
        state.velocity.y *= state.friction;

        state.panX += state.velocity.x;
        state.panY += state.velocity.y;

        updateTransform();
        updateMinimap();

        if (Math.abs(state.velocity.x) > 0.5 || Math.abs(state.velocity.y) > 0.5) {
            requestAnimationFrame(applyMomentum);
        }
    }

    // FIXED: Scroll now moves canvas in direction aligned with content
    function handleWheel(e) {
        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
            // Zoom
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(state.minScale, Math.min(state.maxScale, state.scale * zoomFactor));

            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const scaleChange = newScale - state.scale;
            state.panX -= mouseX * scaleChange / state.scale;
            state.panY -= mouseY * scaleChange / state.scale;

            state.scale = newScale;
            updateZoomLevel();
        } else {
            // Pan - FIXED: direction aligned with scroll
            // Scroll down = move canvas up (see content below)
            // Scroll right = move canvas left (see content to the right)
            state.panX -= e.deltaX * 1.5;
            state.panY -= e.deltaY * 1.5;
        }

        updateTransform();
        updateMinimap();
    }

    function handleKeyboard(e) {
        const panAmount = 100;

        switch (e.key) {
            case 'ArrowUp':
                state.panY += panAmount;
                break;
            case 'ArrowDown':
                state.panY -= panAmount;
                break;
            case 'ArrowLeft':
                state.panX += panAmount;
                break;
            case 'ArrowRight':
                state.panX -= panAmount;
                break;
            case '+':
            case '=':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    state.scale = Math.min(state.maxScale, state.scale + 0.1);
                    updateZoomLevel();
                }
                break;
            case '-':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    state.scale = Math.max(state.minScale, state.scale - 0.1);
                    updateZoomLevel();
                }
                break;
            default:
                return;
        }

        updateTransform();
        updateMinimap();
    }

    function updateTransform() {
        canvas.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
    }

    function updateZoomLevel() {
        const zoomLevelEl = document.getElementById('zoomLevel');
        if (zoomLevelEl) {
            zoomLevelEl.textContent = Math.round(state.scale * 100) + '%';
        }
    }

    // Expose for external use
    window.canvasState = state;
    window.updateCanvasTransform = updateTransform;
    window.updateMinimap = updateMinimap;

    window.navigateToSection = function (sectionId) {
        const section = document.getElementById(`section-${sectionId}`);
        if (!section) return;

        const sectionX = parseFloat(section.style.left) / 100 * 4000;
        const sectionY = parseFloat(section.style.top) / 100 * 3000;

        const targetX = -sectionX + window.innerWidth / 2;
        const targetY = -sectionY + window.innerHeight / 2;

        animateToPosition(targetX, targetY);
    };

    function animateToPosition(targetX, targetY) {
        const startX = state.panX;
        const startY = state.panY;
        const duration = 800;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);

            state.panX = startX + (targetX - startX) * eased;
            state.panY = startY + (targetY - startY) * eased;

            updateTransform();
            updateMinimap();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    window.zoomIn = function () {
        const oldScale = state.scale;
        const newScale = Math.min(state.maxScale, state.scale + 0.1);

        // Zoom toward center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const scaleChange = newScale - oldScale;
        state.panX -= centerX * scaleChange / oldScale;
        state.panY -= centerY * scaleChange / oldScale;

        state.scale = newScale;
        updateTransform();
        updateZoomLevel();
        updateMinimap();
    };

    window.zoomOut = function () {
        const oldScale = state.scale;
        const newScale = Math.max(state.minScale, state.scale - 0.1);

        // Zoom toward center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const scaleChange = newScale - oldScale;
        state.panX -= centerX * scaleChange / oldScale;
        state.panY -= centerY * scaleChange / oldScale;

        state.scale = newScale;
        updateTransform();
        updateZoomLevel();
        updateMinimap();
    };

    window.resetZoom = function () {
        state.scale = 1;
        navigateToSection('home');
        updateZoomLevel();
    };
}

/* ==========================================
   CUSTOM CURSOR
   ========================================== */
function initCustomCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor || window.innerWidth <= 768) {
        if (cursor) cursor.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    const hoverElements = document.querySelectorAll('a, button, .project-card, .sticky-note, .skill-tag');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
}

/* ==========================================
   NAVIGATION
   ========================================== */
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;

            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (window.navigateToSection) {
                window.navigateToSection(target);
            }
        });
    });

    const ctaBtn = document.querySelector('.nav-cta');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.navigateToSection) {
                window.navigateToSection('contact');
            }
        });
    }
}

/* ==========================================
   ZOOM CONTROLS
   ========================================== */
function initZoomControls() {
    document.getElementById('zoomIn')?.addEventListener('click', () => window.zoomIn?.());
    document.getElementById('zoomOut')?.addEventListener('click', () => window.zoomOut?.());
    document.getElementById('zoomReset')?.addEventListener('click', () => window.resetZoom?.());
}

/* ==========================================
   MINIMAP
   ========================================== */
function initMinimap() {
    const minimap = document.getElementById('minimap');
    const markers = minimap?.querySelectorAll('.minimap-marker');

    if (!minimap || !markers) return;

    markers.forEach(marker => {
        marker.addEventListener('click', () => {
            const section = marker.dataset.section;
            if (window.navigateToSection) {
                window.navigateToSection(section);
            }
        });
    });

    minimap.addEventListener('click', (e) => {
        if (e.target.classList.contains('minimap-marker')) return;

        const rect = minimap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const targetX = -(x * 4000) + window.innerWidth / 2;
        const targetY = -(y * 3000) + window.innerHeight / 2;

        if (window.canvasState) {
            window.canvasState.panX = targetX;
            window.canvasState.panY = targetY;
            window.updateCanvasTransform?.();
            window.updateMinimap?.();
        }
    });
}

function updateMinimap() {
    const viewport = document.getElementById('minimapViewport');
    const minimap = document.getElementById('minimap');

    if (!viewport || !minimap || !window.canvasState) return;

    const state = window.canvasState;
    const minimapWidth = minimap.offsetWidth;
    const minimapHeight = minimap.offsetHeight;

    const viewportWidth = (window.innerWidth / state.scale) / 4000 * minimapWidth;
    const viewportHeight = (window.innerHeight / state.scale) / 3000 * minimapHeight;

    const viewportX = (-state.panX / state.scale) / 4000 * minimapWidth;
    const viewportY = (-state.panY / state.scale) / 3000 * minimapHeight;

    viewport.style.width = viewportWidth + 'px';
    viewport.style.height = viewportHeight + 'px';
    viewport.style.left = viewportX + 'px';
    viewport.style.top = viewportY + 'px';
}

/* ==========================================
   PARTICLES
   ========================================== */
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';

        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 20 + 15) + 's';

        const colors = ['#8b5cf6', '#06b6d4', '#f472b6'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        particlesContainer.appendChild(particle);
    }
}

/* ==========================================
   DRAGGABLE ELEMENTS
   ========================================== */
document.querySelectorAll('[data-drag="true"]').forEach(el => {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    el.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isDragging = true;

        const rect = el.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        initialX = rect.left;
        initialY = rect.top;

        el.style.position = 'fixed';
        el.style.zIndex = 1000;
        el.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        el.style.left = initialX + (e.clientX - startX) + 'px';
        el.style.top = initialY + (e.clientY - startY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;

        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.zIndex = '';
        el.style.cursor = 'grab';
    });
});
