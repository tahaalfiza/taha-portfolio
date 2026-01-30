export default {
  name: 'contactInfo',
  title: 'Contact Info',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'e.g., "Let\'s Create Something Amazing"',
    },
    {
      name: 'subtitle',
      title: 'Section Subtitle',
      type: 'string',
      description: 'e.g., "I\'m always open to discussing new projects..."',
    },
    {
      name: 'email',
      title: 'Email Address',
      type: 'string',
    },
    {
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      description: 'e.g., "+905340246332"',
    },
    {
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
    },
    {
      name: 'linkedinLabel',
      title: 'LinkedIn Label',
      type: 'string',
      initialValue: 'LinkedIn',
    },
    {
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    },
    {
      name: 'instagramLabel',
      title: 'Instagram Label',
      type: 'string',
      initialValue: 'Instagram',
    },
    {
      name: 'twitterUrl',
      title: 'Twitter/X URL',
      type: 'url',
    },
    {
      name: 'twitterLabel',
      title: 'Twitter/X Label',
      type: 'string',
      initialValue: 'Twitter',
    },
    {
      name: 'dribbbleUrl',
      title: 'Dribbble URL',
      type: 'url',
    },
    {
      name: 'dribbbleLabel',
      title: 'Dribbble Label',
      type: 'string',
      initialValue: 'Dribbble',
    },
    {
      name: 'behanceUrl',
      title: 'Behance URL',
      type: 'url',
    },
    {
      name: 'behanceLabel',
      title: 'Behance Label',
      type: 'string',
      initialValue: 'Behance',
    },
  ],
}
