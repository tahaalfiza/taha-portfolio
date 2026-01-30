export default {
  name: 'projectCategory',
  title: 'Project Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Category Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'e.g., "Branding", "Product", "UI/UX", "Web", "Mobile"',
    },
    {
      name: 'icon',
      title: 'Icon Name',
      type: 'string',
      description: 'Icon identifier (optional). Options: branding, product, ui-ux, web, mobile, app, graphic, motion, 3d',
      options: {
        list: [
          { title: 'Branding (Clock)', value: 'branding' },
          { title: 'Product (Layout)', value: 'product' },
          { title: 'UI/UX (Monitor)', value: 'ui-ux' },
          { title: 'Web (Globe)', value: 'web' },
          { title: 'Mobile (Phone)', value: 'mobile' },
          { title: 'App (Grid)', value: 'app' },
          { title: 'Graphic (Pen)', value: 'graphic' },
          { title: 'Motion (Play)', value: 'motion' },
          { title: '3D (Cube)', value: '3d' },
          { title: 'Folder (Default)', value: 'folder' },
        ],
      },
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in sidebar (lower numbers appear first)',
    },
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      order: 'order',
    },
    prepare({ title, order }) {
      return {
        title: title,
        subtitle: order ? `Order: ${order}` : 'No order set',
      }
    },
  },
}
