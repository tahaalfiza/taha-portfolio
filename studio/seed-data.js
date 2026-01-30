// Seed script to populate Sanity with existing website content
// Run with: npx sanity exec seed-data.js --with-user-token

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'hsbvy0xe',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2024-01-01'
})

// Projects data from your website
const projects = [
  {
    _type: 'project',
    title: 'Cheers',
    duration: '10 Weeks',
    date: 'Spring 2024',
    folderColor: 'default',
    order: 1
  },
  {
    _type: 'project',
    title: 'Dream Line',
    duration: '10 Weeks',
    date: 'Spring 2025',
    folderColor: 'blue',
    order: 2
  },
  {
    _type: 'project',
    title: 'Torus',
    duration: '10 Weeks',
    date: 'Winter 2025',
    folderColor: 'yellow',
    order: 3
  }
]

// Work Experience data
const workExperiences = [
  {
    _type: 'workExperience',
    role: 'Sr. Designer',
    company: 'tabii by TRT',
    location: 'Istanbul, Türkiye',
    startDate: '2023',
    endDate: 'Now',
    order: 1
  },
  {
    _type: 'workExperience',
    role: 'Brand & Product Designer',
    company: 'Al-Jazeera',
    location: 'Remote',
    startDate: '2024',
    endDate: 'Now',
    order: 2
  },
  {
    _type: 'workExperience',
    role: 'Brand & Product Consultant',
    company: 'Digital Zone',
    location: 'Remote',
    startDate: '2025',
    endDate: 'Now',
    order: 3
  },
  {
    _type: 'workExperience',
    role: 'Design Team Lead & Art Director',
    company: 'KAPITA Business Hub',
    location: 'Remote',
    startDate: '2021',
    endDate: '2023',
    order: 4
  },
  {
    _type: 'workExperience',
    role: 'CO-Founder',
    company: 'Dal Agency',
    location: 'Remote',
    startDate: '2019',
    endDate: '2025',
    order: 5
  }
]

// Testimonials data
const testimonials = [
  {
    _type: 'testimonial',
    quote: 'Amazing work ethic and creative solutions!',
    author: 'Alex',
    role: 'Manager',
    color: 'yellow',
    order: 1
  },
  {
    _type: 'testimonial',
    quote: 'A true UX rockstar. Highly recommend!',
    author: 'Sarah',
    role: 'Designer',
    color: 'pink',
    order: 2
  },
  {
    _type: 'testimonial',
    quote: 'Exceptional attention to detail.',
    author: 'Mike',
    role: 'Developer',
    color: 'blue',
    order: 3
  }
]

async function seedData() {
  console.log('Starting to seed data...')

  // Create projects
  console.log('Creating projects...')
  for (const project of projects) {
    const result = await client.create(project)
    console.log(`Created project: ${result.title}`)
  }

  // Create work experiences
  console.log('Creating work experiences...')
  for (const exp of workExperiences) {
    const result = await client.create(exp)
    console.log(`Created work experience: ${result.role} at ${result.company}`)
  }

  // Create testimonials
  console.log('Creating testimonials...')
  for (const testimonial of testimonials) {
    const result = await client.create(testimonial)
    console.log(`Created testimonial from: ${result.author}`)
  }

  console.log('Seeding complete!')
}

seedData().catch(console.error)
