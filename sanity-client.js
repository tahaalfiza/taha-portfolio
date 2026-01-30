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
function sanityImageUrl(imageRef, width = 400) {
  if (!imageRef || !imageRef.asset || !imageRef.asset._ref) return '';

  // Parse the image reference: image-{id}-{dimensions}-{format}
  const ref = imageRef.asset._ref;
  const [, id, dimensions, format] = ref.split('-');

  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dimensions}.${format}?w=${width}&fit=crop`;
}

// Fetch all projects
async function fetchProjects() {
  const query = `*[_type == "project"] | order(order asc) {
    _id,
    title,
    slug,
    description,
    duration,
    date,
    folderColor,
    images,
    projectUrl,
    order
  }`;

  try {
    const response = await fetch(sanityUrl(query));
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Fetch all work experiences
async function fetchWorkExperience() {
  const query = `*[_type == "workExperience"] | order(order asc) {
    _id,
    role,
    company,
    companyUrl,
    location,
    startDate,
    endDate,
    description,
    order
  }`;

  try {
    const response = await fetch(sanityUrl(query));
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error fetching work experience:', error);
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

// Render projects into the folders grid
function renderProjects(projects) {
  const container = document.querySelector('.folders-grid');
  if (!container || projects.length === 0) return;

  container.innerHTML = projects.map(project => {
    const colorClass = project.folderColor || 'default';
    const folderColorClass = colorClass === 'default' ? '' : colorClass;

    // Get up to 3 images
    const images = project.images || [];
    const imageHtml = images.slice(0, 3).map((img, i) => {
      const url = sanityImageUrl(img, 200);
      return url ? `<img class="popup-img img-${i + 1}" src="${url}" alt="Preview ${i + 1}">` : '';
    }).join('');

    return `
      <div class="mac-folder" ${project.projectUrl ? `onclick="window.open('${project.projectUrl}', '_blank')"` : ''}>
        <div class="folder-wrapper">
          <div class="popup-images">
            ${imageHtml}
          </div>
          <div class="folder-icon ${folderColorClass}">
            <div class="folder-tab"></div>
            <div class="folder-body"></div>
          </div>
        </div>
        <div class="folder-info">
          <span class="folder-duration">${project.duration || ''}</span>
          <span class="folder-date">${project.date || ''}</span>
        </div>
        <h3 class="folder-name">${project.title}</h3>
      </div>
    `;
  }).join('');
}

// Render work experience
function renderWorkExperience(experiences) {
  const container = document.querySelector('.career-section .career-title');
  if (!container) return;

  // Find the work experience section
  const workSection = document.querySelector('.career-card .career-section');
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

// Render testimonials as sticky notes
function renderTestimonials(testimonials) {
  if (testimonials.length === 0) return;

  // Remove existing floating notes
  document.querySelectorAll('.floating-note').forEach(note => note.remove());

  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  // Positions for testimonials (spread them out)
  const positions = [
    { left: '50%', top: '42%' },
    { left: '55%', top: '55%' },
    { left: '50%', top: '68%' },
    { left: '45%', top: '48%' },
    { left: '58%', top: '62%' }
  ];

  testimonials.forEach((testimonial, i) => {
    const pos = positions[i % positions.length];
    const color = testimonial.color || 'yellow';

    const note = document.createElement('div');
    note.className = `canvas-section floating-note note-${i + 1}`;
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
  });
}

// Initialize CMS content
async function initSanityContent() {
  try {
    // Fetch all content in parallel
    const [projects, experiences, testimonials] = await Promise.all([
      fetchProjects(),
      fetchWorkExperience(),
      fetchTestimonials()
    ]);

    // Render content
    if (projects.length > 0) renderProjects(projects);
    if (experiences.length > 0) renderWorkExperience(experiences);
    if (testimonials.length > 0) renderTestimonials(testimonials);

    console.log('Sanity content loaded:', { projects: projects.length, experiences: experiences.length, testimonials: testimonials.length });
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
