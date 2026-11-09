// src/app/actions/profile.actions.ts
"use server";
import { isKidOwnedByCurrentUser } from "@/lib/auth-guards";
import { client } from "@/sanity/lib/client";
import { auth, currentUser } from "@clerk/nextjs/server";
import { deleteKidCascade, ensureSanityUser } from "@/lib/clerk-sync";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const MAX_ALIAS_LENGTH = 20;

export async function selectKidProfile(kidId: string) {
  if (!(await isKidOwnedByCurrentUser(kidId))) redirect("/select-profile");
  const cookieStore = await cookies();

  cookieStore.set("activeKidId", kidId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });

  redirect("/hq");
}

export async function getActiveKidId() {
  const cookieStore = await cookies();
  const kidId = cookieStore.get("activeKidId")?.value;
  return kidId || null;
}

export async function clearKidProfile() {
  const cookieStore = await cookies();
  cookieStore.delete("activeKidId");
  redirect("/select-profile");
}

export async function createKidProfile(formData: FormData) {
  const alias = formData.get("alias") as string;

  if (!alias || alias.trim() === "") {
    return { error: "El nombre del cadete es requerido." };
  }
  if (alias.trim().length > MAX_ALIAS_LENGTH) {
    return { error: `El nombre no puede superar ${MAX_ALIAS_LENGTH} caracteres.` };
  }

  const { userId } = await auth();
  if (!userId) {
    return { error: "No autorizado. Inicia sesión nuevamente." };
  }

  const parentSanityId = `user-${userId}`;

  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // Si el webhook de Clerk no corrió, el usuario no existe en Sanity y la referencia
    // del perfil fallaría: se crea al vuelo (idempotente).
    const clerkUser = await currentUser();
    await ensureSanityUser(writeClient, {
      id: userId,
      firstName: clerkUser?.firstName,
      lastName: clerkUser?.lastName,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
    });

    await writeClient.create({
      _type: "kidProfile",
      alias: alias.trim(),
      parent: {
        _type: "reference",
        _ref: parentSanityId,
      },
      energyCrystals: 0,
      avatarStatus: "hungry",
      unlockedAvatars: ["default-cadet"],
      activeAvatar: "default-cadet",
    });
  } catch (error) {
    console.error("❌ Error creando el perfil:", error);
    return { error: "Hubo un error de conexión al crear el perfil." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/select-profile");
  redirect("/dashboard");
}

export async function selectKidAndRedirect(
  kidId: string,
  destinationUrl: string,
) {
  if (!(await isKidOwnedByCurrentUser(kidId))) redirect("/select-profile");
  // Solo rutas internas (evita redirecciones abiertas a otros sitios)
  if (!destinationUrl.startsWith("/") || destinationUrl.startsWith("//")) {
    destinationUrl = "/hq";
  }
  const cookieStore = await cookies();

  // 1. Guardamos al niño activo en la galleta (cookie)
  cookieStore.set("activeKidId", kidId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });

  // 2. Lo teletransportamos al curso
  redirect(destinationUrl);
}

export async function deleteKidProfile(kidId: string) {
  if (!(await isKidOwnedByCurrentUser(kidId))) return { error: "No autorizado" };

  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // Sanity no deja borrar un documento referenciado: se borran también sus sesiones
    // (todo en una transacción)
    await deleteKidCascade(writeClient, kidId);

    // Si era el cadete activo, se limpia la cookie
    const cookieStore = await cookies();
    if (cookieStore.get("activeKidId")?.value === kidId) cookieStore.delete("activeKidId");

    // Recargamos las páginas para que la tabla se actualice
    revalidatePath("/dashboard/pacientes");
    revalidatePath("/dashboard");
    revalidatePath("/select-profile");

    return { success: true };
  } catch (error) {
    console.error("❌ Error eliminando el perfil:", error);
    return { error: "Hubo un error al eliminar el cadete." };
  }
}

export async function updateKidProfile(kidId: string, formData: FormData) {
  const alias = formData.get("alias") as string;

  if (!alias || alias.trim() === "") {
    return { error: "El nombre del cadete es requerido." };
  }
  if (alias.trim().length > MAX_ALIAS_LENGTH) {
    return { error: `El nombre no puede superar ${MAX_ALIAS_LENGTH} caracteres.` };
  }

  if (!(await isKidOwnedByCurrentUser(kidId))) return { error: "No autorizado" };

  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // Actualizamos solo el campo 'alias'
    await writeClient.patch(kidId).set({ alias: alias.trim() }).commit();


    revalidatePath("/dashboard/pacientes");
    revalidatePath(`/dashboard/kid/${kidId}`);
  } catch (error) {
    console.error("❌ Error actualizando el perfil:", error);
    return { error: "Hubo un error al actualizar el cadete." };
  }

  redirect("/dashboard/pacientes");
}
