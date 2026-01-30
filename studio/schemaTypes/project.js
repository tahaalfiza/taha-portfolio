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
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: 'Click "Generate" to create from title, or enter custom. Full URL: /projects/[this-value]',
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
      description: 'Detailed description shown in the overlay header',
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
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'projectCategory' }],
      description: 'Select a category for this project (shown in Finder sidebar)',
    },
    {
      name: 'folderTabColor',
      title: 'Folder Tab Color',
      type: 'string',
      description: 'CSS color or gradient for the tab. e.g., "#7DC8FB" or "linear-gradient(180deg, #60A5FA 0%, #3B82F6 100%)"',
    },
    {
      name: 'folderBodyColor',
      title: 'Folder Body Color',
      type: 'string',
      description: 'CSS color or gradient for the body. e.g., "#4BA3E3" or "linear-gradient(180deg, #60A5FA 0%, #2563EB 50%, #1D4ED8 100%)"',
    },
    {
      name: 'overlayBgColor',
      title: 'Overlay Background Color',
      type: 'string',
      description: 'Background color for the project overlay. e.g., "#1a1a2e", "#0f0f23", or a gradient',
    },
    {
      name: 'images',
      title: 'Project Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Add up to 3 images that pop out from the folder',
    },
    {
      name: 'contentBlocks',
      title: 'Project Content',
      type: 'array',
      description: 'Add images, videos, and text in any order you want',
      of: [
        {
          type: 'object',
          name: 'imageBlock',
          title: 'Image',
          fields: [
            {
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
            },
            {
              name: 'caption',
              title: 'Caption (optional)',
              type: 'string',
            },
            {
              name: 'fullWidth',
              title: 'Full Width',
              type: 'boolean',
              initialValue: true,
              description: 'If unchecked, image will be displayed at a smaller size',
            },
          ],
          preview: {
            select: {
              media: 'image',
              caption: 'caption',
            },
            prepare({ media, caption }) {
              return {
                title: caption || 'Image',
                subtitle: 'Image Block',
                media: media,
              }
            },
          },
        },
        {
          type: 'object',
          name: 'videoBlock',
          title: 'Video Embed',
          fields: [
            {
              name: 'embedCode',
              title: 'Embed Code',
              type: 'text',
              description: 'Paste the full embed code from Vimeo, YouTube, or any video platform',
            },
            {
              name: 'caption',
              title: 'Caption (optional)',
              type: 'string',
            },
          ],
          preview: {
            select: {
              caption: 'caption',
            },
            prepare({ caption }) {
              return {
                title: caption || 'Video',
                subtitle: 'Video Embed Block',
              }
            },
          },
        },
        {
          type: 'object',
          name: 'textBlock',
          title: 'Text Block',
          fields: [
            {
              name: 'heading',
              title: 'Heading (optional)',
              type: 'string',
            },
            {
              name: 'text',
              title: 'Text Content',
              type: 'text',
              description: 'Add a paragraph of text to describe your work',
            },
            {
              name: 'textAlign',
              title: 'Text Alignment',
              type: 'string',
              options: {
                list: [
                  { title: 'Left', value: 'left' },
                  { title: 'Center', value: 'center' },
                  { title: 'Right', value: 'right' },
                ],
              },
              initialValue: 'left',
            },
          ],
          preview: {
            select: {
              heading: 'heading',
              text: 'text',
            },
            prepare({ heading, text }) {
              return {
                title: heading || (text ? text.substring(0, 50) + '...' : 'Text Block'),
                subtitle: 'Text Block',
              }
            },
          },
        },
      ],
    },
    {
      name: 'galleryImages',
      title: 'Gallery Images (Legacy)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description: 'Old gallery field - use "Project Content" above instead for more flexibility',
      hidden: true,
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
