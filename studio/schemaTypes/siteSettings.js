export default {
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'branding', title: 'Branding & Images', default: true },
    { name: 'seo', title: 'SEO & Meta' },
  ],
  fields: [
    // Branding & Images Group
    {
      name: 'avatar',
      title: 'Avatar / Logo',
      type: 'image',
      options: { hotspot: true },
      description: 'Your avatar/logo used across all pages (Home hero, loader, navigation). Recommended: Square image, at least 200x200px.',
      group: 'branding',
    },
    {
      name: 'avatarAlt',
      title: 'Avatar Alt Text',
      type: 'string',
      description: 'Alternative text for the avatar (for accessibility)',
      group: 'branding',
    },
    {
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Icon shown in browser tabs (recommended: 32x32px or 64x64px PNG)',
      group: 'branding',
    },
    {
      name: 'appleTouchIcon',
      title: 'Apple Touch Icon',
      type: 'image',
      description: 'Icon for iOS home screen (recommended: 180x180px PNG)',
      group: 'branding',
    },
    // SEO & Meta Group
    {
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'The title shown in browser tabs and search results',
      group: 'seo',
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text',
      rows: 3,
      description: 'Description for search engines and social media',
      group: 'seo',
    },
    {
      name: 'ogImage',
      title: 'Share Image (OG Image)',
      type: 'image',
      options: { hotspot: true },
      description: 'Image shown when sharing links on social media (recommended: 1200x630px)',
      group: 'seo',
    },
  ],
  preview: {
    select: {
      media: 'avatar',
    },
    prepare({ media }) {
      return {
        title: 'Site Settings',
        subtitle: 'Avatar, branding & SEO settings',
        media: media,
      }
    },
  },
}
