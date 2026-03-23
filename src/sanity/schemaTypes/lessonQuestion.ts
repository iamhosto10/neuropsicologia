import { defineField, defineType } from "sanity";

export const lessonQuestion = defineType({
  name: "lessonQuestion",
  title: "Pregunta Interactiva (Quiz)",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Pregunta",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "options",
      title: "Opciones de Respuesta",
      type: "array",
      of: [{ type: "string" }],
      description: "Agrega las 4 opciones de respuesta.",
      validation: (Rule) =>
        Rule.required()
          .min(2)
          .max(4)
          .error("Debes agregar entre 2 y 4 opciones."),
    }),
    defineField({
      name: "correctOptionIndex",
      title: "Índice de la Respuesta Correcta",
      type: "number",
      description:
        "0 para la primera opción, 1 para la segunda, 2 para la tercera, 3 para la cuarta.",
      validation: (Rule) => Rule.required().min(0).max(3).integer(),
    }),
    defineField({
      name: "reward",
      title: "Cristales de Recompensa",
      type: "number",
      description: "¿Cuántos cristales gana el cadete por responder bien?",
      initialValue: 10,
    }),
  ],
  preview: {
    select: {
      title: "question",
    },
    prepare({ title }) {
      return {
        title: `❓ Quiz: ${title}`,
      };
    },
  },
});
