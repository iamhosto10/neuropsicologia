import { defineField, defineType } from "sanity";

export const course = defineType({
  name: "course",
  title: "Course",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Titulo",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripcion",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "age",
      title: "Edad Recomendad",
      type: "string",
      description: 'ej. "6-9 años"',
    }),
    defineField({
      name: "duration",
      title: "Duracion (minutos)",
      type: "number",
      description: "30",
    }),
    defineField({
      name: "level",
      title: "Nivel",
      type: "string",
      options: {
        list: [
          { title: "Básico", value: "Básico" },
          { title: "Intermedio", value: "Intermedio" },
          { title: "Avanzado", value: "Avanzado" },
        ],
      },
    }),
    defineField({
      name: "image",
      title: "Imagen",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "object",
      fields: [
        {
          name: "file",
          title: "Archivo de video",
          type: "file",
          options: {
            accept: "video/*",
          },
        },
        {
          name: "url",
          title: "URL del video (YouTube / Vimeo)",
          type: "url",
        },
      ],
    }),
    defineField({
      name: "objectives",
      title: "Objetivos de Aprendizaje",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "syllabus",
      title: "Contenido del Curso",
      type: "array",
      of: [
        {
          type: "object",
          name: "module",
          title: "Module",
          fields: [
            defineField({
              name: "title",
              title: "Module Title",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "lessons",
              title: "Lessons / Activities",
              type: "array",
              of: [{ type: "reference", to: { type: "lesson" } }],
            }),
          ],
        },
      ],
    }),

    defineField({
      name: "relatedCourse",
      title: "Cursos Relacionados",
      type: "array",
      of: [{ type: "reference", to: [{ type: "course" }] }],
    }),
  ],
});
