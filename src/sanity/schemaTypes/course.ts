import { defineField, defineType } from 'sanity'

export const course = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'age',
      title: 'Age Group',
      type: 'string',
      description: 'e.g. "6-9 ans"',
    }),
    defineField({
      name: 'bgColor',
      title: 'Background Color Class',
      type: 'string',
      description: 'CSS class for background color, e.g. "bg-blue-100"',
    }),
    defineField({
      name: 'image',
      title: 'Course Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'syllabus',
      title: 'Syllabus',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'module',
          title: 'Module',
          fields: [
            defineField({
              name: 'title',
              title: 'Module Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'lessons',
              title: 'Lessons / Activities',
              type: 'array',
              of: [{ type: 'reference', to: { type: 'activity' } }],
            }),
          ],
        },
      ],
    }),
  ],
})
