export default {
  name: 'aboutInfo',
  title: 'About Info',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'title',
      title: 'Professional Title',
      type: 'string',
      description: 'e.g., "Brand & Product Designer"',
    },
    {
      name: 'photo',
      title: 'Profile Photo',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'shortBio',
      title: 'Short Bio (Main Page)',
      type: 'text',
      description: 'Brief bio for the main about section (2-5 lines)',
    },
    {
      name: 'fullBio',
      title: 'Full Bio (Overlay)',
      type: 'text',
      description: 'Extended bio for the about overlay',
    },
    {
      name: 'location',
      title: 'Current Location',
      type: 'string',
      description: 'e.g., "Istanbul, Turkey"',
    },
    {
      name: 'yearsExperience',
      title: 'Years of Experience',
      type: 'string',
      description: 'e.g., "10+"',
    },
    {
      name: 'highlights',
      title: 'Highlights / Quick Facts',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'icon',
              title: 'Icon Name',
              type: 'string',
              description: 'e.g., "briefcase", "globe", "award", "users"',
            },
            {
              name: 'label',
              title: 'Label',
              type: 'string',
            },
            {
              name: 'value',
              title: 'Value',
              type: 'string',
            },
          ],
          preview: {
            select: {
              label: 'label',
              value: 'value',
            },
            prepare({ label, value }) {
              return {
                title: `${label}: ${value}`,
              }
            },
          },
        },
      ],
    },
    {
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of skills (e.g., Figma, Branding, UI/UX)',
    },
    {
      name: 'ctaText',
      title: 'CTA Button Text',
      type: 'string',
      description: 'Text for the "View full profile" button',
      initialValue: 'View Full Profile',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'photo',
    },
  },
}
