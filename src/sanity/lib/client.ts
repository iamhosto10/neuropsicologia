import { createClient } from "next-sanity";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: true, // false para desarrollo (datos frescos), true para producción (caché)
});

export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false, // Siempre false para escritura
  token: process.env.SANITY_API_WRITE_TOKEN, // Tu token de entorno
});

export const BrowserwriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false, // Siempre false para escritura
  token: process.env.NEXT_PUBLIC_SANITY_API_WRITE_TOKEN, // Tu token de entorno
});

export async function uploadImage(file: File) {
  try {
    if (!file || file.size === 0) {
      throw new Error("Archivo inválido");
    }
    const buffer = Buffer.from(await file.arrayBuffer());

    console.log("file", buffer);
    console.log("file", file);

    // Subimos a Sanity
    const asset = await BrowserwriteClient.assets.upload("image", buffer, {
      filename: file.name,
    });

    return {
      success: true,
      assetId: asset._id,
      url: asset.url,
    };
  } catch (error) {
    console.error("Error al subir imagen:", error);

    return {
      success: false,
      error: "Fallo al subir el archivo.",
    };
  }
}
