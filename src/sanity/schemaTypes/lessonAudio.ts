import { defineField, defineType } from "sanity";

export const lessonAudio = defineType({
  name: "lessonAudio",
  title: "Reproductor de Audio (WaveSurfer)",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Título o Instrucción",
      type: "string",
      description: "Ejemplo: 'Escucha atentamente el mensaje del Comandante'",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "audioFile",
      title: "Archivo de Audio",
      type: "file",
      options: {
        accept: "audio/*",
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: `🎧 Audio: ${title}`,
      };
    },
  },
});
