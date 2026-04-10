// src/sanity/schemaTypes/dailySession.ts
import { defineField, defineType } from "sanity";

export const dailySession = defineType({
  name: "dailySession",
  title: "Sesión Diaria (Daily Session)",
  type: "document",
  fields: [
    defineField({
      name: "kidProfile",
      title: "Niño Asignado",
      type: "reference",
      to: [{ type: "kidProfile" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Fecha de la Sesión",
      type: "date",
      description: "El día en que el niño debe jugar estas misiones",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "missions",
      title: "Misiones del Día",
      type: "array",
      of: [
        {
          type: "object",
          name: "missionConfig",
          fields: [
            {
              name: "gameType",
              title: "Juego",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "title",
              title: "Título Personalizado",
              type: "string",
              description: "Ej: Práctica de Memoria de Juanito",
            },
            {
              name: "difficulty",
              title: "Dificultad",
              type: "string",
              options: { list: ["easy", "medium", "hard"] },
              initialValue: "medium",
            },
            {
              name: "timeLimit",
              title: "Límite de Tiempo (segundos)",
              type: "number",
              initialValue: 60,
            },
            {
              name: "energyReward",
              title: "Cristales",
              type: "number",
              initialValue: 50,
            },
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "gameType",
              diff: "difficulty",
            },
            prepare({ title, subtitle, diff }) {
              return { title: title || subtitle, subtitle: `Nivel: ${diff}` };
            },
          },
        },
      ],
    }),
    defineField({
      name: "completedMissions",
      title: "Misiones Completadas (IDs)",
      type: "array",
      of: [{ type: "string" }],
      initialValue: [],
      // readOnly: true, // Lo llenaremos por código, no a mano
    }),
    defineField({
      name: "isCompleted",
      title: "¿Sesión Completada?",
      type: "boolean",
      initialValue: false,
      description:
        "Se marcará como true automáticamente cuando el niño termine las 3 misiones.",
    }),
    defineField({
      name: "telemetryData",
      title: "Telemetría Clínica (JSON)",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Datos crudos de rendimiento cognitivo guardados en formato JSON.",
      initialValue: [],
    }),
  ],

  preview: {
    select: {
      title: "kidProfile.alias",
      date: "date",
      completed: "isCompleted",
    },
    prepare({ title, date, completed }) {
      return {
        title: `${title} - ${date}`,
        subtitle: completed ? "✅ Completada" : "⏳ Pendiente",
      };
    },
  },
});
