// import { defineField, defineType } from "sanity";

// export const gameModule = defineType({
//   name: "gameModule",
//   title: "Módulo de Juego (Atención)",
//   type: "object",
//   fields: [
//     defineField({
//       name: "title",
//       title: "Título del Juego",
//       type: "string",
//     }),
//     defineField({
//       name: "instruction",
//       title: "Instrucción (Voz/Texto)",
//       type: "string",
//       description: "Ej: Haz clic solo en los cristales azules",
//     }),
//     defineField({
//       name: "targetObject",
//       title: "Objeto Objetivo (Target)",
//       type: "image",
//       description: "El objeto que el niño debe atrapar (ej. Cristal Azul)",
//       options: { hotspot: true },
//     }),
//     defineField({
//       name: "distractorObjects",
//       title: "Objetos Distractores",
//       type: "array",
//       of: [{ type: "image" }],
//       description: "Basura espacial, asteroides, etc.",
//     }),
//     defineField({
//       name: "difficulty",
//       title: "Nivel de Dificultad",
//       type: "string",
//       options: {
//         list: [
//           { title: "Fácil (Lento, pocos distractores)", value: "easy" },
//           { title: "Medio (Velocidad normal)", value: "medium" },
//           { title: "Difícil (Rápido, alta interferencia)", value: "hard" },
//         ],
//       },
//     }),
//     defineField({
//       name: "duration",
//       title: "Duración (segundos)",
//       type: "number",
//       initialValue: 60,
//     }),
//   ],
// });

import { defineField, defineType } from "sanity";

export const gameModule = defineType({
  name: "gameModule",
  title: "Módulo de Juego",
  type: "object",
  fields: [
    // 1. NUEVO CAMPO: SELECTOR DE TIPO DE JUEGO
    defineField({
      name: "gameType",
      title: "Tipo de Juego",
      type: "string",
      options: {
        list: [
          { title: "Limpieza Espacial (Atención Selectiva)", value: "cleanup" },
          {
            title: "Centinela Satélite (Atención Sostenida)",
            value: "satellite",
          }, // <--- Nuevo
          {
            title: "Campo de Asteroides (Control Inhibitorio)",
            value: "asteroid",
          },
        ],
        layout: "radio",
      },
      initialValue: "cleanup",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "title",
      title: "Título del Juego",
      type: "string",
    }),
    defineField({
      name: "instruction",
      title: "Instrucción",
      type: "string",
    }),

    // // Usaremos este campo para el "Satélite" o para el "Cristal Azul"
    // defineField({
    //   name: "targetObject",
    //   title: "Objeto Principal (Target)",
    //   type: "image",
    //   description:
    //     "En Satélite: Es la imagen del satélite. En Limpieza: Es el objeto a atrapar.",
    //   options: { hotspot: true },
    // }),

    // // Usaremos este campo para los "Planetas/Nubes" que tapan la visión
    // defineField({
    //   name: "distractorObjects",
    //   title: "Objetos Secundarios / Distractores",
    //   type: "array",
    //   of: [{ type: "image" }],
    //   description: "En Satélite: Planetas o nubes que ocultan al satélite.",
    // }),

    defineField({
      name: "targetObject",
      title: "Estímulo GO (Acelerar)",
      type: "image",
      description: "Para Asteroides: Imagen del Portal o Señal Verde.",
      options: { hotspot: true },
    }),
    defineField({
      name: "distractorObjects",
      title: "Estímulo NO-GO (Frenar)",
      type: "array",
      of: [{ type: "image" }],
      description:
        "Para Asteroides: Barreras rojas o Asteroides que NO se deben tocar.",
    }),

    defineField({
      name: "difficulty",
      title: "Nivel de Dificultad",
      type: "string",
      options: {
        list: [
          { title: "Fácil", value: "easy" },
          { title: "Medio", value: "medium" },
          { title: "Difícil", value: "hard" },
        ],
      },
    }),
    defineField({
      name: "duration",
      title: "Duración (segundos)",
      type: "number",
      initialValue: 60,
    }),
  ],
});
