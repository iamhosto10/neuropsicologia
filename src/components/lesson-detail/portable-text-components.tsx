import { urlFor } from "@/sanity/lib/image";
import { Gamepad2 } from "lucide-react";
import InlineGameWrapper from "./inline-game-wrapper";

export const ptComponents = {
  types: {
    // 1. Cómo renderizar las imágenes que subas en medio del texto
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="my-10 rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-slate-50">
          <img
            src={urlFor(value).url()}
            alt={value.alt || "Ilustración de la lección"}
            className="w-full h-auto object-cover max-h-125"
            loading="lazy"
          />
          {value.caption && (
            <p className="text-center text-sm text-slate-500 py-3 bg-white">
              {value.caption}
            </p>
          )}
        </div>
      );
    },
    // 2. Cómo renderizar un Juego si decides incrustarlo en la lección
    gameModule: ({ value }: any) => {
      // Le pasamos toda la data de Sanity directo al envoltorio
      return <InlineGameWrapper value={value} />;
    },
  },
};
