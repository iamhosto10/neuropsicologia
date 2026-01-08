import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  title: "Neuropsicologia",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  basePath: "/studio", // Aquí es donde vivirá tu panel
  plugins: [structureTool()],
  schema: { types: [] }, // Aquí es donde Jules meterá mano después
});

export default config;
