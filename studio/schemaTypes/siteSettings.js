export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'The title shown in browser tabs and search results',
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text',
      rows: 3,
      description: 'Description for search engines and social media',
    },
    {
      name: 'ogImage',
      title: 'Share Image (OG Image)',
      type: 'image',
      options: { hotspot: true },
      description: 'Image shown when sharing links on social media (recommended: 1200x630px)',
    },
    {
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Icon shown in browser tabs (recommended: 32x32px or 64x64px PNG)',
    },
    {
      name: 'appleTouchIcon',
      title: 'Apple Touch Icon',
      type: 'image',
      description: 'Icon for iOS home screen (recommended: 180x180px PNG)',
    },
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings',
      }
    },
  },
}
