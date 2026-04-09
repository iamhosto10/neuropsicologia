import { defineField, defineType } from "sanity";

export const kidProfile = defineType({
  name: "kidProfile",
  title: "Perfil del Niño (Kid Profile)",
  type: "document",
  fields: [
    defineField({
      name: "alias",
      title: "Alias o Nombre Espacial",
      type: "string",
      description:
        "El nombre que el niño verá en su cuartel general (Ej: Comandante Leo)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "parent",
      title: "Padre / Tutor",
      type: "reference",
      to: [{ type: "user" }], // Enlaza con tu esquema 'user' actual (el padre que paga/gestiona)
      description: "El adulto responsable de esta cuenta",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "energyCrystals",
      title: "Cristales de Energía",
      type: "number",
      initialValue: 0,
      description: "La moneda gamificada que el niño gana al jugar",
    }),
    defineField({
      name: "avatarStatus",
      title: "Estado del Avatar",
      type: "string",
      options: {
        list: [
          { title: "Feliz (Batería Alta)", value: "happy" },
          { title: "Hambriento (Batería Media)", value: "hungry" },
          { title: "Agotado (Batería Baja)", value: "tired" },
        ],
      },
      initialValue: "hungry",
      description: "Cómo se ve el robot cuando el niño entra hoy",
    }),
    defineField({
      name: "unlockedAvatars",
      title: "Avatares Desbloqueados",
      type: "array",
      of: [{ type: "string" }],
      description: "IDs de los avatares que el niño ha comprado.",
      initialValue: ["default-cadet"],
    }),
    defineField({
      name: "activeAvatar",
      title: "Avatar Activo",
      type: "string",
      description: "El avatar que tiene puesto actualmente.",
      initialValue: "default-cadet",
    }),
    defineField({
      name: "completedLessons",
      title: "Lecciones Completadas (Cursos)",
      type: "array",
      of: [{ type: "string" }],
      description:
        "IDs de las lecciones educativas que este cadete ha terminado.",
      initialValue: [],
    }),
    defineField({
      name: "assignedCourses",
      title: "Cursos Asignados",
      type: "array",
      of: [{ type: "reference", to: [{ type: "course" }] }],
      description: "Cursos recomendados por el terapeuta para este cadete.",
    }),
    defineField({
      name: "assignedActivities",
      title: "Actividades Asignadas",
      type: "array",
      of: [{ type: "reference", to: [{ type: "activity" }] }],
      description:
        "Actividades recomendadas por el terapeuta para este cadete.",
    }),
    defineField({
      name: "activityLog",
      title: "Bitácora de Actividades (Reflexiones)",
      type: "array",
      description:
        "Registro detallado de las actividades físicas completadas y su evaluación emocional.",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "activityRef",
              title: "Actividad Realizada",
              type: "reference",
              to: [{ type: "activity" }],
            },
            {
              name: "completedAt",
              title: "Fecha y Hora de Finalización",
              type: "datetime",
            },
            {
              name: "reflection",
              title: "Reflexión del Cadete",
              type: "object",
              fields: [
                {
                  name: "mood",
                  title: "Estado de Ánimo (Emoji)",
                  type: "string",
                  options: {
                    list: [
                      { title: "Feliz / Relajado", value: "feliz" },
                      { title: "Normal / Indiferente", value: "normal" },
                      { title: "Frustrado / Cansado", value: "frustrado" },
                    ],
                  },
                },
                {
                  name: "difficulty",
                  title: "Dificultad Percibida (1-3)",
                  type: "number",
                  description: "1: Fácil, 2: Medio, 3: Difícil",
                },
              ],
            },
          ],
          preview: {
            select: {
              title: "activityRef.title",
              subtitle: "completedAt",
              mood: "reflection.mood",
            },
            prepare(selection) {
              const { title, subtitle, mood } = selection;
              const emoji =
                mood === "feliz" ? "😌" : mood === "frustrado" ? "😠" : "😐";
              return {
                title: `${emoji} ${title}`,
                subtitle: subtitle
                  ? new Date(subtitle).toLocaleDateString()
                  : "Sin fecha",
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "completedQuizzes",
      title: "Quizzes de Lecciones Completados",
      type: "array",
      of: [{ type: "string" }],
      description: "IDs de las lecciones donde el cadete ya respondió el quiz.",
      initialValue: [],
    }),
    defineField({
      name: "completedOpenQuestions",
      title: "Preguntas Abiertas Completadas",
      type: "array",
      of: [{ type: "string" }],
      initialValue: [],
    }),
    defineField({
      name: "academicTelemetry",
      title: "Telemetría Académica (Historial de Quizzes)",
      type: "array",
      of: [
        {
          type: "object",
          name: "quizRecord",
          fields: [
            { name: "lessonId", type: "string", title: "ID de la Lección" },
            { name: "blockKey", type: "string", title: "ID Único del Bloque" },
            { name: "isCorrect", type: "boolean", title: "¿Fue correcta?" },
            {
              name: "selected",
              type: "string",
              title: "Seleccionada por el niño",
            },
            { name: "timestamp", type: "datetime", title: "Fecha y Hora" },
          ],
        },
        {
          type: "object",
          name: "openQuestionRecord",
          fields: [
            { name: "lessonId", type: "string", title: "ID de la Lección" },
            { name: "blockKey", type: "string", title: "ID Único del Bloque" },
            {
              name: "responseText",
              type: "string",
              title: "Respuesta del Cadete",
            },
            { name: "timestamp", type: "datetime", title: "Fecha y Hora" },
          ],
        },
      ],
      description:
        "Registro independiente de todos los intentos del cadete en las lecciones.",
      initialValue: [],
    }),
  ],
  preview: {
    select: {
      title: "alias",
      crystals: "energyCrystals", // <-- Corregido el nombre de la variable
    },
    prepare({ title, crystals }) {
      return {
        title: title,
        subtitle: `${crystals || 0} Cristales ⚡`, // <-- Manejo de nulos por seguridad
      };
    },
  },
});
