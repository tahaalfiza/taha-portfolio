export default {
  name: 'education',
  title: 'Education',
  type: 'document',
  fields: [
    {
      name: 'degree',
      title: 'Degree / Certificate',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., "Bachelor\'s in Communication Design"',
    },
    {
      name: 'institution',
      title: 'Institution / School',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., "BAÜ", "ITÜ"',
    },
    {
      name: 'institutionUrl',
      title: 'Institution Website',
      type: 'url',
    },
    {
      name: 'institutionLogo',
      title: 'Institution Logo',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional logo to display',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g., "Istanbul, Türkiye"',
    },
    {
      name: 'startYear',
      title: 'Start Year',
      type: 'number',
      description: 'e.g., 2018',
    },
    {
      name: 'endYear',
      title: 'End Year',
      type: 'number',
      description: 'e.g., 2022',
    },
    {
      name: 'startDate',
      title: 'Start Date (Display)',
      type: 'string',
      description: 'e.g., "2018" - for display purposes',
    },
    {
      name: 'endDate',
      title: 'End Date (Display)',
      type: 'string',
      description: 'e.g., "2022" - for display purposes',
    },
    {
      name: 'description',
      title: 'Description / Notes',
      type: 'text',
      description: 'Additional details about the program',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number = appears first',
    },
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'degree',
      subtitle: 'institution',
      media: 'institutionLogo',
    },
  },
}
