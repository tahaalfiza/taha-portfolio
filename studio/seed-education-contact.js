// Seed script to populate Sanity with education and contact info
// Run with: SANITY_AUTH_TOKEN="your-token" npx sanity exec seed-education-contact.js

import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'hsbvy0xe',
  dataset: 'production',
  useCdn: false,
  token: process.env.SANITY_AUTH_TOKEN,
  apiVersion: '2024-01-01'
})

// Education data from your website
const educationData = [
  {
    _type: 'education',
    degree: 'TÖMER Turkish Language B1',
    institution: 'ITÜ',
    location: 'Istanbul, Türkiye',
    startDate: '2023',
    endDate: '2024',
    order: 1
  },
  {
    _type: 'education',
    degree: "Bachelor's in Communication Design",
    institution: 'BAÜ',
    location: 'Istanbul, Türkiye',
    startDate: '2018',
    endDate: '2022',
    order: 2
  }
]

// Contact info from your website
const contactData = {
  _type: 'contactInfo',
  title: "Let's Create Something Amazing",
  subtitle: "I'm always open to discussing new projects and opportunities.",
  email: 'taha.alfiza@gmail.com',
  linkedinUrl: 'https://www.linkedin.com/in/tahaalfiza/',
  linkedinLabel: 'LinkedIn',
  instagramUrl: 'https://www.instagram.com/tahaalfiza/',
  instagramLabel: 'Instagram'
}

async function seedData() {
  console.log('Starting to seed education and contact data...')

  // Create education entries
  console.log('Creating education entries...')
  for (const edu of educationData) {
    const result = await client.create(edu)
    console.log(`Created education: ${result.degree} at ${result.institution}`)
  }

  // Create contact info
  console.log('Creating contact info...')
  const contactResult = await client.create(contactData)
  console.log(`Created contact info: ${contactResult.title}`)

  console.log('Seeding complete!')
}

seedData().catch(console.error)
