import { defineField, defineType } from "sanity";

export const storeAvatar = defineType({
  name: "storeAvatar",
  title: "Bazar Espacial (Avatares/Objetos)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nombre del Objeto",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "ID Único (Slug)",
      type: "slug",
      description:
        "IMPORTANTE: Para el avatar base del cadete, este valor DEBE ser 'default-cadet'.",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "price",
      title: "Costo (Cristales de Energía)",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "string",
      options: {
        list: [
          { title: "Traje / Base", value: "suit" },
          { title: "Casco / Cabeza", value: "helmet" },
          { title: "Mascota", value: "pet" },
        ],
      },
      initialValue: "suit",
    }),
    defineField({
      name: "image",
      title: "Imagen del Objeto",
      type: "image",
      description: "Sube un PNG transparente o SVG.",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "isDefault",
      title: "¿Es el objeto por defecto?",
      type: "boolean",
      description:
        "Márcalo si este es el traje inicial con el que empiezan todos los cadetes.",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "price",
      media: "image",
      isDefault: "isDefault",
    },
    prepare(selection) {
      const { title, subtitle, media, isDefault } = selection;
      return {
        title: title,
        subtitle: isDefault
          ? "Gratis (Por Defecto)"
          : `${subtitle} Cristales ⚡`,
        media: media,
      };
    },
  },
});
