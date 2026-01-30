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
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g., "Istanbul, Türkiye"',
    },
    {
      name: 'startDate',
      title: 'Start Date',
      type: 'string',
      description: 'e.g., "2018"',
    },
    {
      name: 'endDate',
      title: 'End Date',
      type: 'string',
      description: 'e.g., "2022"',
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
}
