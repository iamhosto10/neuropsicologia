// src/app/actions/profile.actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 1. Guardar el perfil seleccionado
export async function selectKidProfile(kidId: string) {
  const cookieStore = await cookies();

  cookieStore.set("activeKidId", kidId, {
    path: "/",
    httpOnly: true, // Seguro: no se puede leer desde JavaScript en el cliente
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12, // Expira en 12 horas (Dosis diaria)
  });

  // Una vez guardado, lo enviamos directo al Cuartel General
  redirect("/hq");
}

// 2. Leer qué niño está jugando actualmente
export async function getActiveKidId() {
  const cookieStore = await cookies();
  const kidId = cookieStore.get("activeKidId")?.value;
  return kidId || null;
}

// 3. Cerrar la sesión del niño (Volver a la selección)
export async function clearKidProfile() {
  const cookieStore = await cookies();
  cookieStore.delete("activeKidId");
  redirect("/select-profile"); // Crearemos esta ruta en el siguiente paso
}
