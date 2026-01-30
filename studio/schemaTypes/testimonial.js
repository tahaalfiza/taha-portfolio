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
      description: 'Enter a hex color code (e.g., #fef08a for yellow, #fda4af for pink, #93c5fd for blue)',
      initialValue: '#fef08a',
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
