// src/app/(login)/dashboard/ajustes/page.tsx
import { UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ajustes",
};

export default function AjustesPage() {
  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Ajustes
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Administra tu cuenta, correo y seguridad.
        </p>
      </div>

      <UserProfile routing="hash" />
    </div>
  );
}
