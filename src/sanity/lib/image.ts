import { createImageUrlBuilder } from "@sanity/image-url";
import { client } from "./client";

const imageBuilder = createImageUrlBuilder(client);

export const urlFor = (source: any) => {
  return imageBuilder.image(source);
};

// Versión redimensionada y comprimida de una URL de imagen de Sanity.
// Los originales pesan varios MB (2816px, algunos PNG); la CDN de Sanity
// los recorta al ancho pedido y con auto=format entrega WebP/AVIF.
export function sanityImageUrl(url: string | null | undefined, width: number) {
  if (!url || !url.startsWith("https://cdn.sanity.io/")) return url || "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}w=${width}&q=75&fit=max&auto=format`;
}

// srcSet 1x/2x para pantallas normales y retina
export function sanityImageSrcSet(url: string | null | undefined, width: number) {
  if (!url || !url.startsWith("https://cdn.sanity.io/")) return undefined;
  return `${sanityImageUrl(url, width)} 1x, ${sanityImageUrl(url, width * 2)} 2x`;
}
