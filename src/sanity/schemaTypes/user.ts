import { defineField, defineType } from "sanity";

export const user = defineType({
  name: "user",
  title: "User Profile",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "clerkId",
      title: "Clerk User ID",
      type: "string",
      readOnly: true,
      hidden: false,
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "role",
      title: "Membresía",
      type: "string",
      initialValue: "free",
      options: {
        list: [
          { title: "Gratis", value: "free" },
          { title: "Premium", value: "premium" },
          { title: "Administrador", value: "admin" },
        ],
      },
    }),
    // ... tus otros campos (slug, image, bio, completedCourses) siguen igual
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Profile Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
    }),
    defineField({
      name: "completedCourses",
      title: "Completed Courses",
      type: "array",
      of: [{ type: "reference", to: { type: "course" } }],
    }),
  ],
});
