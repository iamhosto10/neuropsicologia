import { urlFor } from "@/sanity/lib/image";
import { Gamepad2 } from "lucide-react";

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
      return (
        <div className="my-12 bg-gradient-to-br from-cyan-500 to-blue-600 p-8 rounded-3xl text-center text-white shadow-xl shadow-cyan-500/20">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-black mb-2">Módulo Interactivo</h3>
          <p className="text-cyan-100 mb-6">
            Pon a prueba lo que has aprendido en esta lección.
          </p>
          <button className="bg-white text-cyan-600 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-md">
            Iniciar Ejercicio
          </button>
        </div>
      );
    },
  },
};
