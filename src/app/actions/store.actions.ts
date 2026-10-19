"use server";
import { isKidOwnedByCurrentUser } from "@/lib/auth-guards";

import { client } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";

// Acción para Comprar
export async function purchaseItem(
  kidId: string,
  itemId: string,
  cost: number,
) {
  if (!(await isKidOwnedByCurrentUser(kidId))) return { error: "No autorizado" };
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });
    const kid = await writeClient.fetch(
      `*[_type == "kidProfile" && _id == $kidId][0]{energyCrystals, unlockedAvatars}`,
      { kidId },
    );

    if (!kid) return { error: "Perfil no encontrado." };

    // El precio real sale de Sanity; el que manda el navegador no se usa
    const price = await writeClient.fetch<number | null>(
      `*[_type == "storeAvatar" && slug.current == $itemId][0].price`,
      { itemId },
    );
    if (price == null) return { error: "Artículo no encontrado." };
    cost = price;
    if (kid.energyCrystals < cost)
      return { error: "No tienes suficientes cristales de energía." };
    if (kid.unlockedAvatars?.includes(itemId))
      return { error: "¡Ya tienes este artículo!" };

    await writeClient
      .patch(kidId)
      .dec({ energyCrystals: cost }) // Restamos el costo
      .setIfMissing({ unlockedAvatars: [] })
      .append("unlockedAvatars", [itemId]) // Añadimos el item
      .set({ activeAvatar: itemId })
      .commit();

    // 3. Limpiamos caché
    revalidatePath("/hq");
    revalidatePath("/hq/store");

    return { success: true };
  } catch (error) {
    console.error("Error en la compra:", error);
    return {
      error: "Hubo un fallo en la conexión con el puerto de suministros.",
    };
  }
}

// Acción solo para Equipar algo que ya compró
export async function equipItem(kidId: string, itemId: string) {
  if (!(await isKidOwnedByCurrentUser(kidId))) return { error: "No autorizado" };
  try {
    const writeClient = client.withConfig({
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    });

    // Solo se puede equipar algo comprado (o un avatar gratuito por defecto)
    const canEquip = await writeClient.fetch<boolean>(
      `$itemId == "default-cadet"
        || $itemId in *[_type == "kidProfile" && _id == $kidId][0].unlockedAvatars
        || count(*[_type == "storeAvatar" && slug.current == $itemId && (isDefault == true || price == 0)]) > 0`,
      { kidId, itemId },
    );
    if (!canEquip) return { error: "Primero debes comprar este artículo." };

    await writeClient.patch(kidId).set({ activeAvatar: itemId }).commit();

    revalidatePath("/hq");
    revalidatePath("/hq/store");
    return { success: true };
  } catch (error) {
    return { error: "Error equipando el artículo." };
  }
}
