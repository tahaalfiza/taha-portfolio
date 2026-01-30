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
      title: 'Short Description',
      type: 'text',
      description: 'Brief description for the folder view',
    },
    {
      name: 'fullDescription',
      title: 'Full Description',
      type: 'text',
      description: 'Detailed description shown in the overlay',
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
      name: 'client',
      title: 'Client',
      type: 'string',
      description: 'Client or company name',
    },
    {
      name: 'role',
      title: 'Your Role',
      type: 'string',
      description: 'e.g., "Lead Designer", "Brand Designer"',
    },
    {
      name: 'tools',
      title: 'Tools Used',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g., Figma, Illustrator, Photoshop',
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
      name: 'galleryImages',
      title: 'Gallery Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Full gallery shown in the overlay',
    },
    {
      name: 'projectUrl',
      title: 'External Project URL',
      type: 'url',
      description: 'If set, clicking folder goes directly to this link instead of opening overlay',
    },
    {
      name: 'hasOverlay',
      title: 'Show Overlay',
      type: 'boolean',
      description: 'If true, clicking opens project overlay. If false (or has URL), goes to external link.',
      initialValue: true,
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
