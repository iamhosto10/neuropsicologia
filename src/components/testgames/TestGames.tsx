"use client";

import SpaceCleanupGame from "@/components/games/space-cleanup-game";
import { urlFor } from "@/sanity/lib/image";
// 1. Importamos PortableText y sus tipos
import { PortableText, type PortableTextComponents } from "next-sanity";
import SatelliteTrackerGame from "../games/satellite-tracker-game";
import AsteroidFieldGame from "../games/asteroid-field-game";
import ReverseCommunicatorGame from "../games/reverse-communicator-game";
import MemoryMatrixGame from "../games/memory-matrix-game";
import MultitaskEvasionGame from "../games/multitask-evasion-game";

// 2. Definimos los estilos SOLO para el texto (fuera del componente para orden)
const textComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-lg text-slate-300 leading-relaxed mb-4 font-light">
        {children}
      </p>
    ),
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-cyan-400 mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold text-white mt-6 mb-3 flex items-center gap-2">
        <span className="w-1.5 h-6 bg-cyan-600 rounded-full inline-block"></span>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-medium text-cyan-200 mt-4 mb-2">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-slate-400 my-6 bg-slate-800/30 py-2 rounded-r">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-5 mb-4 space-y-2 text-slate-300 marker:text-cyan-500">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-5 mb-4 space-y-2 text-slate-300 marker:text-cyan-500">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-cyan-100">{children}</em>,
    link: ({ value, children }) => {
      const target = (value?.href || "").startsWith("http")
        ? "_blank"
        : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === "_blank" ? "noindex nofollow" : undefined}
          className="text-cyan-400 underline decoration-cyan-400/30 hover:decoration-cyan-400 transition-colors"
        >
          {children}
        </a>
      );
    },
  },
};

function MockVideoPlayer() {
  return (
    <div className="w-full aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 shadow-xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <p className="text-slate-400 font-medium flex flex-col items-center gap-2">
        <span className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-300">
          ▶
        </span>
        Video Explicativo (Placeholder)
      </p>
    </div>
  );
}

interface LessonViewProps {
  lesson: {
    title: string;
    description?: string;
    content: any[];
  } | null;
}

export const TestGames = ({ lesson }: LessonViewProps) => {
  if (!lesson) {
    return <div className="p-10 text-white">Cargando lección...</div>;
  }

  const renderContent = (block: any) => {
    switch (block._type) {
      case "gameModule":
        console.log("Renderizando módulo de juego con datos:", block);
        const gameConfig = {
          title: block.title,
          instruction: block.instruction,
          difficulty: block.difficulty,
          duration: block.duration,
          targetImage: block.targetObject
            ? urlFor(block.targetObject).url()
            : undefined,
          distractorImages:
            block.distractorObjects?.map((img: any) => urlFor(img).url()) || [],
        };
        console.log("Configuración del juego extraída de Sanity:", gameConfig);

        // 2. LÓGICA DE SELECCIÓN (Switch dentro de Switch)
        return (
          <div
            key={block._key}
            className="my-16 border-t border-b border-slate-800 py-10 bg-slate-900/20 -mx-6 px-6 lg:rounded-2xl lg:mx-0 lg:border lg:px-10"
          >
            <div className="mb-8 flex items-center gap-3">
              {/* Cambiamos el icono/título según el juego */}
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 ring-1 ring-cyan-500/50">
                {block.gameType === "satellite"
                  ? "📡"
                  : block.gameType === "asteroid"
                    ? "🚀"
                    : "🎮"}
              </span>
              <h4 className="text-xl font-bold text-white tracking-wide">
                {block.gameType === "satellite"
                  ? "ZONA DE VIGILANCIA"
                  : block.gameType === "asteroid"
                    ? "ZONA DE VELOCIDAD"
                    : "ZONA DE ENTRENAMIENTO"}
              </h4>
            </div>
            {/* <AsteroidFieldGame config={gameConfig} /> */}
            {/* <SatelliteTrackerGame config={gameConfig} /> */}
            {/* <SpaceCleanupGame config={gameConfig} /> */}

            {block.gameType === "satellite" ? (
              <SatelliteTrackerGame config={gameConfig} />
            ) : block.gameType === "asteroid" ? (
              // AQUÍ ESTÁ EL NUEVO JUEGO
              <AsteroidFieldGame config={gameConfig} />
            ) : block.gameType === "cleanup" ? (
              <SpaceCleanupGame config={gameConfig} />
            ) : block.gameType === "reverse" ? (
              <ReverseCommunicatorGame config={gameConfig} />
            ) : block.gameType === "memori" ? (
              <MemoryMatrixGame config={gameConfig} />
            ) : (
              <MultitaskEvasionGame config={gameConfig} />
            )}

            <p className="text-center text-xs text-slate-500 mt-6 uppercase tracking-widest">
              {block.gameType === "satellite"
                ? "Mantenga el enlace estable"
                : "Complete la misión para continuar"}
            </p>
          </div>
        );

      case "block":
        return (
          <div key={block._key} className="mb-2">
            <PortableText value={[block]} components={textComponents} />
          </div>
        );

      case "image":
        return (
          <div key={block._key} className="my-8">
            {block.asset && (
              <img
                src={urlFor(block.asset).url()}
                alt="Imagen de lección"
                className="rounded-xl border border-slate-700 w-full shadow-lg"
              />
            )}
            {block.caption && (
              <p className="text-center text-sm text-slate-500 mt-2 italic">
                {block.caption}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start">
        <main className="col-span-12 lg:col-span-8 space-y-12">
          {/* Renderizado Manual (Loop original) */}
          <article className="prose prose-invert max-w-none">
            {lesson.content?.map((block) => renderContent(block))}
          </article>
        </main>
      </div>
    </div>
  );
};
