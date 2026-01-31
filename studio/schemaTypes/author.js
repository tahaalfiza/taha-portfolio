export default {
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    },
    {
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Author profile photo (recommended: square, at least 200x200px)',
    },
    {
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      description: 'e.g., "Brand & Product Designer", "Developer", "Guest Writer"',
    },
    {
      name: 'bio',
      title: 'Short Bio',
      type: 'text',
      rows: 3,
      description: 'Brief description shown in author info',
    },
    {
      name: 'website',
      title: 'Website URL',
      type: 'url',
      description: 'Optional link to author\'s website or portfolio',
    },
    {
      name: 'twitter',
      title: 'Twitter/X Handle',
      type: 'string',
      description: 'e.g., @username (without the @)',
    },
    {
      name: 'isOwner',
      title: 'Is Site Owner',
      type: 'boolean',
      initialValue: false,
      description: 'Check this if this is you (the portfolio owner)',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image',
    },
  },
}
