import { defineField, defineType } from "sanity";

export const mission = defineType({
  name: "mission",
  title: "Misión Terapéutica (Mission)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título de la Misión",
      type: "string",
      description: "Ej: Limpiando la órbita (Atención Selectiva)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gameType",
      title: "Motor de Juego",
      type: "string",
      description: "¿Qué componente de React va a renderizar esta misión?",
      options: {
        list: [
          {
            title: "Campo de Asteroides (Go/No-Go)",
            value: "asteroids_go_nogo",
          },
          { title: "Constructor de Caras (Emociones)", value: "emotion_faces" },
          { title: "Secuencia Inversa (Memoria)", value: "simon_says_reverse" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "difficulty",
      title: "Dificultad",
      type: "string",
      options: {
        list: [
          { title: "Fácil (Ventanas de tiempo largas)", value: "easy" },
          { title: "Medio", value: "medium" },
          { title: "Difícil (Ventanas de tiempo cortas)", value: "hard" },
        ],
      },
      initialValue: "medium",
    }),
    defineField({
      name: "energyReward",
      title: "Recompensa (Cristales)",
      type: "number",
      initialValue: 50,
      description: "Cristales que gana el niño al completarla",
    }),
  ],
});
