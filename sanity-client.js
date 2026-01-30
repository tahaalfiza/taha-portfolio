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

// Fetch all education
async function fetchEducation() {
  const query = `*[_type == "education"] | order(order asc) {
    _id,
    degree,
    institution,
    institutionUrl,
    location,
    startDate,
    endDate,
    order
  }`;

  try {
    const response = await fetch(sanityUrl(query));
    const data = await response.json();
    return data.result || [];
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

// Initialize CMS content
async function initSanityContent() {
  try {
    // Fetch all content in parallel
    const [projects, experiences, education, testimonials, contactInfo] = await Promise.all([
      fetchProjects(),
      fetchWorkExperience(),
      fetchEducation(),
      fetchTestimonials(),
      fetchContactInfo()
    ]);

    // Render content
    if (projects.length > 0) renderProjects(projects);
    if (experiences.length > 0) renderWorkExperience(experiences);
    if (education.length > 0) renderEducation(education);
    if (testimonials.length > 0) renderTestimonials(testimonials);
    if (contactInfo) renderContactInfo(contactInfo);

    console.log('Sanity content loaded:', {
      projects: projects.length,
      experiences: experiences.length,
      education: education.length,
      testimonials: testimonials.length,
      contactInfo: contactInfo ? 'loaded' : 'not found'
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
