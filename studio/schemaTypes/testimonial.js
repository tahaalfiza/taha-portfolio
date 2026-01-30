export default {
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    {
      name: 'quote',
      title: 'Quote',
      type: 'text',
      validation: (Rule) => Rule.required(),
      description: 'What they said about you',
    },
    {
      name: 'author',
      title: 'Author Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'role',
      title: 'Author Role/Title',
      type: 'string',
      description: 'e.g., "CEO at Company"',
    },
    {
      name: 'color',
      title: 'Sticky Note Color',
      type: 'string',
      options: {
        list: [
          { title: 'Yellow', value: 'yellow' },
          { title: 'Pink', value: 'pink' },
          { title: 'Blue', value: 'blue' },
        ],
      },
      initialValue: 'yellow',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
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
