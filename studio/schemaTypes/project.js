export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g., "3 months", "6 weeks"',
    },
    {
      name: 'date',
      title: 'Date',
      type: 'string',
      description: 'e.g., "2024"',
    },
    {
      name: 'folderColor',
      title: 'Folder Color',
      type: 'string',
      options: {
        list: [
          { title: 'Blue', value: 'blue' },
          { title: 'Yellow', value: 'yellow' },
          { title: 'Default', value: 'default' },
        ],
      },
    },
    {
      name: 'images',
      title: 'Project Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Add up to 3 images that pop out from the folder',
    },
    {
      name: 'projectUrl',
      title: 'Project URL',
      type: 'url',
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
