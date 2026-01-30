export default {
  name: 'workExperience',
  title: 'Work Experience',
  type: 'document',
  fields: [
    {
      name: 'role',
      title: 'Role / Position',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'company',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'companyUrl',
      title: 'Company Website',
      type: 'url',
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g., "Dubai, UAE"',
    },
    {
      name: 'startDate',
      title: 'Start Date',
      type: 'string',
      description: 'e.g., "Jan 2023"',
    },
    {
      name: 'endDate',
      title: 'End Date',
      type: 'string',
      description: 'e.g., "Present" or "Dec 2024"',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
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
