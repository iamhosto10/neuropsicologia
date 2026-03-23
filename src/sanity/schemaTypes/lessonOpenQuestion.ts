import { defineField, defineType } from "sanity";

export const lessonOpenQuestion = defineType({
  name: "lessonOpenQuestion",
  title: "Pregunta Abierta (Desarrollo)",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Pregunta o Enunciado",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "reward",
      title: "Cristales de Recompensa",
      type: "number",
      description:
        "¿Cuántos cristales gana el cadete por escribir su respuesta?",
      initialValue: 15,
    }),
  ],
  preview: {
    select: { title: "question" },
    prepare({ title }) {
      return { title: `✍️ Pregunta Abierta: ${title}` };
    },
  },
});
