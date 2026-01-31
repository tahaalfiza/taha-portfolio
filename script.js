/* ==========================================
   TAHA WORK - INFINITE CANVAS PORTFOLIO
   Interactive Canvas Engine
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initCanvas();
    initCustomCursor();
    initNavigation();
    initZoomControls();
    initMinimap();
    checkViewFromUrl();
});

/* ==========================================
   CHECK URL FOR VIEW PARAMETER
   ========================================== */
function checkViewFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');

    if (view === 'list') {
        // Switch to list view after a small delay (after canvas init)
        setTimeout(() => {
            const listViewBtn = document.getElementById('listViewBtn');
            if (listViewBtn) {
                listViewBtn.click();
            }
        }, 100);
    } else if (view === 'stage') {
        // Switch to stage view after a small delay
        setTimeout(() => {
            const stageViewBtn = document.getElementById('stageViewBtn');
            if (stageViewBtn) {
                stageViewBtn.click();
            }
        }, 100);
    }
    // 'canvas' is the default view, no action needed
}

/* ==========================================
   LOADING SCREEN WITH PROGRESS
   ========================================== */
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    let progress = 0;
    const duration = 1800; // Total loading time in ms
    const interval = 30; // Update every 30ms
    const increment = 100 / (duration / interval);

    const progressInterval = setInterval(() => {
        // Add some randomness to make it feel more natural
        const randomIncrement = increment * (0.5 + Math.random());
        progress = Math.min(100, progress + randomIncrement);

        // Update UI
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) progressText.textContent = Math.floor(progress) + '%';

        // Complete loading
        if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 200);
        }
    }, interval);
}

/* ==========================================
   INFINITE CANVAS ENGINE - Mobile Enhanced
   ========================================== */
function initCanvas() {
    const container = document.getElementById('canvasContainer');
    const canvas = document.getElementById('canvas');
    const isMobile = window.innerWidth <= 768;

    let state = {
        scale: isMobile ? 0.6 : 1,
        minScale: isMobile ? 0.25 : 0.3,
        maxScale: 2,
        panX: 0,
        panY: 0,
        isDragging: false,
        isPinching: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        velocity: { x: 0, y: 0 },
        friction: 0.92,
        lastPinchDistance: 0,
        lastPinchCenter: { x: 0, y: 0 }
    };

    // Center on home section initially
    const homeSection = document.getElementById('section-home');
    if (homeSection) {
        state.panX = -(parseFloat(homeSection.style.left) / 100 * 2800) * state.scale + window.innerWidth / 2;
        state.panY = -(parseFloat(homeSection.style.top) / 100 * 2000) * state.scale + window.innerHeight / 2;
    }

    updateTransform();
    updateZoomLevel();

    // Mouse events
    container.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Touch events - Enhanced for mobile
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Wheel event
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Keyboard
    document.addEventListener('keydown', handleKeyboard);

    // Handle window resize
    window.addEventListener('resize', () => {
        const wasMobile = isMobile;
        const nowMobile = window.innerWidth <= 768;
        if (wasMobile !== nowMobile) {
            location.reload();
        }
    });

    function startDrag(e) {
        if (e.target.closest('button, a, input, textarea, .floating-note, .draggable-note')) return;

        state.isDragging = true;
        state.startX = e.clientX - state.panX;
        state.startY = e.clientY - state.panY;
        state.lastX = e.clientX;
        state.lastY = e.clientY;
        state.velocity = { x: 0, y: 0 };

        container.style.cursor = 'grabbing';
        document.getElementById('cursor')?.classList.add('cursor-drag');
    }

    // Enhanced touch handling with pinch-to-zoom
    function handleTouchStart(e) {
        if (e.target.closest('button, a, input, textarea, .floating-note, .draggable-note')) return;

        if (e.touches.length === 1) {
            // Single touch - pan
            const touch = e.touches[0];
            state.isDragging = true;
            state.isPinching = false;
            state.startX = touch.clientX - state.panX;
            state.startY = touch.clientY - state.panY;
            state.lastX = touch.clientX;
            state.lastY = touch.clientY;
            state.velocity = { x: 0, y: 0 };
        } else if (e.touches.length === 2) {
            // Two finger - pinch zoom
            e.preventDefault();
            state.isDragging = false;
            state.isPinching = true;
            state.lastPinchDistance = getPinchDistance(e.touches);
            state.lastPinchCenter = getPinchCenter(e.touches);
        }
    }

    function handleTouchMove(e) {
        if (e.touches.length === 1 && state.isDragging) {
            e.preventDefault();
            const touch = e.touches[0];

            const dx = touch.clientX - state.lastX;
            const dy = touch.clientY - state.lastY;

            state.velocity.x = dx * 0.8;
            state.velocity.y = dy * 0.8;

            state.panX = touch.clientX - state.startX;
            state.panY = touch.clientY - state.startY;
            state.lastX = touch.clientX;
            state.lastY = touch.clientY;

            updateTransform();
            updateMinimap();
        } else if (e.touches.length === 2 && state.isPinching) {
            e.preventDefault();

            const newDistance = getPinchDistance(e.touches);
            const newCenter = getPinchCenter(e.touches);

            // Calculate zoom
            const scaleFactor = newDistance / state.lastPinchDistance;
            const oldScale = state.scale;
            const newScale = Math.max(state.minScale, Math.min(state.maxScale, oldScale * scaleFactor));

            // Zoom toward pinch center
            const canvasX = (newCenter.x - state.panX) / oldScale;
            const canvasY = (newCenter.y - state.panY) / oldScale;

            state.scale = newScale;
            state.panX = newCenter.x - canvasX * newScale;
            state.panY = newCenter.y - canvasY * newScale;

            // Also pan with pinch movement
            state.panX += newCenter.x - state.lastPinchCenter.x;
            state.panY += newCenter.y - state.lastPinchCenter.y;

            state.lastPinchDistance = newDistance;
            state.lastPinchCenter = newCenter;

            updateTransform();
            updateZoomLevel();
            updateMinimap();
        }
    }

    function handleTouchEnd(e) {
        if (e.touches.length === 0) {
            if (state.isDragging) {
                state.isDragging = false;
                applyMomentum();
            }
            state.isPinching = false;
        } else if (e.touches.length === 1) {
            // Went from 2 touches to 1
            state.isPinching = false;
            const touch = e.touches[0];
            state.isDragging = true;
            state.startX = touch.clientX - state.panX;
            state.startY = touch.clientY - state.panY;
            state.lastX = touch.clientX;
            state.lastY = touch.clientY;
        }
    }

    function getPinchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getPinchCenter(touches) {
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
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

    // Improved zoom and scroll handling
    function handleWheel(e) {
        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
            // Zoom toward mouse position
            const oldScale = state.scale;
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(state.minScale, Math.min(state.maxScale, oldScale * zoomFactor));

            // Get mouse position relative to viewport
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Calculate the point on canvas under mouse before zoom
            const canvasX = (mouseX - state.panX) / oldScale;
            const canvasY = (mouseY - state.panY) / oldScale;

            // Update scale
            state.scale = newScale;

            // Adjust pan so the same canvas point stays under mouse
            state.panX = mouseX - canvasX * newScale;
            state.panY = mouseY - canvasY * newScale;

            updateZoomLevel();
        } else {
            // Pan - direction aligned with scroll
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

        // For home section, adjust scale to show the full card (like resetZoom)
        if (sectionId === 'home') {
            const sectionHeight = section.offsetHeight;
            const viewportHeight = window.innerHeight;
            const padding = 100;
            const idealScale = (viewportHeight - padding) / sectionHeight;
            const targetScale = Math.min(1.2, Math.max(0.7, idealScale));

            // Get section position
            const sectionX = parseFloat(section.style.left) / 100 * 2800;
            const sectionY = parseFloat(section.style.top) / 100 * 2000;

            // Calculate pan to center section on screen with new scale
            const targetX = -sectionX * targetScale + window.innerWidth / 2;
            const targetY = -sectionY * targetScale + window.innerHeight / 2;

            animateToPositionAndScale(targetX, targetY, targetScale);
            return;
        }

        // Get section position in canvas coordinates (top-left corner)
        const sectionX = parseFloat(section.style.left) / 100 * 2800;
        const sectionY = parseFloat(section.style.top) / 100 * 2000;

        // Get section dimensions to find center
        const sectionWidth = section.offsetWidth;
        const sectionHeight = section.offsetHeight;

        // Calculate the center of the section in canvas coordinates
        const centerX = sectionX + sectionWidth / 2;
        const centerY = sectionY + sectionHeight / 2;

        // Calculate pan to center section on screen (accounting for scale)
        const targetX = -centerX * state.scale + window.innerWidth / 2;
        const targetY = -centerY * state.scale + window.innerHeight / 2;

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

    function animateToPositionAndScale(targetX, targetY, targetScale) {
        const startX = state.panX;
        const startY = state.panY;
        const startScale = state.scale;
        const duration = 800;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);

            state.panX = startX + (targetX - startX) * eased;
            state.panY = startY + (targetY - startY) * eased;
            state.scale = startScale + (targetScale - startScale) * eased;

            updateTransform();
            updateZoomLevel();
            updateMinimap();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    window.zoomIn = function () {
        const oldScale = state.scale;
        const newScale = Math.min(state.maxScale, oldScale * 1.2);

        // Zoom toward center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Calculate canvas point at center
        const canvasX = (centerX - state.panX) / oldScale;
        const canvasY = (centerY - state.panY) / oldScale;

        state.scale = newScale;

        // Keep center point fixed
        state.panX = centerX - canvasX * newScale;
        state.panY = centerY - canvasY * newScale;

        updateTransform();
        updateZoomLevel();
        updateMinimap();
    };

    window.zoomOut = function () {
        const oldScale = state.scale;
        const newScale = Math.max(state.minScale, oldScale / 1.2);

        // Zoom toward center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Calculate canvas point at center
        const canvasX = (centerX - state.panX) / oldScale;
        const canvasY = (centerY - state.panY) / oldScale;

        state.scale = newScale;

        // Keep center point fixed
        state.panX = centerX - canvasX * newScale;
        state.panY = centerY - canvasY * newScale;

        updateTransform();
        updateZoomLevel();
        updateMinimap();
    };

    window.resetZoom = function () {
        const isMobile = window.innerWidth <= 768;

        // Center on home section and show it fully
        const homeSection = document.getElementById('section-home');
        if (homeSection) {
            // Get section dimensions
            const sectionHeight = homeSection.offsetHeight;

            // Calculate scale to fit the home section with padding
            const viewportHeight = window.innerHeight;
            const padding = 100; // Extra padding around the card
            const idealScale = (viewportHeight - padding) / sectionHeight;

            // Clamp scale between reasonable bounds
            state.scale = isMobile
                ? Math.min(0.8, Math.max(0.5, idealScale))
                : Math.min(1.2, Math.max(0.7, idealScale));

            // Get section position (it uses transform: translate(-50%, -50%) so center is at left/top)
            const sectionX = parseFloat(homeSection.style.left) / 100 * 2800;
            const sectionY = parseFloat(homeSection.style.top) / 100 * 2000;

            // Calculate pan to center section on screen
            state.panX = -sectionX * state.scale + window.innerWidth / 2;
            state.panY = -sectionY * state.scale + window.innerHeight / 2;
        }

        updateTransform();
        updateZoomLevel();
        updateMinimap();
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
        cursorX += (mouseX - cursorX) * 0.5;
        cursorY += (mouseY - cursorY) * 0.5;

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
            const listView = document.getElementById('listView');
            const isListViewActive = listView?.classList.contains('active');

            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // If in list view, scroll to list section
            if (isListViewActive) {
                const listSection = document.getElementById(`list-${target}`);
                if (listSection) {
                    listSection.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }

            // Otherwise navigate on canvas
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
   ZOOM CONTROLS & VIEW TOGGLE
   ========================================== */
function initZoomControls() {
    document.getElementById('zoomIn')?.addEventListener('click', () => window.zoomIn?.());
    document.getElementById('zoomOut')?.addEventListener('click', () => window.zoomOut?.());
    document.getElementById('zoomReset')?.addEventListener('click', () => window.resetZoom?.());

    // View sprite buttons
    const canvasViewBtn = document.getElementById('canvasViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const stageViewBtn = document.getElementById('stageViewBtn');
    const listView = document.getElementById('listView');
    const stageView = document.getElementById('stageView');
    const canvasContainer = document.getElementById('canvasContainer');
    const minimap = document.getElementById('minimap');
    const navbar = document.querySelector('.navbar');
    const zoomControls = document.querySelector('.zoom-controls');

    // Function to clear all view states
    function clearAllViews() {
        listView?.classList.remove('active');
        stageView?.classList.remove('active');
        canvasContainer.style.display = 'none';
        minimap?.style.setProperty('display', 'none');
        canvasViewBtn?.classList.remove('active');
        listViewBtn?.classList.remove('active');
        stageViewBtn?.classList.remove('active');
    }

    // Function to switch to canvas view
    function switchToCanvasView() {
        clearAllViews();
        canvasContainer.style.display = 'block';
        minimap?.style.setProperty('display', 'block');
        navbar?.style.setProperty('display', 'flex');
        canvasViewBtn?.classList.add('active');
        document.body.style.overflow = 'hidden';
        history.pushState({}, '', '/view_1/');
    }

    // Function to switch to list view
    function switchToListView() {
        clearAllViews();
        listView?.classList.add('active');
        navbar?.style.setProperty('display', 'flex');
        listViewBtn?.classList.add('active');
        document.body.style.overflow = 'auto';
        initListViewContent();
        history.pushState({}, '', '/view_2/');
    }

    // Function to switch to stage view
    function switchToStageView() {
        clearAllViews();
        stageView?.classList.add('active');
        navbar?.style.setProperty('display', 'none'); // Hide navbar in stage view
        stageViewBtn?.classList.add('active');
        document.body.style.overflow = 'hidden';
        initStageView();
        history.pushState({}, '', '/view_3/');
    }

    // Canvas view button click
    if (canvasViewBtn) {
        canvasViewBtn.addEventListener('click', switchToCanvasView);
    }

    // List view button click
    if (listViewBtn && listView) {
        listViewBtn.addEventListener('click', switchToListView);
    }

    // Stage view button click
    if (stageViewBtn && stageView) {
        stageViewBtn.addEventListener('click', switchToStageView);
    }

    // List view form submission
    const listContactForm = document.getElementById('listContactForm');
    if (listContactForm) {
        listContactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('listName').value,
                email: document.getElementById('listEmail').value,
                message: document.getElementById('listMessage').value
            };

            try {
                await fetch('https://formspree.io/f/mpqrkbyd', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(formData)
                });
                alert('Message sent! Thank you for reaching out.');
                listContactForm.reset();
            } catch (error) {
                alert('Message sent! Thank you for reaching out.');
                listContactForm.reset();
            }
        });
    }
}

// Initialize Stage View
let stageViewInitialized = false;
let currentStageSection = 'home';

// Section icons - EXACT same as navbar (filled style)
const sectionIcons = {
    home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 9v12h5v-7h6v7h5V9l-8-6z" fill="currentColor"/>
    </svg>`,
    about: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill="currentColor"/>
        <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" fill="currentColor"/>
    </svg>`,
    projects: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" fill="currentColor"/>
    </svg>`,
    blog: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
    </svg>`,
    contact: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
    </svg>`
};

// Map sections to their canvas element selectors for cloning
const sectionSelectors = {
    home: '#section-home .hero-section',
    about: '#section-about .about-card-modern',
    projects: '#section-projects .finder-window',
    blog: '#section-blog .notes-app-window',
    contact: '#section-contact .contact-section',
    hire: '#section-hire .hire-form-window'
};

const sectionNames = {
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    blog: 'Blog',
    contact: 'Contact',
    hire: 'New Project'
};

function initStageView() {
    const stageContent = document.getElementById('stageContent');
    const stageSidebar = document.getElementById('stageSidebar');

    if (!stageContent || !stageSidebar) return;

    // Generate sidebar thumbnails with mini previews
    generateStageThumbnails(stageSidebar);

    // Load initial section
    if (!stageViewInitialized) {
        setActiveStageSection('home');
        stageViewInitialized = true;
    }
}

function generateStageThumbnails(sidebar) {
    const sections = ['home', 'about', 'projects', 'blog', 'hire', 'contact'];

    sidebar.innerHTML = sections.map((section, index) => `
        <div class="stage-thumb ${index === 0 ? 'active' : ''}" data-section="${section}">
            <div class="thumb-preview">
                <div class="thumb-content" id="thumbContent-${section}">
                    <!-- Mini preview will be rendered here -->
                </div>
            </div>
            <div class="thumb-tooltip">${sectionNames[section]}</div>
        </div>
    `).join('');

    // Set up click handlers
    const stageThumbs = sidebar.querySelectorAll('.stage-thumb');
    stageThumbs.forEach(thumb => {
        thumb.addEventListener('click', () => {
            const section = thumb.dataset.section;
            setActiveStageSection(section);

            // Update active thumbnail
            stageThumbs.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    // Clone actual section content for each thumbnail
    sections.forEach(section => {
        cloneSectionForThumb(section);
    });
}

function cloneSectionForThumb(section) {
    const thumbContent = document.getElementById(`thumbContent-${section}`);
    const thumbPreview = thumbContent?.parentElement;
    if (!thumbContent || !thumbPreview) return;

    // Set consistent container size for all thumbs
    const maxWidth = 160;
    const maxHeight = 200;
    thumbPreview.style.width = maxWidth + 'px';
    thumbPreview.style.height = maxHeight + 'px';

    // Custom clean thumbnails for Home and About
    if (section === 'home') {
        thumbContent.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 16px; text-align: center;">
                <div style="width: 70px; height: 70px; margin-bottom: 12px;">
                    <svg width="100%" height="100%" viewBox="0 0 981 982" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M490.5 0.612411C761.12 0.612411 980.5 219.993 980.5 490.612C980.5 761.232 761.12 980.612 490.5 980.612C219.88 980.612 0.5 761.232 0.5 490.612C0.5 219.993 219.88 0.612411 490.5 0.612411Z" stroke="black"/>
                        <mask id="mask0_thumb" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="981" height="981">
                            <path d="M490.5 980.543C761.396 980.543 981 761.041 981 490.272C981 219.502 761.396 0 490.5 0C219.604 0 0 219.502 0 490.272C0 761.041 219.604 980.543 490.5 980.543Z" fill="#D9D9D9"/>
                        </mask>
                        <g mask="url(#mask0_thumb)">
                            <g opacity="0.5"><path d="M475.812 709.922C475.812 709.922 336.224 748.244 329.788 731.314C323.353 714.395 329.788 618.516 329.788 618.516C329.788 618.516 450.553 705.448 475.812 709.922Z" fill="black"/></g>
                            <g opacity="0.5"><path d="M491.356 615.184C491.356 624.864 483.505 632.711 473.821 632.711C464.136 632.711 456.286 624.864 456.286 615.184C456.286 605.504 465.216 614.943 474.9 614.943C484.585 614.943 491.366 605.504 491.366 615.184H491.356Z" fill="black"/></g>
                            <path d="M361.128 123.163C361.128 123.163 545.073 -2.8565 652.128 173.094C673.761 208.65 677 253.468 656.226 289.538C653.69 293.949 654.088 299.313 650.724 303.618C650.724 303.618 656.226 201.663 525.4 237.534C525.4 237.534 474.776 260.33 432.39 239.618C411.983 229.645 388.505 226.544 366.347 231.531C339.086 237.67 310.933 256.569 307.349 307.61L295.935 415.212C295.935 415.212 250.299 216.57 320.964 207.739C320.964 207.739 284.164 160.658 331.267 110.623V129.753C331.267 129.753 359.241 107.679 381.315 138.585" fill="black"/>
                            <path d="M653.385 274.462L667.126 209.802C667.126 209.802 702.972 364.737 663.95 427.637C663.95 427.637 661.875 365.606 653.092 323.617C649.696 307.4 649.947 290.669 653.396 274.462H653.385Z" fill="black"/>
                            <path d="M296.929 522.605C296.562 522.605 296.196 522.563 295.818 522.479C277.56 518.31 254.491 502.029 248.307 448.129C244.125 411.723 248.59 389.964 261.953 381.583C275.757 372.94 292.548 383.374 293.25 383.825C295.567 385.292 296.248 388.34 294.791 390.655C293.345 392.981 290.274 393.683 287.947 392.216C287.832 392.133 275.673 384.684 267.204 390.016C261.786 393.442 253.401 405.385 258.18 447.008C262.132 481.412 273.755 503.308 291.961 510.861V496.875C291.961 494.13 294.183 491.909 296.929 491.909C299.675 491.909 301.897 494.13 301.897 496.875V517.639C301.897 519.148 301.206 520.583 300.021 521.515C299.13 522.228 298.04 522.605 296.929 522.605Z" fill="black"/>
                            <path d="M323.352 380.441C323.352 380.441 350.572 346.78 360.141 346.78C360.141 346.78 424.926 355.612 442.587 370.509V386.506C442.587 386.506 364.753 364.433 352.05 370.509L323.342 380.441H323.352Z" fill="black"/>
                            <path d="M504.971 400.304V379.886C504.971 379.886 531.321 364.79 563.917 364.737C584.848 364.706 605.182 373.841 618.367 390.09C622.099 394.689 625.17 399.749 626.427 404.903C626.427 404.903 582.26 369.41 504.982 400.304H504.971Z" fill="black"/>
                            <path d="M451.978 518.383C449.284 518.383 447.073 516.224 447.01 513.522C446.947 510.777 449.127 508.503 451.873 508.451C481.084 507.822 488.316 502.102 490.014 498.75C491.88 495.083 489.836 489.08 483.788 480.385C470.708 461.622 464.88 394.5 464.262 386.915C464.042 384.181 466.075 381.782 468.811 381.562C471.504 381.362 473.947 383.374 474.167 386.098C475.791 405.992 482.153 460.679 491.932 474.696C497.257 482.344 503.766 493.606 498.871 503.244C493.913 512.987 479.051 517.796 452.083 518.372H451.978V518.383Z" fill="black"/>
                            <path d="M473.811 648.771C389.5 655.392 323.353 614.954 323.353 614.954C403.398 725.311 486.21 709.859 486.21 709.859C586.683 699.927 626.428 614.954 626.428 614.954C626.428 614.954 550.25 650.269 473.821 648.771H473.811Z" fill="black"/>
                            <path d="M472.657 620.15C463.276 620.15 457.428 618.128 457.061 617.992C454.472 617.081 453.131 614.242 454.043 611.654C454.954 609.077 457.784 607.694 460.363 608.626C460.468 608.658 471.588 612.356 487.677 608.27C490.328 607.568 493.043 609.192 493.714 611.853C494.395 614.514 492.792 617.217 490.129 617.898C483.516 619.585 477.594 620.15 472.657 620.15Z" fill="black"/>
                            <path d="M283.524 465.52C281.302 465.52 279.29 464.022 278.713 461.79C273.808 442.608 278.42 429.282 278.619 428.727C279.531 426.139 282.382 424.746 284.96 425.71C287.539 426.621 288.891 429.439 287.989 432.027C287.947 432.132 284.237 443.268 288.335 459.328C289.016 461.989 287.413 464.692 284.751 465.373C284.342 465.478 283.923 465.53 283.514 465.53L283.524 465.52Z" fill="black"/>
                            <path d="M681.338 465.53C680.782 465.53 680.227 465.447 679.671 465.248C677.093 464.326 675.741 461.508 676.642 458.92C676.684 458.815 680.395 447.679 676.296 431.619C675.615 428.958 677.219 426.255 679.881 425.574C682.543 424.882 685.247 426.496 685.918 429.157C690.813 448.339 686.212 461.665 686.012 462.22C685.289 464.252 683.371 465.53 681.327 465.53H681.338Z" fill="black"/>
                            <path d="M301.876 495.849C301.876 495.849 312.273 591.257 336.055 620.465C336.055 620.465 387.948 676.744 523.376 702.17C523.376 702.17 522.411 702.495 520.483 703.071C422.274 732.352 318.342 664.329 305.503 562.709C297.338 498.038 298.113 531.301 301.876 495.849Z" fill="black"/>
                            <path d="M400.799 556.978L454.504 550.86C468.664 549.247 482.971 549.351 497.11 551.153L554.432 558.487C554.432 558.487 553.499 542.835 538.91 541.326C538.91 541.326 508.755 529.886 475.823 529.268C444.191 528.681 409.928 538.791 400.799 544.354C400.799 544.354 392.728 548.398 400.799 556.978Z" fill="black"/>
                            <path d="M626.427 796.855C623.681 796.855 621.459 794.634 621.459 791.889V642.412C621.459 627.536 624.603 613.225 630.819 599.868C641.96 575.888 660.365 531.594 660.9 499.662V496.865C660.9 494.141 663.101 491.92 665.826 491.899H665.868C668.572 491.899 670.794 494.067 670.836 496.781C670.847 497.734 670.847 498.688 670.836 499.662V510.851C689.042 503.297 700.666 481.402 704.617 446.997C709.396 405.385 701.011 393.432 695.593 390.016C687.134 384.642 674.966 392.133 674.85 392.206C672.524 393.673 669.453 392.971 668.006 390.645C666.549 388.34 667.231 385.281 669.547 383.814C670.249 383.354 687.071 372.909 700.854 381.573C714.218 389.954 718.683 411.713 714.501 448.118C708.464 500.699 686.369 517.482 668.331 522.134C662.703 551.719 648.93 584.478 639.843 604.048C634.246 616.075 631.406 628.971 631.406 642.402V791.878C631.406 794.623 629.184 796.844 626.438 796.844L626.427 796.855Z" fill="black"/>
                            <path d="M329.788 796.855C327.041 796.855 324.819 794.634 324.819 791.889V623.534C324.819 620.789 327.041 618.568 329.788 618.568C332.534 618.568 334.756 620.789 334.756 623.534V791.889C334.756 794.634 332.534 796.855 329.788 796.855Z" fill="black"/>
                            <path d="M700.729 1045.67C521.175 1114.1 118.539 937.604 153.117 889.036C187.202 841.264 325.418 784.346 329.694 782.659C322.734 788.515 318.961 794.874 318.961 801.527C318.961 830.232 389.217 853.469 475.865 853.469C562.513 853.469 632.769 830.232 632.769 801.527C632.769 795.671 629.792 790.003 624.321 784.744C672.22 798.049 800.405 867.381 800.405 867.381C800.405 867.381 880.398 977.33 700.74 1045.67H700.729Z" fill="black"/>
                            <path d="M665.857 508.179C663.111 508.179 660.889 505.958 660.889 503.213V478.468C660.889 475.724 663.111 473.503 665.857 473.503C668.603 473.503 670.825 475.724 670.825 478.468V503.213C670.825 505.958 668.603 508.179 665.857 508.179Z" fill="black"/>
                            <path d="M419.497 429.072C418.229 429.072 416.95 428.591 415.986 427.616C401.207 412.834 377.142 412.824 362.353 427.616C360.414 429.554 357.27 429.554 355.331 427.616C353.392 425.678 353.392 422.535 355.331 420.597C373.998 401.949 404.362 401.949 423.019 420.597C424.958 422.535 424.958 425.678 423.019 427.616C422.044 428.591 420.776 429.072 419.507 429.072H419.497Z" fill="black"/>
                            <path d="M591.368 435.348C590.1 435.348 588.821 434.866 587.857 433.891C573.068 419.099 549.013 419.099 534.224 433.891C532.285 435.829 529.141 435.829 527.202 433.891C525.263 431.953 525.263 428.81 527.202 426.872C545.858 408.224 576.212 408.235 594.879 426.872C596.818 428.81 596.818 431.953 594.879 433.891C593.904 434.866 592.636 435.348 591.368 435.348Z" fill="black"/>
                            <path d="M475.823 588.218C453.927 588.218 432.043 584.992 410.755 578.528C408.135 577.732 406.647 574.955 407.443 572.326C408.24 569.707 410.996 568.23 413.648 569.015C454.315 581.377 497.32 581.377 537.997 569.015C540.66 568.219 543.406 569.707 544.202 572.326C544.999 574.955 543.521 577.732 540.89 578.528C519.613 584.992 497.708 588.218 475.823 588.218Z" fill="black"/>
                        </g>
                    </svg>
                </div>
                <p style="font-size: 11px; color: #666; margin: 0 0 4px 0;">hey, this is</p>
                <h2 style="font-size: 24px; font-weight: 700; margin: 0; line-height: 1.1;">Taha's</h2>
                <h2 style="font-size: 24px; font-weight: 700; margin: 0; line-height: 1.1;">Work</h2>
            </div>
        `;
        thumbContent.style.transform = 'none';
        return;
    }

    if (section === 'about') {
        thumbContent.innerHTML = `
            <div style="display: flex; flex-direction: column; padding: 14px; height: 100%; box-sizing: border-box;">
                <div style="font-size: 16px; margin-bottom: 8px;">🇮🇶🇹🇷</div>
                <p style="font-size: 11px; line-height: 1.4; margin: 0; color: #333;">
                    I'm a Brand & Product Designer with 10+ years of experience crafting brand identities and digital products. Based in Istanbul, I've worked with clients across the MENA & Gulf regions, helping businesses establish strong visual identities and create meaningful digital experiences.
                </p>
            </div>
        `;
        thumbContent.style.transform = 'none';
        return;
    }

    // Custom thumbnail for Hire/New Project
    if (section === 'hire') {
        thumbContent.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 12px; text-align: center; box-sizing: border-box;">
                <div style="background: #f5f5f7; border-radius: 8px; padding: 10px; width: 100%; box-sizing: border-box;">
                    <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                        <span style="width: 6px; height: 6px; background: #ff5f56; border-radius: 50%;"></span>
                        <span style="width: 6px; height: 6px; background: #ffbd2e; border-radius: 50%;"></span>
                        <span style="width: 6px; height: 6px; background: #27ca3f; border-radius: 50%;"></span>
                        <span style="font-size: 8px; color: #666; margin-left: auto;">New Project</span>
                    </div>
                    <h3 style="font-size: 11px; font-weight: 600; margin: 0 0 4px 0; text-align: left;">Start a Project</h3>
                    <p style="font-size: 7px; color: #666; margin: 0 0 8px 0; text-align: left;">Tell me about your project</p>
                    <div style="background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 4px 6px; margin-bottom: 4px; text-align: left;">
                        <span style="font-size: 6px; color: #999;">NAME</span>
                    </div>
                    <div style="background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 4px 6px; margin-bottom: 4px; text-align: left;">
                        <span style="font-size: 6px; color: #999;">EMAIL</span>
                    </div>
                    <div style="background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 4px 6px; margin-bottom: 6px; text-align: left;">
                        <span style="font-size: 6px; color: #999;">MESSAGE</span>
                    </div>
                    <div style="background: #6366f1; color: white; border-radius: 4px; padding: 4px; font-size: 7px; text-align: center;">Send Message ✈</div>
                </div>
            </div>
        `;
        thumbContent.style.transform = 'none';
        return;
    }

    // Custom thumbnail for Contact
    if (section === 'contact') {
        thumbContent.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 16px; text-align: center; box-sizing: border-box;">
                <h3 style="font-size: 12px; font-weight: 700; margin: 0 0 6px 0;">Let's Create Something Amazing</h3>
                <p style="font-size: 8px; color: #666; margin: 0 0 12px 0;">I'm always open to discussing new projects and opportunities.</p>
                <div style="display: flex; flex-direction: column; gap: 6px; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 8px; background: #f5f5f7; border-radius: 20px; padding: 6px 10px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6L12 13L2 6"/></svg>
                        <span style="font-size: 8px;">taha.alfiza@gmail.com</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; background: #f5f5f7; border-radius: 20px; padding: 6px 10px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        <span style="font-size: 8px;">LinkedIn</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; background: #f5f5f7; border-radius: 20px; padding: 6px 10px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/></svg>
                        <span style="font-size: 8px;">Instagram</span>
                    </div>
                </div>
            </div>
        `;
        thumbContent.style.transform = 'none';
        return;
    }

    // For other sections, clone the original content
    const selector = sectionSelectors[section];
    const originalSection = document.querySelector(selector);

    if (originalSection) {
        const clone = originalSection.cloneNode(true);
        clone.style.pointerEvents = 'none';
        clone.style.transform = 'none';
        clone.style.position = 'relative';
        clone.style.left = 'auto';
        clone.style.top = 'auto';
        clone.style.margin = '0';
        clone.style.boxShadow = 'none';

        thumbContent.appendChild(clone);
    }
}

function setActiveStageSection(section) {
    const stageContent = document.getElementById('stageContent');
    if (!stageContent) return;

    currentStageSection = section;

    // Remove background for hire section, add it back for others
    if (section === 'hire') {
        stageContent.classList.add('no-bg');
    } else {
        stageContent.classList.remove('no-bg');
    }

    // Generate content based on section
    let content = '';

    switch(section) {
        case 'home':
            content = `
                <div class="stage-content-inner">
                    <div class="stage-section stage-home">
                        <div class="hero-logo">
                            <svg width="100" height="100" viewBox="0 0 257 258" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M128.5 0.52948C199.192 0.52948 256.5 57.837 256.5 128.529C256.5 199.222 199.192 256.529 128.5 256.529C57.8076 256.529 0.5 199.222 0.5 128.529C0.5 57.837 57.8076 0.52948 128.5 0.52948Z" stroke="currentColor"/>
                            </svg>
                        </div>
                        <p class="hero-greeting">hey, this is</p>
                        <h1 class="hero-title">
                            <span class="title-line">Taha's</span>
                            <span class="title-line accent">Work</span>
                        </h1>
                        <p class="hero-subtitle">Brand & Product Designer</p>
                        <div class="hero-cta">
                            <button class="btn btn-primary" onclick="document.querySelector('.stage-thumb[data-section=projects]').click()">Projects</button>
                            <button class="btn btn-ghost" onclick="document.querySelector('.stage-thumb[data-section=about]').click()">Resume</button>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'about':
            const aboutHtml = document.querySelector('#section-about .about-card-modern')?.outerHTML || '';
            content = `
                <div class="stage-content-inner">
                    <div class="stage-section stage-about">
                        ${aboutHtml}
                    </div>
                </div>
            `;
            break;

        case 'projects':
            const projectsHtml = document.querySelector('#section-projects .finder-window')?.outerHTML || '';
            content = `
                <div class="stage-content-inner">
                    <div class="stage-section stage-projects">
                        ${projectsHtml}
                    </div>
                </div>
            `;
            break;

        case 'blog':
            const blogHtml = document.querySelector('#section-blog .notes-app-window')?.outerHTML || '';
            content = `
                <div class="stage-content-inner">
                    <div class="stage-section stage-blog">
                        ${blogHtml}
                    </div>
                </div>
            `;
            break;

        case 'contact':
            content = `
                <div class="stage-content-inner">
                    <div class="stage-section stage-contact">
                        <div class="contact-card">
                            <h2>Let's Create Something Amazing</h2>
                            <p>I'm always open to discussing new projects and opportunities.</p>
                            <div class="contact-links">
                                <a href="mailto:taha.alfiza@gmail.com" class="contact-link">
                                    <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                                        <path d="M22 6L12 13L2 6"/>
                                    </svg>
                                    <span>taha.alfiza@gmail.com</span>
                                </a>
                                <a href="https://www.linkedin.com/in/tahaalfiza/" target="_blank" class="contact-link">
                                    <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                    <span>LinkedIn</span>
                                </a>
                                <a href="https://www.instagram.com/tahaalfiza/" target="_blank" class="contact-link">
                                    <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                        <rect x="2" y="2" width="20" height="20" rx="5"/>
                                        <circle cx="12" cy="12" r="4"/>
                                        <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none"/>
                                    </svg>
                                    <span>Instagram</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'hire':
            const hireHtml = document.querySelector('#section-hire .hire-form-window')?.outerHTML || '';
            content = `
                <div class="stage-content-inner" style="display: flex; align-items: center; justify-content: center; height: 100%;">
                    ${hireHtml}
                </div>
            `;
            break;
    }

    stageContent.innerHTML = content;
}

// Initialize list view content from Sanity data
let listViewInitialized = false;

function initListViewContent() {
    // Always try to populate if data is available (retry on each toggle)
    populateListView();

    // Initialize list blog search
    initListBlogSearch();

    // If data isn't loaded yet, wait for it
    if (!listViewInitialized && (!window.projectsData || window.projectsData.length === 0)) {
        // Check again after a short delay (Sanity data might still be loading)
        setTimeout(populateListView, 500);
        setTimeout(populateListView, 1500);
    }

    listViewInitialized = true;
}

function populateListView() {
    // Populate about section bio
    if (window.aboutInfo) {
        const bioEl = document.getElementById('listAboutBio');
        if (bioEl && window.aboutInfo.shortBio) {
            bioEl.innerHTML = window.aboutInfo.shortBio;
        }
    }

    // Populate projects (same mac-folder style as canvas finder)
    if (window.projectsData && window.projectsData.length > 0) {
        const projectsGrid = document.getElementById('listProjectsGrid');
        const finderCount = document.getElementById('listFinderCount');
        if (projectsGrid) {
            projectsGrid.innerHTML = window.projectsData.map((project, index) => {
                // Get up to 3 images for popup preview
                const images = project.images || [];
                const imageHtml = images.slice(0, 3).map((img, i) => {
                    const url = window.sanityImageUrl?.(img, 400, 85) || '';
                    return url ? `<img class="popup-img img-${i + 1}" src="${url}" alt="Preview ${i + 1}">` : '';
                }).join('');

                // Determine click behavior
                let clickHandler = '';
                if (project.projectUrl && !project.hasOverlay) {
                    clickHandler = `onclick="window.open('${project.projectUrl}', '_blank')"`;
                } else {
                    clickHandler = `onclick="openProjectOverlay(${index})"`;
                }

                // Custom folder colors
                const formatColor = (color) => {
                    if (!color) return null;
                    if (color.includes('gradient') || color.includes('rgb') || color.startsWith('#')) return color;
                    return `#${color}`;
                };
                const tabColor = formatColor(project.folderTabColor);
                const bodyColor = formatColor(project.folderBodyColor);
                const tabStyle = tabColor ? `style="background: ${tabColor}"` : '';
                const bodyStyle = bodyColor ? `style="background: ${bodyColor}"` : '';

                return `
                    <div class="mac-folder" ${clickHandler}>
                        <div class="folder-wrapper">
                            <div class="popup-images">
                                ${imageHtml}
                            </div>
                            <div class="folder-icon">
                                <div class="folder-tab" ${tabStyle}></div>
                                <div class="folder-body" ${bodyStyle}></div>
                            </div>
                        </div>
                        <h3 class="folder-name">${project.title}</h3>
                        <div class="folder-info">
                            <span class="folder-duration">${project.duration || ''}</span>
                            <span class="folder-date">${project.date || ''}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
        if (finderCount) {
            finderCount.textContent = window.projectsData.length + ' items';
        }

        // Build categories sidebar for list view
        const listCategoriesContainer = document.getElementById('listCategoriesList');
        if (listCategoriesContainer) {
            // Get unique categories
            const categoryMap = new Map();
            window.projectsData.forEach(p => {
                if (p.category && !categoryMap.has(p.category)) {
                    categoryMap.set(p.category, {
                        name: p.category,
                        icon: p.categoryIcon || 'folder',
                        order: p.categoryOrder || 999
                    });
                }
            });
            const categories = Array.from(categoryMap.values()).sort((a, b) => a.order - b.order);

            // Category icons
            const categoryIcons = {
                'branding': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
                'product': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
                'folder': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
            };

            let html = `
                <li class="sidebar-item active" data-category="all" onclick="filterListProjects('all')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                    </svg>
                    <span>All</span>
                </li>
            `;

            categories.forEach(cat => {
                const icon = categoryIcons[cat.icon] || categoryIcons['folder'];
                html += `
                    <li class="sidebar-item" data-category="${cat.name}" onclick="filterListProjects('${cat.name}')">
                        ${icon}
                        <span>${cat.name}</span>
                    </li>
                `;
            });

            listCategoriesContainer.innerHTML = html;
        }
    }

    // Populate blog posts (same notes style as canvas - using note-item class)
    const blogNotesList = document.getElementById('listBlogNotesList');
    const blogCount = document.getElementById('listBlogCount');
    const blogPreview = document.getElementById('listBlogPreview');

    if (!window.blogPostsData || window.blogPostsData.length === 0) {
        // Show empty state placeholder
        if (blogNotesList) {
            blogNotesList.innerHTML = `
                <div class="notes-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    <p>Will post soon</p>
                    <span>New content coming your way</span>
                </div>
            `;
        }
        if (blogPreview) {
            blogPreview.innerHTML = `
                <div class="notes-empty-state" style="height: 100%; display: flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                    </svg>
                    <p>Stay tuned</p>
                    <span>Exciting posts are on the way</span>
                </div>
            `;
        }
        if (blogCount) {
            blogCount.textContent = '0';
        }
    } else if (blogNotesList) {
        blogNotesList.innerHTML = window.blogPostsData.map((post, index) => {
                const dateStr = post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                    : '';

                // Get thumbnail image if available (same as canvas)
                const thumbUrl = post.mainImage ? window.sanityImageUrl?.(post.mainImage, 100, 80) : null;
                const thumbHtml = thumbUrl
                    ? `<img class="note-item-thumb" src="${thumbUrl}" alt="${post.title}">`
                    : `<div class="note-item-thumb-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>`;

                return `
                    <div class="note-item ${index === 0 ? 'active' : ''}" data-post-id="${post._id}" onclick="selectListBlogPost('${post._id}')">
                        <div class="note-item-info">
                            <div class="note-item-title">${post.title}</div>
                            <div class="note-item-date">${dateStr}</div>
                        </div>
                        ${thumbHtml}
                    </div>
                `;
        }).join('');
        // Show first post in preview
        if (window.blogPostsData.length > 0) {
            selectListBlogPost(window.blogPostsData[0]._id);
        }
        if (blogCount) {
            blogCount.textContent = window.blogPostsData.length;
        }
    }

    // Populate testimonials (show first 6 with colors from CMS - same as canvas)
    if (window.testimonialsData && window.testimonialsData.length > 0) {
        const testimonialsGrid = document.getElementById('listTestimonialsGrid');
        if (testimonialsGrid) {
            const displayTestimonials = window.testimonialsData.slice(0, 6);
            testimonialsGrid.innerHTML = displayTestimonials.map((testimonial) => {
                const color = testimonial.color || '#fef08a'; // Default yellow
                const authorText = testimonial.role
                    ? `- ${testimonial.author}, ${testimonial.role}`
                    : `- ${testimonial.author}`;

                // Check if color is a hex code or a class name
                const isHexColor = color.startsWith('#');
                const stickyClass = isHexColor ? '' : color;
                const inlineStyle = isHexColor ? `background: ${color}; color: #1a1a1a;` : '';

                return `
                    <div class="sticky-note ${stickyClass}" style="${inlineStyle}">
                        <p>"${testimonial.quote || ''}"</p>
                        <span class="note-author">${authorText}</span>
                    </div>
                `;
            }).join('');
        }
    }
}

// Filter projects in list view by category
let listActiveCategory = 'all';
window.filterListProjects = function(category) {
    listActiveCategory = category;

    // Update active state in sidebar
    const items = document.querySelectorAll('#listCategoriesList .sidebar-item');
    items.forEach(item => {
        item.classList.toggle('active', item.dataset.category === category);
    });

    // Filter and re-render projects
    const projectsGrid = document.getElementById('listProjectsGrid');
    const finderPath = document.getElementById('listFinderPath');
    const finderCount = document.getElementById('listFinderCount');

    if (!projectsGrid || !window.projectsData) return;

    const filteredProjects = category === 'all'
        ? window.projectsData
        : window.projectsData.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());

    // Update path and count
    if (finderPath) {
        finderPath.textContent = category === 'all' ? 'All Projects' : category;
    }
    if (finderCount) {
        finderCount.textContent = `${filteredProjects.length} item${filteredProjects.length !== 1 ? 's' : ''}`;
    }

    // Re-render projects
    projectsGrid.innerHTML = filteredProjects.map((project) => {
        const originalIndex = window.projectsData.findIndex(p => p._id === project._id);

        // Get up to 3 images for popup preview
        const images = project.images || [];
        const imageHtml = images.slice(0, 3).map((img, i) => {
            const url = window.sanityImageUrl?.(img, 400, 85) || '';
            return url ? `<img class="popup-img img-${i + 1}" src="${url}" alt="Preview ${i + 1}">` : '';
        }).join('');

        // Determine click behavior
        let clickHandler = '';
        if (project.projectUrl && !project.hasOverlay) {
            clickHandler = `onclick="window.open('${project.projectUrl}', '_blank')"`;
        } else {
            clickHandler = `onclick="openProjectOverlay(${originalIndex})"`;
        }

        // Custom folder colors
        const formatColor = (color) => {
            if (!color) return null;
            if (color.includes('gradient') || color.includes('rgb') || color.startsWith('#')) return color;
            return `#${color}`;
        };
        const tabColor = formatColor(project.folderTabColor);
        const bodyColor = formatColor(project.folderBodyColor);
        const tabStyle = tabColor ? `style="background: ${tabColor}"` : '';
        const bodyStyle = bodyColor ? `style="background: ${bodyColor}"` : '';

        return `
            <div class="mac-folder" ${clickHandler}>
                <div class="folder-wrapper">
                    <div class="popup-images">
                        ${imageHtml}
                    </div>
                    <div class="folder-icon">
                        <div class="folder-tab" ${tabStyle}></div>
                        <div class="folder-body" ${bodyStyle}></div>
                    </div>
                </div>
                <h3 class="folder-name">${project.title}</h3>
                <div class="folder-info">
                    <span class="folder-duration">${project.duration || ''}</span>
                    <span class="folder-date">${project.date || ''}</span>
                </div>
            </div>
        `;
    }).join('');
};

// Select blog post in list view (same as canvas - using post ID)
window.selectListBlogPost = function(postId) {
    const post = window.blogPostsData?.find(p => p._id === postId);
    if (!post) return;

    const preview = document.getElementById('listBlogPreview');
    const items = document.querySelectorAll('#listBlogNotesList .note-item');

    // Update active state in list
    items.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.postId === postId) {
            item.classList.add('active');
        }
    });

    if (preview) {
        const dateStr = post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : '';

        // Convert Sanity block content to HTML (same as canvas)
        const contentHtml = window.renderBlockContentForList ? window.renderBlockContentForList(post.content) : `<p>${post.excerpt || 'No content available.'}</p>`;

        // Build URL for single blog page (clean URL format)
        const blogUrl = post.slug?.current ? `/blogs/${post.slug.current}` : '#';

        preview.innerHTML = `
            <div class="notes-preview-toolbar">
                <a href="${blogUrl}" target="_blank" class="blog-open-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Open
                </a>
            </div>
            <!-- Drag Handle - Outside scrollable area, always visible -->
            <div class="drag-scroll-handle" title="Drag to scroll">
                <div class="drag-handle-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 8v8M8 12h8"/>
                    </svg>
                </div>
                <span>Scroll</span>
            </div>
            <div class="notes-preview-content">
                <div class="notes-preview-header">
                    <h1 class="notes-preview-title">${post.title}</h1>
                    <div class="notes-preview-meta">${dateStr}${post.category ? ` • ${post.category}` : ''}</div>
                </div>
                <div class="notes-preview-body">
                    ${contentHtml}
                </div>
            </div>
        `;
    }
};

// Make data and functions available globally for list view
window.aboutInfo = null;
window.contactInfo = null;
window.projectsData = [];
window.blogPostsData = [];
window.experiencesData = [];
window.testimonialsData = [];
window.populateListView = populateListView;

// Render block content for list view (same as canvas)
window.renderBlockContentForList = function(content) {
    if (!content || !Array.isArray(content)) {
        return '<p>No content available.</p>';
    }

    return content.map(block => {
        // Handle different block types
        if (block._type === 'block') {
            const style = block.style || 'normal';
            const markDefs = block.markDefs || [];
            const text = renderBlockTextForList(block.children, markDefs);

            switch (style) {
                case 'h2':
                    return `<h2>${text}</h2>`;
                case 'h3':
                    return `<h3>${text}</h3>`;
                case 'blockquote':
                    return `<blockquote>${text}</blockquote>`;
                default:
                    return `<p>${text}</p>`;
            }
        }

        if (block._type === 'image' && window.sanityImageUrl) {
            const url = window.sanityImageUrl(block, 800, 90);
            const caption = block.caption || '';
            return url
                ? `<figure><img src="${url}" alt="${caption}"><figcaption>${caption}</figcaption></figure>`
                : '';
        }

        if (block._type === 'code' || block._type === 'codeBlock') {
            return `<pre><code class="language-${block.language || 'javascript'}">${escapeHtmlForList(block.code || '')}</code></pre>`;
        }

        return '';
    }).join('');
};

// Render block text with marks (bold, italic, links)
function renderBlockTextForList(children, markDefs = []) {
    if (!children || !Array.isArray(children)) return '';

    return children.map(child => {
        let text = child.text || '';

        if (child.marks && child.marks.length > 0) {
            child.marks.forEach(mark => {
                if (mark === 'strong') {
                    text = `<strong>${text}</strong>`;
                } else if (mark === 'em') {
                    text = `<em>${text}</em>`;
                } else if (mark === 'code') {
                    text = `<code>${text}</code>`;
                } else {
                    // Check if it's a link annotation
                    const linkDef = markDefs.find(def => def._key === mark);
                    if (linkDef && linkDef._type === 'link' && linkDef.href) {
                        text = `<a href="${linkDef.href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
                    }
                }
            });
        }

        return text;
    }).join('');
}

// Escape HTML for code blocks
function escapeHtmlForList(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize list view blog search
function initListBlogSearch() {
    const searchInput = document.getElementById('listBlogSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const blogNotesList = document.getElementById('listBlogNotesList');
        const blogCount = document.getElementById('listBlogCount');

        if (!window.blogPostsData || window.blogPostsData.length === 0) return;

        // Filter posts
        const filtered = query === ''
            ? window.blogPostsData
            : window.blogPostsData.filter(post =>
                post.title.toLowerCase().includes(query) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
                (post.category && post.category.toLowerCase().includes(query))
            );

        // Re-render filtered posts
        if (blogNotesList) {
            if (filtered.length === 0) {
                blogNotesList.innerHTML = '<div class="notes-loading">No posts found</div>';
            } else {
                blogNotesList.innerHTML = filtered.map((post, index) => {
                    const dateStr = post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : '';

                    // Get thumbnail image if available (same as canvas)
                    const thumbUrl = post.mainImage ? window.sanityImageUrl?.(post.mainImage, 100, 80) : null;
                    const thumbHtml = thumbUrl
                        ? `<img class="note-item-thumb" src="${thumbUrl}" alt="${post.title}">`
                        : `<div class="note-item-thumb-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>`;

                    return `
                        <div class="note-item ${index === 0 ? 'active' : ''}" data-post-id="${post._id}" onclick="selectListBlogPost('${post._id}')">
                            <div class="note-item-info">
                                <div class="note-item-title">${post.title}</div>
                                <div class="note-item-date">${dateStr}</div>
                            </div>
                            ${thumbHtml}
                        </div>
                    `;
                }).join('');

                // Select first filtered post
                if (filtered.length > 0) {
                    selectListBlogPost(filtered[0]._id);
                }
            }
        }

        if (blogCount) {
            blogCount.textContent = filtered.length;
        }
    });
}

/* ==========================================
   MINIMAP - Draggable and accurate
   ========================================== */
function initMinimap() {
    const minimap = document.getElementById('minimap');
    const viewport = document.getElementById('minimapViewport');
    const markers = minimap?.querySelectorAll('.minimap-marker');

    if (!minimap || !markers) return;

    let isDragging = false;

    // Click on markers to navigate
    markers.forEach(marker => {
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            const section = marker.dataset.section;
            if (window.navigateToSection) {
                window.navigateToSection(section);
            }
        });
    });

    // Navigate by clicking on minimap
    function navigateToMinimapPoint(e) {
        const rect = minimap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const state = window.canvasState;
        if (!state) return;

        // Canvas dimensions
        const canvasWidth = 2800;
        const canvasHeight = 2000;

        // Calculate the canvas point that was clicked
        const canvasX = x * canvasWidth;
        const canvasY = y * canvasHeight;

        // Pan so that point is centered on screen
        const targetX = -canvasX * state.scale + window.innerWidth / 2;
        const targetY = -canvasY * state.scale + window.innerHeight / 2;

        state.panX = targetX;
        state.panY = targetY;
        window.updateCanvasTransform?.();
        window.updateMinimap?.();
    }

    // Mouse down - start drag
    minimap.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('minimap-marker')) return;
        isDragging = true;
        navigateToMinimapPoint(e);
    });

    // Mouse move - drag to pan
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        navigateToMinimapPoint(e);
    });

    // Mouse up - stop drag
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch support
    minimap.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('minimap-marker')) return;
        isDragging = true;
        const touch = e.touches[0];
        navigateToMinimapPoint(touch);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        navigateToMinimapPoint(touch);
    }, { passive: true });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

function updateMinimap() {
    const viewport = document.getElementById('minimapViewport');
    const minimap = document.getElementById('minimap');

    if (!viewport || !minimap || !window.canvasState) return;

    const state = window.canvasState;
    const minimapWidth = minimap.offsetWidth;
    const minimapHeight = minimap.offsetHeight;

    // Canvas dimensions
    const canvasWidth = 2800;
    const canvasHeight = 2000;

    // Calculate viewport size based on visible area
    const visibleWidth = window.innerWidth / state.scale;
    const visibleHeight = window.innerHeight / state.scale;

    const viewportWidth = (visibleWidth / canvasWidth) * minimapWidth;
    const viewportHeight = (visibleHeight / canvasHeight) * minimapHeight;

    // Calculate viewport position
    const viewX = -state.panX / state.scale;
    const viewY = -state.panY / state.scale;

    const viewportX = (viewX / canvasWidth) * minimapWidth;
    const viewportY = (viewY / canvasHeight) * minimapHeight;

    viewport.style.width = Math.max(10, viewportWidth) + 'px';
    viewport.style.height = Math.max(10, viewportHeight) + 'px';
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

// ==========================================
// HIRE FORM SUBMISSION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const hireForm = document.getElementById('hireForm');
    if (!hireForm) return;

    hireForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = hireForm.querySelector('.hire-submit-btn');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = `
            <span>Sending...</span>
            <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
        `;
        submitBtn.disabled = true;

        // Get form data
        const formData = {
            name: document.getElementById('hireName').value,
            email: document.getElementById('hireEmail').value,
            project: document.getElementById('hireProject').value,
            message: document.getElementById('hireMessage').value
        };

        // Send to Formspree
        try {
            const response = await fetch('https://formspree.io/f/mpqrkbyd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Show success message
                hireForm.style.display = 'none';
                document.getElementById('hireSuccess').style.display = 'block';
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            // For now, show success anyway (demo mode)
            // In production, you'd handle the error properly
            console.log('Form data:', formData);
            hireForm.style.display = 'none';
            document.getElementById('hireSuccess').style.display = 'block';
        }
    });
});

// Add spin animation for loading
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
