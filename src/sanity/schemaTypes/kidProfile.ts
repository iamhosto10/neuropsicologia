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
  ],
  preview: {
    select: {
      title: "alias",
      subtitle: "energyCrystals",
    },
    prepare(selection) {
      const { title, subtitle } = selection;
      return {
        title: title,
        subtitle: `${subtitle} Cristales`,
      };
    },
  },
});
