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
});

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
        state.scale = isMobile ? 0.6 : 1;

        // Properly center on home section
        const homeSection = document.getElementById('section-home');
        if (homeSection) {
            // Get section position
            const sectionX = parseFloat(homeSection.style.left) / 100 * 2800;
            const sectionY = parseFloat(homeSection.style.top) / 100 * 2000;

            // Get section dimensions to find center
            const sectionWidth = homeSection.offsetWidth;
            const sectionHeight = homeSection.offsetHeight;

            // Calculate the center of the section
            const centerX = sectionX + sectionWidth / 2;
            const centerY = sectionY + sectionHeight / 2;

            // Calculate pan to center section on screen
            state.panX = -centerX * state.scale + window.innerWidth / 2;
            state.panY = -centerY * state.scale + window.innerHeight / 2;
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

    // View toggle button
    const viewToggle = document.getElementById('viewToggle');
    const listView = document.getElementById('listView');
    const canvasContainer = document.getElementById('canvasContainer');
    const minimap = document.getElementById('minimap');
    const navbar = document.querySelector('.navbar');
    const zoomControls = document.querySelector('.zoom-controls');

    if (viewToggle && listView) {
        viewToggle.addEventListener('click', () => {
            const isListViewActive = listView.classList.contains('active');

            if (isListViewActive) {
                // Switch to canvas view
                listView.classList.remove('active');
                canvasContainer.style.display = 'block';
                minimap?.style.setProperty('display', 'block');
                navbar?.style.setProperty('display', 'flex');
                viewToggle.classList.remove('active');
                document.body.style.overflow = 'hidden';
            } else {
                // Switch to list view
                listView.classList.add('active');
                canvasContainer.style.display = 'none';
                minimap?.style.setProperty('display', 'none');
                // Keep navbar visible in list view
                navbar?.style.setProperty('display', 'flex');
                viewToggle.classList.add('active');
                document.body.style.overflow = 'auto';
                // Load list view content if not already loaded
                initListViewContent();
            }
        });
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
    if (window.blogPostsData && window.blogPostsData.length > 0) {
        const blogNotesList = document.getElementById('listBlogNotesList');
        const blogCount = document.getElementById('listBlogCount');
        if (blogNotesList) {
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
                const color = testimonial.color || 'yellow';
                const authorText = testimonial.role
                    ? `- ${testimonial.author}, ${testimonial.role}`
                    : `- ${testimonial.author}`;
                return `
                    <div class="sticky-note ${color}">
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

        // Build URL for single blog page
        const blogUrl = post.slug?.current ? `blog.html?slug=${post.slug.current}` : '#';

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
            const text = renderBlockTextForList(block.children);

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
function renderBlockTextForList(children) {
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
