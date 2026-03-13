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
      of: [{ type: "reference", to: [{ type: "mission" }] }],
      validation: (Rule) =>
        Rule.required()
          .max(10)
          .error(
            "Por protocolo terapéutico, un niño no debe tener más de 3 misiones al día.",
          ),
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
