/* ==========================================
   SANITY CMS CLIENT
   Fetches content from Sanity for the portfolio
   ========================================== */

const SANITY_PROJECT_ID = 'hsbvy0xe';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';

// Sanity CDN URL builder
function sanityUrl(query) {
  const encodedQuery = encodeURIComponent(query);
  return `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encodedQuery}`;
}

// Sanity image URL builder
function sanityImageUrl(imageRef, width = 800, quality = 90) {
  if (!imageRef || !imageRef.asset || !imageRef.asset._ref) return '';

  // Parse the image reference: image-{id}-{dimensions}-{format}
  const ref = imageRef.asset._ref;
  const [, id, dimensions, format] = ref.split('-');

  // Higher quality settings: auto=format for best compression, q for quality
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}?w=${width}&q=${quality}&auto=format&fit=max`;
}

// Store projects globally for overlay access
let projectsData = [];

// Fetch all projects
async function fetchProjects() {
  const query = `*[_type == "project"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    fullDescription,
    duration,
    date,
    client,
    role,
    tools,
    "category": category->title,
    "categoryIcon": category->icon,
    "categoryOrder": category->order,
    folderTabColor,
    folderBodyColor,
    overlayBgColor,
    images,
    contentBlocks[] {
      _type,
      _key,
      image,
      embedCode,
      heading,
      text,
      textAlign,
      caption,
      fullWidth
    },
    galleryImages,
    projectUrl,
    hasOverlay,
    order
  }`;

  try {
    const response = await fetch(sanityUrl(query));
    const data = await response.json();
    projectsData = data.result || [];
    return projectsData;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Fetch about info
async function fetchAboutInfo() {
  const query = `*[_type == "aboutInfo"][0] {
    _id,
    name,
    title,
    photo,
    shortBio,
    fullBio,
    location,
    yearsExperience,
    highlights[] {
      icon,
      label,
      value
    },
    skills,
    ctaText
  }`;

  try {
    const response = await fetch(sanityUrl(query));
    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.error('Error fetching about info:', error);
    return null;
  }
}

// Store experience and education data globally for overlay
let experienceData = [];
let educationData = [];

// Fetch all work experiences
async function fetchWorkExperience() {
  const query = `*[_type == "workExperience"] | order(order asc) {
    _id,
    role,
    company,
    companyUrl,
    companyLogo,
    location,
    startYear,
    endYear,
    isCurrent,
    startDate,
    endDate,
    description,
    achievements,
    images,
    isFeatured,
    order
  }`;

  try {
    const response = await fetch(sanityUrl(query));
    const data = await response.json();
    experienceData = data.result || [];
    return experienceData;
  } catch (error) {
    console.error('Error fetching work experience:', error);
    return [];
  }
}

// Fetch all education
async function fetchEducation() {
  const query = `*[_type == "education"] | order(order asc) {
    _id,
    degree,
    institution,
    institutionUrl,
    institutionLogo,
    location,
    startYear,
    endYear,
    startDate,
    endDate,
    description,
    order
  }`;

  try {
    const response = await fetch(sanityUrl(query));
    const data = await response.json();
    educationData = data.result || [];
    return educationData;
  } catch (error) {
    console.error('Error fetching education:', error);
    return [];
  }
}

// Fetch all testimonials
async function fetchTestimonials() {
  const query = `*[_type == "testimonial"] | order(order asc) {
    _id,
    quote,
    author,
    role,
    color,
    order
  }`;

  try {
    const response = await fetch(sanityUrl(query));
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

// Fetch contact info
async function fetchContactInfo() {
  const query = `*[_type == "contactInfo"][0] {
    _id,
    title,
    subtitle,
    email,
    phone,
    linkedinUrl,
    linkedinLabel,
    instagramUrl,
    instagramLabel,
    twitterUrl,
    twitterLabel,
    dribbbleUrl,
    dribbbleLabel,
    behanceUrl,
    behanceLabel
  }`;

  try {
    const response = await fetch(sanityUrl(query));
    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return null;
  }
}

// Store blog posts globally
let blogPostsData = [];
let activeBlogPost = null;

// Fetch all blog posts
async function fetchBlogPosts() {
  const query = `*[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    content,
    category,
    featured,
    order,
    mainImage
  }`;

  try {
    const response = await fetch(sanityUrl(query));
    const data = await response.json();
    blogPostsData = data.result || [];
    return blogPostsData;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Render blog posts into the Notes app
function renderBlogPosts(posts) {
  const countEl = document.getElementById('blogCount');
  const listEl = document.getElementById('blogNotesList');
  const previewEl = document.getElementById('blogPreview');

  if (countEl) {
    countEl.textContent = posts.length;
  }

  if (!listEl) return;

  if (posts.length === 0) {
    listEl.innerHTML = '<div class="notes-loading">No posts yet</div>';
    return;
  }

  listEl.innerHTML = posts.map((post, index) => {
    const date = post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : '';

    // Get thumbnail image if available
    const thumbUrl = post.mainImage ? sanityImageUrl(post.mainImage, 100, 80) : null;
    const thumbHtml = thumbUrl
      ? `<img class="note-item-thumb" src="${thumbUrl}" alt="${post.title}">`
      : `<div class="note-item-thumb-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>`;

    return `
      <div class="note-item ${index === 0 ? 'active' : ''}" data-post-id="${post._id}" onclick="selectBlogPost('${post._id}')">
        <div class="note-item-info">
          <div class="note-item-title">${post.title}</div>
          <div class="note-item-date">${date}</div>
        </div>
        ${thumbHtml}
      </div>
    `;
  }).join('');

  // Auto-select first post
  if (posts.length > 0) {
    selectBlogPost(posts[0]._id);
  }
}

// Select and display a blog post
function selectBlogPost(postId) {
  const post = blogPostsData.find(p => p._id === postId);
  if (!post) return;

  activeBlogPost = post;

  // Update active state in list
  document.querySelectorAll('.note-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.postId === postId) {
      item.classList.add('active');
    }
  });

  // Render preview
  const previewEl = document.getElementById('blogPreview');
  if (!previewEl) return;

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';

  // Convert Sanity block content to HTML
  const contentHtml = renderBlockContent(post.content);

  // Build URL for single blog page
  const blogUrl = post.slug?.current ? `blog.html?slug=${post.slug.current}` : '#';

  previewEl.innerHTML = `
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
        <div class="notes-preview-meta">${date}${post.category ? ` • ${post.category}` : ''}</div>
      </div>
      <div class="notes-preview-body">
        ${contentHtml}
      </div>
    </div>
  `;
}

// Convert Sanity block content to HTML
function renderBlockContent(content) {
  if (!content || !Array.isArray(content)) {
    return '<p>No content available.</p>';
  }

  return content.map(block => {
    // Handle different block types
    if (block._type === 'block') {
      const style = block.style || 'normal';
      const text = renderBlockText(block.children);

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

    if (block._type === 'image') {
      const url = sanityImageUrl(block, 800, 90);
      const caption = block.caption || '';
      return url
        ? `<figure><img src="${url}" alt="${caption}"><figcaption>${caption}</figcaption></figure>`
        : '';
    }

    if (block._type === 'code' || block._type === 'codeBlock') {
      return `<pre><code class="language-${block.language || 'javascript'}">${escapeHtml(block.code || '')}</code></pre>`;
    }

    return '';
  }).join('');
}

// Render block text with marks (bold, italic, links)
function renderBlockText(children) {
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
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Blog search functionality
function initBlogSearch() {
  const searchInput = document.getElementById('blogSearch');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    if (query === '') {
      renderBlogPosts(blogPostsData);
      return;
    }

    const filtered = blogPostsData.filter(post =>
      post.title.toLowerCase().includes(query) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
      (post.category && post.category.toLowerCase().includes(query))
    );

    renderBlogPosts(filtered);
  });
}

// Current active category filter
let activeCategory = 'all';

// Render projects into the folders grid
function renderProjects(projects) {
  const container = document.querySelector('.folders-grid');
  if (!container) return;

  // Build categories sidebar
  buildCategoriesSidebar(projects);

  // Filter projects by active category
  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => (p.category || '').toLowerCase() === activeCategory.toLowerCase());

  // Update finder path and count
  const pathEl = document.getElementById('finderPath');
  const countEl = document.getElementById('finderCount');
  if (pathEl) {
    pathEl.textContent = activeCategory === 'all' ? 'All Projects' : activeCategory;
  }
  if (countEl) {
    countEl.textContent = `${filteredProjects.length} item${filteredProjects.length !== 1 ? 's' : ''}`;
  }

  if (filteredProjects.length === 0) {
    container.innerHTML = '<div class="finder-empty">No projects in this category</div>';
    return;
  }

  container.innerHTML = filteredProjects.map((project) => {
    // Find original index for overlay
    const originalIndex = projects.findIndex(p => p._id === project._id);

    // Get up to 3 images - higher quality for folder previews
    const images = project.images || [];
    const imageHtml = images.slice(0, 3).map((img, i) => {
      const url = sanityImageUrl(img, 400, 85);
      return url ? `<img class="popup-img img-${i + 1}" src="${url}" alt="Preview ${i + 1}">` : '';
    }).join('');

    // Determine click behavior: overlay or external link
    let clickHandler = '';
    if (project.projectUrl && !project.hasOverlay) {
      // Has external URL and overlay disabled - go to external link
      clickHandler = `onclick="window.open('${project.projectUrl}', '_blank')"`;
    } else {
      // Show overlay (either has overlay content or default behavior)
      clickHandler = `onclick="openProjectOverlay(${originalIndex})"`;
    }

    // Custom folder colors - inline styles if provided
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

// Build categories sidebar from projects
function buildCategoriesSidebar(projects) {
  const container = document.getElementById('categoriesList');
  if (!container) return;

  // Get unique categories with their icons and order from projects
  const categoryMap = new Map();
  projects.forEach(p => {
    if (p.category && !categoryMap.has(p.category)) {
      categoryMap.set(p.category, {
        name: p.category,
        icon: p.categoryIcon || 'folder',
        order: p.categoryOrder || 999
      });
    }
  });

  // Sort categories by order
  const categories = Array.from(categoryMap.values()).sort((a, b) => a.order - b.order);

  // Category icons mapping (using icon identifier from CMS)
  const categoryIcons = {
    'branding': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    'product': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
    'ui-ux': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>`,
    'web': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    'mobile': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>`,
    'app': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    'graphic': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
    'motion': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>`,
    '3d': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    'folder': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`
  };

  // Build sidebar HTML
  let html = `
    <li class="sidebar-item ${activeCategory === 'all' ? 'active' : ''}" data-category="all" onclick="filterByCategory('all')">
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
    const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();
    html += `
      <li class="sidebar-item ${isActive ? 'active' : ''}" data-category="${cat.name}" onclick="filterByCategory('${cat.name}')">
        ${icon}
        <span>${cat.name}</span>
      </li>
    `;
  });

  container.innerHTML = html;
}

// Filter projects by category
function filterByCategory(category) {
  activeCategory = category;
  renderProjects(projectsData);
}

// Helper function to format color (adds # for hex codes if missing)
function formatColor(color) {
  if (!color) return null;
  // If it's a gradient or already has #, use as-is
  if (color.includes('gradient') || color.includes('rgb') || color.startsWith('#')) {
    return color;
  }
  // Otherwise, assume it's a hex code and add #
  return `#${color}`;
}

// Render content blocks (images, videos, text)
function renderContentBlocks(contentBlocks, projectTitle) {
  if (!contentBlocks || contentBlocks.length === 0) return '';

  return contentBlocks.map(block => {
    if (block._type === 'imageBlock' && block.image) {
      const url = sanityImageUrl(block.image, 1600, 90);
      if (!url) return '';
      const widthClass = block.fullWidth !== false ? 'full-width' : 'contained-width';
      return `
        <div class="content-block image-block ${widthClass}">
          <div class="gallery-image">
            <img src="${url}" alt="${block.caption || projectTitle}" loading="lazy">
          </div>
          ${block.caption ? `<p class="block-caption">${block.caption}</p>` : ''}
        </div>
      `;
    }

    if (block._type === 'videoBlock' && block.embedCode) {
      return `
        <div class="content-block video-block">
          <div class="video-wrapper">
            ${block.embedCode}
          </div>
          ${block.caption ? `<p class="block-caption">${block.caption}</p>` : ''}
        </div>
      `;
    }

    if (block._type === 'textBlock' && block.text) {
      const align = block.textAlign || 'left';
      return `
        <div class="content-block text-block" style="text-align: ${align}">
          ${block.heading ? `<h3 class="text-block-heading">${block.heading}</h3>` : ''}
          <p class="text-block-content">${block.text}</p>
        </div>
      `;
    }

    return '';
  }).join('');
}

// Generate slug from title
function generateSlug(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Open project overlay
function openProjectOverlay(projectIndex) {
  const project = projectsData[projectIndex];
  if (!project) return;

  const overlay = document.getElementById('projectOverlay');
  const overlayContainer = overlay.querySelector('.overlay-container');

  // Apply custom background color if set
  const bgColor = formatColor(project.overlayBgColor);
  if (bgColor) {
    overlayContainer.style.background = bgColor;
  } else {
    overlayContainer.style.background = ''; // Reset to default CSS
  }

  // Set the "Open in new page" link
  const openPageLink = document.getElementById('overlayOpenPage');
  const slug = project.slug?.current || generateSlug(project.title);
  openPageLink.href = `/project.html?slug=${slug}`;

  // Populate overlay content
  document.getElementById('overlayTitle').textContent = project.title || '';
  document.getElementById('overlayDescription').textContent = project.fullDescription || project.description || '';

  // Client
  const clientEl = document.getElementById('overlayClient');
  if (project.client) {
    clientEl.textContent = project.client;
    clientEl.style.display = 'inline-block';
  } else {
    clientEl.style.display = 'none';
  }

  // Date
  document.getElementById('overlayDate').textContent = project.date || '';

  // Role
  const roleDetail = document.getElementById('detailRole');
  const roleValue = document.getElementById('overlayRole');
  if (project.role) {
    roleValue.textContent = project.role;
    roleDetail.classList.remove('hidden');
  } else {
    roleDetail.classList.add('hidden');
  }

  // Duration
  const durationDetail = document.getElementById('detailDuration');
  const durationValue = document.getElementById('overlayDuration');
  if (project.duration) {
    durationValue.textContent = project.duration;
    durationDetail.classList.remove('hidden');
  } else {
    durationDetail.classList.add('hidden');
  }

  // Tools
  const toolsDetail = document.getElementById('detailTools');
  const toolsList = document.getElementById('overlayTools');
  if (project.tools && project.tools.length > 0) {
    toolsList.innerHTML = project.tools.map(tool =>
      `<span class="tool-tag">${tool}</span>`
    ).join('');
    toolsDetail.classList.remove('hidden');
  } else {
    toolsDetail.classList.add('hidden');
  }

  // Content Blocks - new flexible content system
  const gallery = document.getElementById('overlayGallery');

  // Use new contentBlocks if available, fallback to legacy galleryImages
  if (project.contentBlocks && project.contentBlocks.length > 0) {
    gallery.innerHTML = renderContentBlocks(project.contentBlocks, project.title);
  } else {
    // Fallback to legacy gallery images
    const galleryImages = project.galleryImages || project.images || [];
    if (galleryImages.length > 0) {
      gallery.innerHTML = galleryImages.map(img => {
        const url = sanityImageUrl(img, 1600, 90);
        return url ? `
          <div class="content-block image-block full-width">
            <div class="gallery-image">
              <img src="${url}" alt="${project.title}" loading="lazy">
            </div>
          </div>
        ` : '';
      }).join('');
    } else {
      gallery.innerHTML = '';
    }
  }

  // More Projects - show other projects (excluding current one)
  const moreProjectsGrid = document.getElementById('moreProjectsGrid');
  const otherProjects = projectsData.filter((_, i) => i !== projectIndex);

  if (otherProjects.length > 0) {
    // Show up to 3 other projects
    const projectsToShow = otherProjects.slice(0, 3);
    moreProjectsGrid.innerHTML = projectsToShow.map((otherProject) => {
      const otherIndex = projectsData.findIndex(p => p._id === otherProject._id);
      const previewImage = otherProject.images && otherProject.images[0]
        ? sanityImageUrl(otherProject.images[0], 400, 85)
        : '';

      return `
        <div class="more-project-card" onclick="openProjectOverlay(${otherIndex}); document.querySelector('.overlay-content').scrollTop = 0;">
          <div class="more-project-image">
            ${previewImage ? `<img src="${previewImage}" alt="${otherProject.title}" loading="lazy">` : ''}
          </div>
          <div class="more-project-info">
            <h4 class="more-project-title">${otherProject.title}</h4>
            <span class="more-project-date">${otherProject.date || ''}</span>
          </div>
        </div>
      `;
    }).join('');
    document.getElementById('moreProjects').style.display = 'block';
  } else {
    document.getElementById('moreProjects').style.display = 'none';
  }

  // Show overlay
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close project overlay
function closeProjectOverlay() {
  const overlay = document.getElementById('projectOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close overlay on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProjectOverlay();
    closeAboutOverlay();
  }
});

// ==========================================
// ABOUT SECTION & OVERLAY
// ==========================================

// Calculate duration in years
function calculateDuration(startYear, endYear) {
  const end = endYear || new Date().getFullYear();
  const duration = end - startYear;
  if (duration === 0) return '< 1 year';
  if (duration === 1) return '1 year';
  return `${duration} years`;
}

// Get icon SVG
function getIconSvg(iconName) {
  const icons = {
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'
  };
  return icons[iconName] || icons.default;
}

// Render About section on main page
function renderAboutSection(aboutInfo, experiences) {
  // Update photo
  const photoEl = document.getElementById('aboutPhoto');
  if (photoEl && aboutInfo?.photo) {
    const photoUrl = sanityImageUrl(aboutInfo.photo, 400, 90);
    if (photoUrl) {
      photoEl.querySelector('img').src = photoUrl;
    }
  }

  // Update bio text if provided from CMS
  const bioEl = document.getElementById('aboutBio');
  if (bioEl && aboutInfo?.shortBio) {
    // Create the bio HTML with inline elements
    bioEl.innerHTML = aboutInfo.shortBio;
  }

  // Render experience preview (3 most recent)
  const previewContainer = document.getElementById('experiencePreview');
  if (previewContainer && experiences.length > 0) {
    const recentExperiences = experiences.slice(0, 3);
    previewContainer.innerHTML = recentExperiences.map(exp => {
      // Build date range
      const dateRange = exp.endYear
        ? `${exp.startYear} — ${exp.endYear}`
        : `${exp.startYear} — Now`;

      // Build meta (date | location)
      const metaParts = [];
      if (dateRange) metaParts.push(dateRange);
      if (exp.location) metaParts.push(exp.location);
      const metaText = metaParts.join(' | ');

      return `
        <div class="exp-preview-item">
          <h4 class="exp-preview-title"><strong>${exp.role}</strong> @ ${exp.company}</h4>
          <p class="exp-preview-meta">${metaText}</p>
        </div>
      `;
    }).join('');
  }
}

// Render About overlay content
function renderAboutOverlay(aboutInfo, experiences, education) {
  // Update profile header
  const profilePhotoEl = document.getElementById('profilePhotoLarge');
  if (profilePhotoEl && aboutInfo?.photo) {
    const photoUrl = sanityImageUrl(aboutInfo.photo, 400, 90);
    if (photoUrl) {
      profilePhotoEl.querySelector('img').src = photoUrl;
    }
  }

  const profileNameEl = document.getElementById('profileName');
  const profileTitleEl = document.getElementById('profileTitle');
  const profileLocationEl = document.getElementById('profileLocation');

  if (profileNameEl && aboutInfo?.name) profileNameEl.textContent = aboutInfo.name;
  if (profileTitleEl && aboutInfo?.title) profileTitleEl.textContent = aboutInfo.title;
  if (profileLocationEl && aboutInfo?.location) profileLocationEl.textContent = aboutInfo.location;

  // Update full bio
  const fullBioEl = document.getElementById('fullBioText');
  if (fullBioEl && aboutInfo?.fullBio) fullBioEl.textContent = aboutInfo.fullBio;

  // Render highlights
  const highlightsContainer = document.getElementById('aboutHighlights');
  if (highlightsContainer && aboutInfo?.highlights && aboutInfo.highlights.length > 0) {
    highlightsContainer.innerHTML = aboutInfo.highlights.map(h => `
      <div class="highlight-card">
        <div class="highlight-icon">${getIconSvg(h.icon)}</div>
        <div class="highlight-content">
          <div class="highlight-value">${h.value}</div>
          <div class="highlight-label">${h.label}</div>
        </div>
      </div>
    `).join('');
  }

  // Render skills
  const skillsContainer = document.getElementById('skillsGrid');
  if (skillsContainer && aboutInfo?.skills && aboutInfo.skills.length > 0) {
    skillsContainer.innerHTML = aboutInfo.skills.map(skill =>
      `<span class="skill-tag">${skill}</span>`
    ).join('');
    document.getElementById('aboutSkills').style.display = 'block';
  } else if (skillsContainer) {
    document.getElementById('aboutSkills').style.display = 'none';
  }

  // Render experiences in exp-card style with logos and expandable content
  const experienceContainer = document.getElementById('experienceList');
  if (experienceContainer && experiences.length > 0) {
    experienceContainer.innerHTML = experiences.map((exp, index) => {
      const dateRange = exp.endDate
        ? `${exp.startDate} — ${exp.endDate}`
        : exp.startDate || '';

      // Build meta info (date | location)
      const metaParts = [];
      if (dateRange) metaParts.push(dateRange);
      if (exp.location) metaParts.push(exp.location);
      const metaText = metaParts.join(' | ');

      // Company logo
      const logoUrl = exp.companyLogo ? sanityImageUrl(exp.companyLogo, 100, 90) : '';
      const logoHtml = logoUrl
        ? `<div class="exp-card-logo"><img src="${logoUrl}" alt="${exp.company}"></div>`
        : `<div class="exp-card-logo exp-card-logo-placeholder"><span>${exp.company ? exp.company.charAt(0) : 'C'}</span></div>`;

      // Company link or text
      const companyText = exp.companyUrl
        ? `<a href="${exp.companyUrl}" class="company-link" target="_blank">${exp.company}</a>`
        : exp.company;

      // Description content
      const hasDescription = exp.description || (exp.achievements && exp.achievements.length > 0) || (exp.images && exp.images.length > 0);

      // Achievement bullets
      const achievementsHtml = exp.achievements && exp.achievements.length > 0
        ? `<ul class="exp-achievements">${exp.achievements.map(a => `<li>${a}</li>`).join('')}</ul>`
        : '';

      // Experience images
      const imagesHtml = exp.images && exp.images.length > 0
        ? `<div class="exp-card-images">${exp.images.map(img => {
            const imgUrl = sanityImageUrl(img, 600, 85);
            return imgUrl ? `<img src="${imgUrl}" alt="${exp.company} experience" loading="lazy">` : '';
          }).join('')}</div>`
        : '';

      return `
        <div class="exp-card${hasDescription ? '' : ' no-expand'}" data-year="${exp.startYear}">
          <div class="exp-card-header" ${hasDescription ? `onclick="toggleExpCard(this)"` : ''}>
            ${logoHtml}
            <div class="exp-card-content">
              <h3 class="exp-card-title">${exp.role} <span class="exp-card-at">@</span> ${companyText}</h3>
              <p class="exp-card-meta">${metaText}</p>
            </div>
            ${hasDescription ? `<button class="exp-card-expand" aria-label="Expand"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>` : ''}
          </div>
          ${hasDescription ? `
          <div class="exp-card-description">
            ${exp.description ? `<p>${exp.description}</p>` : ''}
            ${achievementsHtml}
            ${imagesHtml}
          </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  // Render education in edu-card style with logos
  const educationContainer = document.getElementById('educationList');
  if (educationContainer && education.length > 0) {
    educationContainer.innerHTML = education.map(edu => {
      const dateRange = edu.endDate
        ? `${edu.startDate} — ${edu.endDate}`
        : edu.startDate || '';

      // Build meta info (date | location)
      const metaParts = [];
      if (dateRange) metaParts.push(dateRange);
      if (edu.location) metaParts.push(edu.location);
      const metaText = metaParts.join(' | ');

      // Institution logo
      const logoUrl = edu.institutionLogo ? sanityImageUrl(edu.institutionLogo, 100, 90) : '';
      const logoHtml = logoUrl
        ? `<div class="edu-card-logo"><img src="${logoUrl}" alt="${edu.institution}"></div>`
        : `<div class="edu-card-logo edu-card-logo-placeholder"><span>${edu.institution ? edu.institution.charAt(0) : 'U'}</span></div>`;

      // Institution link or text
      const institutionText = edu.institutionUrl
        ? `<a href="${edu.institutionUrl}" class="company-link" target="_blank">${edu.institution}</a>`
        : edu.institution;

      return `
        <div class="edu-card" data-year="${edu.startYear || ''}">
          ${logoHtml}
          <div class="edu-card-content">
            <h3 class="edu-card-title">${edu.degree} <span class="edu-card-at">@</span> ${institutionText}</h3>
            <p class="edu-card-meta">${metaText}</p>
            ${edu.description ? `<p class="edu-card-desc">${edu.description}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Build timeline years
  buildTimeline(experiences, education);
}

// Build timeline sidebar
function buildTimeline(experiences, education) {
  const timelineContainer = document.getElementById('timelineYears');
  if (!timelineContainer) return;

  // Collect all years from experiences and education
  const years = new Set();

  experiences.forEach(exp => {
    if (exp.startYear) years.add(exp.startYear);
    if (exp.endYear) years.add(exp.endYear);
  });

  education.forEach(edu => {
    if (edu.startYear) years.add(edu.startYear);
    if (edu.endYear) years.add(edu.endYear);
  });

  // Sort years descending (newest first)
  const sortedYears = Array.from(years).sort((a, b) => b - a);

  if (sortedYears.length === 0) {
    timelineContainer.innerHTML = '';
    return;
  }

  timelineContainer.innerHTML = sortedYears.map(year => `
    <div class="timeline-year" data-year="${year}">${year}</div>
  `).join('');

  // Set up scroll-based highlighting
  setupTimelineScrolling();
}

// Setup timeline scroll highlighting
function setupTimelineScrolling() {
  const mainContent = document.getElementById('aboutMainContent');
  const timelineYears = document.querySelectorAll('.timeline-year');

  if (!mainContent || timelineYears.length === 0) return;

  mainContent.addEventListener('scroll', () => {
    const experienceItems = mainContent.querySelectorAll('[data-year]');
    let activeYear = null;

    experienceItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const containerRect = mainContent.getBoundingClientRect();

      // Check if item is in the visible area
      if (rect.top >= containerRect.top && rect.top <= containerRect.top + containerRect.height / 2) {
        activeYear = item.dataset.year;
      }
    });

    // Update active state
    timelineYears.forEach(yearEl => {
      if (yearEl.dataset.year === activeYear) {
        yearEl.classList.add('active');
      } else {
        yearEl.classList.remove('active');
      }
    });
  });

  // Click to scroll to year
  timelineYears.forEach(yearEl => {
    yearEl.addEventListener('click', () => {
      const year = yearEl.dataset.year;
      const targetItem = mainContent.querySelector(`[data-year="${year}"]`);
      if (targetItem) {
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Toggle experience card expansion
function toggleExpCard(headerEl) {
  const card = headerEl.closest('.exp-card');
  if (card) {
    card.classList.toggle('expanded');
  }
}

// Open About overlay
function openAboutOverlay() {
  const overlay = document.getElementById('aboutOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Update URL for deep linking
  history.pushState({ overlay: 'about' }, '', '?about');
}

// Close About overlay
function closeAboutOverlay() {
  const overlay = document.getElementById('aboutOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';

  // Update URL
  if (window.location.search.includes('about')) {
    history.pushState({}, '', window.location.pathname);
  }
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  if (e.state?.overlay === 'about' || window.location.search.includes('about')) {
    openAboutOverlay();
  } else {
    closeAboutOverlay();
  }
});

// Check URL on load for deep linking
function checkAboutDeepLink() {
  if (window.location.search.includes('about')) {
    // Small delay to ensure overlay content is rendered
    setTimeout(() => openAboutOverlay(), 100);
  }
}

// Render work experience
function renderWorkExperience(experiences) {
  // Find the work experience section (first career-section)
  const careerSections = document.querySelectorAll('.career-card .career-section');
  const workSection = careerSections[0];
  if (!workSection || experiences.length === 0) return;

  // Keep the title, rebuild the items
  const title = workSection.querySelector('.career-title');
  workSection.innerHTML = '';
  if (title) workSection.appendChild(title.cloneNode(true));

  experiences.forEach(exp => {
    const dateRange = exp.endDate
      ? `${exp.startDate} — ${exp.endDate}`
      : exp.startDate;

    const companyLink = exp.companyUrl
      ? `<a href="${exp.companyUrl}" class="company-link" target="_blank">${exp.company}</a>`
      : exp.company;

    const item = document.createElement('div');
    item.className = 'career-item';
    item.innerHTML = `
      <span class="career-date">${dateRange}</span>
      <div class="career-details">
        <h3>${exp.role} at ${companyLink}</h3>
        <p class="career-location">${exp.location || ''}</p>
      </div>
    `;
    workSection.appendChild(item);
  });
}

// Render education
function renderEducation(educationList) {
  // Find the education section (second career-section)
  const careerSections = document.querySelectorAll('.career-card .career-section');
  const eduSection = careerSections[1];
  if (!eduSection || educationList.length === 0) return;

  // Keep the title, rebuild the items
  const title = eduSection.querySelector('.career-title');
  eduSection.innerHTML = '';
  if (title) eduSection.appendChild(title.cloneNode(true));

  educationList.forEach(edu => {
    const dateRange = edu.endDate
      ? `${edu.startDate} — ${edu.endDate}`
      : edu.startDate;

    const institutionLink = edu.institutionUrl
      ? `<a href="${edu.institutionUrl}" class="company-link" target="_blank">${edu.institution}</a>`
      : edu.institution;

    const item = document.createElement('div');
    item.className = 'career-item';
    item.innerHTML = `
      <span class="career-date">${dateRange}</span>
      <div class="career-details">
        <h3>${edu.degree} at ${institutionLink}</h3>
        <p class="career-location">${edu.location || ''}</p>
      </div>
    `;
    eduSection.appendChild(item);
  });
}

// Render testimonials as sticky notes
function renderTestimonials(testimonials) {
  if (testimonials.length === 0) return;

  // Remove existing floating notes
  document.querySelectorAll('.floating-note').forEach(note => note.remove());

  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  // Positions for 6 testimonials (in free spaces between sections)
  // Sections: Home(50%,45%), About(15%,45%), Blog(58%,45%), Projects(82%,38%),
  //           Experience(22%,62%), Hire(38%,82%), Contact(62%,78%)
  const positions = [
    { left: '8%', top: '28%' },    // Top left area (free space)
    { left: '8%', top: '85%' },    // Far bottom left (free space)
    { left: '32%', top: '28%' },   // Between About and Home, top (free space)
    { left: '55%', top: '68%' },   // Between Home/Blog and Hire/Contact (free space)
    { left: '72%', top: '62%' },   // Between Blog/Projects and Contact (free space)
    { left: '85%', top: '72%' }    // Bottom right corner (free space)
  ];

  testimonials.forEach((testimonial, i) => {
    const pos = positions[i % positions.length];
    const color = testimonial.color || 'yellow';

    const note = document.createElement('div');
    note.className = `canvas-section floating-note note-${i + 1} draggable-note`;
    note.style.left = pos.left;
    note.style.top = pos.top;

    const authorText = testimonial.role
      ? `- ${testimonial.author}, ${testimonial.role}`
      : `- ${testimonial.author}`;

    note.innerHTML = `
      <div class="sticky-note ${color}">
        <p>"${testimonial.quote}"</p>
        <span class="note-author">${authorText}</span>
      </div>
    `;

    canvas.appendChild(note);

    // Add drag functionality
    makeNoteDraggable(note);
  });
}

// Get current canvas scale from transform
function getCanvasScale() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return 1;
  const transform = window.getComputedStyle(canvas).transform;
  if (transform === 'none') return 1;
  const matrix = new DOMMatrix(transform);
  return matrix.a; // scale factor
}

// Make a testimonial note draggable
function makeNoteDraggable(note) {
  let isDragging = false;
  let startLeft = 0;
  let startTop = 0;
  let startMouseX = 0;
  let startMouseY = 0;

  const onMouseDown = (e) => {
    if (e.target.tagName === 'A') return;
    e.preventDefault();
    e.stopPropagation();

    isDragging = true;
    note.classList.add('dragging');

    // Store starting positions
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    startLeft = note.offsetLeft;
    startTop = note.offsetTop;
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;

    const scale = getCanvasScale();

    // Calculate delta movement, accounting for zoom scale
    const deltaX = (e.clientX - startMouseX) / scale;
    const deltaY = (e.clientY - startMouseY) / scale;

    note.style.left = (startLeft + deltaX) + 'px';
    note.style.top = (startTop + deltaY) + 'px';
  };

  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      note.classList.remove('dragging');
    }
  };

  // Touch handlers
  const onTouchStart = (e) => {
    if (e.target.tagName === 'A') return;
    e.stopPropagation();

    const touch = e.touches[0];
    isDragging = true;
    note.classList.add('dragging');

    startMouseX = touch.clientX;
    startMouseY = touch.clientY;
    startLeft = note.offsetLeft;
    startTop = note.offsetTop;
  };

  const onTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const scale = getCanvasScale();

    // Calculate delta movement, accounting for zoom scale
    const deltaX = (touch.clientX - startMouseX) / scale;
    const deltaY = (touch.clientY - startMouseY) / scale;

    note.style.left = (startLeft + deltaX) + 'px';
    note.style.top = (startTop + deltaY) + 'px';
  };

  const onTouchEnd = () => {
    if (isDragging) {
      isDragging = false;
      note.classList.remove('dragging');
    }
  };

  // Add event listeners
  note.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  note.addEventListener('touchstart', onTouchStart, { passive: false });
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd);
}

// Render contact info
function renderContactInfo(contact) {
  if (!contact) return;

  const contactCard = document.querySelector('.contact-card');
  if (!contactCard) return;

  // Update title
  const titleEl = contactCard.querySelector('h2');
  if (titleEl && contact.title) {
    titleEl.textContent = contact.title;
  }

  // Update subtitle
  const subtitleEl = contactCard.querySelector('p');
  if (subtitleEl && contact.subtitle) {
    subtitleEl.textContent = contact.subtitle;
  }

  // Build contact links
  const linksContainer = contactCard.querySelector('.contact-links');
  if (!linksContainer) return;

  let linksHtml = '';

  // Email
  if (contact.email) {
    linksHtml += `
      <a href="mailto:${contact.email}" class="contact-link">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M22 6L12 13L2 6"/>
        </svg>
        <span>${contact.email}</span>
      </a>
    `;
  }

  // Phone
  if (contact.phone) {
    linksHtml += `
      <a href="tel:${contact.phone}" class="contact-link">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
        </svg>
        <span>${contact.phone}</span>
      </a>
    `;
  }

  // LinkedIn
  if (contact.linkedinUrl) {
    linksHtml += `
      <a href="${contact.linkedinUrl}" target="_blank" class="contact-link">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        <span>${contact.linkedinLabel || 'LinkedIn'}</span>
      </a>
    `;
  }

  // Instagram
  if (contact.instagramUrl) {
    linksHtml += `
      <a href="${contact.instagramUrl}" target="_blank" class="contact-link">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="2" width="20" height="20" rx="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
        <span>${contact.instagramLabel || 'Instagram'}</span>
      </a>
    `;
  }

  // Twitter/X
  if (contact.twitterUrl) {
    linksHtml += `
      <a href="${contact.twitterUrl}" target="_blank" class="contact-link">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <span>${contact.twitterLabel || 'Twitter'}</span>
      </a>
    `;
  }

  // Dribbble
  if (contact.dribbbleUrl) {
    linksHtml += `
      <a href="${contact.dribbbleUrl}" target="_blank" class="contact-link">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm7.938 5.5c1.375 1.75 2.188 3.938 2.25 6.313-3.313-.688-6.313-.5-8.938.25-.25-.563-.5-1.125-.813-1.688 2.938-1.187 5.5-3 7.5-4.875zM12 1.813c2.625 0 5.063.938 6.938 2.5-1.813 1.75-4.188 3.438-6.938 4.5-1.5-2.75-3.188-5.063-5-6.813.938-.125 1.875-.187 3-.187zM5.063 2.938c1.875 1.75 3.625 4.063 5.125 6.875-3 .813-6.375 1.25-10 1.25.063.063 0 .125 0 .188 0-.063 0-.125 0-.188.75-3.438 2.563-6.375 4.875-8.125zM1.813 12c0-.125 0-.188 0-.313 3.875 0 7.5-.438 10.75-1.313.25.5.5 1 .75 1.5-4.625 1.438-8.188 4.438-10.75 8.188-1.125-2.438-1.75-5.188-1.75-8.063zm3.5 9.938c2.5-3.625 5.875-6.438 10.125-7.813.938 2.438 1.625 5.063 2 7.75-1.438.563-3 .938-4.688.938-2.75-.063-5.375-.938-7.438-2.563l.001 1.688zm10.187.125c-.375-2.438-1-4.813-1.813-7.063 2.313-.563 4.938-.688 7.875-.063-.5 3.188-2.438 5.938-5.063 7.438.313-.125.688-.188 1-.313z"/>
        </svg>
        <span>${contact.dribbbleLabel || 'Dribbble'}</span>
      </a>
    `;
  }

  // Behance
  if (contact.behanceUrl) {
    linksHtml += `
      <a href="${contact.behanceUrl}" target="_blank" class="contact-link">
        <svg class="contact-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51h6.938v-.007zM6.545 10.9c.63 0 1.14-.14 1.53-.43.396-.29.6-.75.6-1.39 0-.36-.07-.66-.2-.89-.13-.24-.32-.43-.55-.57-.23-.14-.51-.24-.82-.29-.32-.06-.66-.08-1.01-.08H2.98v3.66h3.565zm.19 5.79c.38 0 .74-.04 1.08-.13.33-.09.62-.24.86-.43.24-.2.43-.45.56-.77.13-.31.2-.7.2-1.15 0-.91-.24-1.58-.72-1.99-.48-.42-1.14-.63-1.99-.63H2.98v5.1h3.755zM15.986 15.65c.397.4.965.6 1.695.6.523 0 .98-.13 1.37-.4.39-.27.63-.55.73-.84h2.42c-.38 1.18-.97 2.03-1.78 2.55-.8.52-1.78.79-2.92.79-.79 0-1.51-.12-2.15-.38-.64-.25-1.19-.62-1.65-1.09-.46-.48-.82-1.05-1.07-1.73-.25-.67-.38-1.43-.38-2.26 0-.8.13-1.54.39-2.2.26-.67.62-1.24 1.08-1.73.46-.48 1.01-.85 1.63-1.12.62-.27 1.3-.4 2.05-.4.84 0 1.57.16 2.2.47.63.31 1.15.74 1.55 1.28.41.54.71 1.17.9 1.88.19.7.26 1.45.2 2.24h-7.19c.05.9.33 1.58.73 1.98zM19.19 10.43c-.3-.36-.8-.55-1.48-.55-.45 0-.82.08-1.11.24-.3.16-.52.36-.7.58-.17.23-.29.46-.35.7-.06.25-.1.46-.11.65h4.33c-.1-.7-.27-1.26-.58-1.62zM15.09 6.67h5.34v1.37h-5.34V6.67z"/>
        </svg>
        <span>${contact.behanceLabel || 'Behance'}</span>
      </a>
    `;
  }

  if (linksHtml) {
    linksContainer.innerHTML = linksHtml;
  }
}

// Fetch site settings (favicon, title, OG image)
async function fetchSiteSettings() {
  const query = `*[_type == "siteSettings"][0] {
    title,
    description,
    ogImage,
    favicon,
    appleTouchIcon
  }`;

  try {
    const response = await fetch(sanityUrl(query));
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}

// Apply site settings to the page
function applySiteSettings(settings) {
  if (!settings) return;

  // Update page title
  if (settings.title) {
    document.title = settings.title;
  }

  // Update meta description
  if (settings.description) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = settings.description;

    // Also update OG description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.content = settings.description;
  }

  // Update favicon
  if (settings.favicon && settings.favicon.asset) {
    const faviconUrl = sanityImageUrl(settings.favicon, 64, 100);
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = faviconUrl;
  }

  // Update Apple touch icon
  if (settings.appleTouchIcon && settings.appleTouchIcon.asset) {
    const touchIconUrl = sanityImageUrl(settings.appleTouchIcon, 180, 100);
    let touchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!touchIcon) {
      touchIcon = document.createElement('link');
      touchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(touchIcon);
    }
    touchIcon.href = touchIconUrl;
  }

  // Update OG image
  if (settings.ogImage && settings.ogImage.asset) {
    const ogImageUrl = sanityImageUrl(settings.ogImage, 1200, 90);
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.content = ogImageUrl;
  }

  console.log('Site settings applied:', settings.title);
}

// Initialize CMS content
async function initSanityContent() {
  try {
    // Fetch all content in parallel
    const [projects, experiences, education, testimonials, contactInfo, aboutInfo, blogPosts, siteSettings] = await Promise.all([
      fetchProjects(),
      fetchWorkExperience(),
      fetchEducation(),
      fetchTestimonials(),
      fetchContactInfo(),
      fetchAboutInfo(),
      fetchBlogPosts(),
      fetchSiteSettings()
    ]);

    // Apply site settings first
    applySiteSettings(siteSettings);

    // Render content
    if (projects.length > 0) renderProjects(projects);
    if (experiences.length > 0) renderWorkExperience(experiences);
    if (education.length > 0) renderEducation(education);
    if (testimonials.length > 0) renderTestimonials(testimonials);
    if (contactInfo) renderContactInfo(contactInfo);

    // Render About section and overlay
    renderAboutSection(aboutInfo, experiences);
    renderAboutOverlay(aboutInfo, experiences, education);

    // Render Blog posts
    renderBlogPosts(blogPosts);
    initBlogSearch();

    // Expose data globally for list view
    window.projectsData = projects;
    window.blogPostsData = blogPosts;
    window.aboutInfo = aboutInfo;
    window.contactInfo = contactInfo;
    window.experiencesData = experiences;
    window.testimonialsData = testimonials;
    window.sanityImageUrl = sanityImageUrl;

    // Update list view if it's open
    if (typeof window.populateListView === 'function') {
      window.populateListView();
    }

    // Check for deep link after content is loaded
    checkAboutDeepLink();

    console.log('Sanity content loaded:', {
      projects: projects.length,
      experiences: experiences.length,
      education: education.length,
      testimonials: testimonials.length,
      contactInfo: contactInfo ? 'loaded' : 'not found',
      aboutInfo: aboutInfo ? 'loaded' : 'not found',
      blogPosts: blogPosts.length
    });
  } catch (error) {
    console.error('Error initializing Sanity content:', error);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSanityContent);
} else {
  initSanityContent();
}
