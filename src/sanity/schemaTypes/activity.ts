import { defineField, defineType } from "sanity";

export const activity = defineType({
  name: "activity",
  title: "Activity",
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
      name: "duration",
      title: "Duracion (minutos)",
      type: "number",
    }),
    defineField({
      name: "ageRange",
      title: "Rango de edades",
      type: "string",
      description: 'ej. "3-5 años"',
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
      name: "materials",
      title: "Materiales Necesarios",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "objectives",
      title: "Objetivos de Aprendizaje",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "instructions",
      title: "Instrucciones",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Titulo", type: "string" },
            { name: "description", title: "Descripcion", type: "string" },
            {
              name: "icon",
              title: "Icono",
              type: "string",
              options: {
                list: [
                  { title: "Sonrisa", value: "Smile" },
                  { title: "Manito", value: "Hand" },
                  { title: "Ojo", value: "Eye" },
                ],
              },
            },
          ],
        },
      ],
    }),
    defineField({
      name: "benefits",
      title: "Beneficios de la actividad",
      type: "text",
    }),
    defineField({
      name: "advice",
      title: "Consejos para acompañar",
      type: "text",
    }),

    {
      name: "relatedActivity",
      title: "Actividades Relacionadas",
      type: "array",
      of: [{ type: "reference", to: [{ type: "activity" }] }],
    },
  ],
});
