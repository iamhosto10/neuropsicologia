import { defineField, defineType } from "sanity";

export const gameModule = defineType({
  name: "gameModule",
  title: "Módulo de Juego",
  type: "object",
  fields: [
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
          },
          {
            title: "Campo de Asteroides (Control Inhibitorio)",
            value: "asteroid",
          },
          { title: "Comunicador Inverso (Flexibilidad)", value: "reverse" },
          {
            title: "Panel de Seguridad (Memoria Visoespacial)",
            value: "memori",
          },
          {
            title: "Gran Evasión (Multitarea y Atención Dividida)",
            value: "multitask",
          },
          { title: "Laboratorio de Carga (Memoria N-Back)", value: "n_back" },
          {
            title: "Tormenta de Nebulosa (Control de Interferencia)",
            value: "nebula",
          },
          {
            title: "Decodificador de Señales (Velocidad Procesamiento)",
            value: "symbol_digit",
          },
        ],
        layout: "dropdown",
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
