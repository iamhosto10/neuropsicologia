"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config"; // Asegúrate que la ruta al sanity.config.ts sea correcta

export default function StudioPage() {
  return (
    <div className="mt-32">
      <NextStudio config={config} />
    </div>
  );
}
