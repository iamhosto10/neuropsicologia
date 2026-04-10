"use client";
import Link from "next/link";
// 🔥 1. Importamos useRef y useEffect
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowRight, CheckCircle2, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CoursesCardProps {
  title: string;
  description: string;
  image: string;
  href?: string;
  duration?: number | string;
  level?: string;
  progress?: number;
  asButton?: boolean;
  actionSlot?: React.ReactNode;
}

export default function CoursesCard({
  title,
  description,
  image,
  href = "#",
  duration,
  level,
  progress = 0,
  asButton = false,
  actionSlot,
}: CoursesCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 🔥 2. Creamos una referencia a la etiqueta <img>
  const imgRef = useRef<HTMLImageElement>(null);

  const isCompleted = progress === 100;
  const isStarted = progress > 0 && progress < 100;

  const safeImage = image || "";

  // 🔥 3. El truco anti-caché: Verificamos si la imagen ya estaba lista
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      // Si la imagen cargó instantáneamente de la caché, forzamos el estado a true
      setIsImageLoaded(true);
    }
  }, [safeImage]); // Se vuelve a ejecutar si la URL de la imagen cambia

  // El diseño visual interior, semánticamente limpio
  const InteriorDesign = (
    <>
      {/* Portada del Curso */}
      <div className="h-48 relative w-full bg-slate-100 overflow-hidden shrink-0 group">
        {/* ESTADO DE CARGA (SKELETON) */}
        {!isImageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center z-0">
            <div className="w-10 h-10 rounded-full bg-slate-300/50 flex items-center justify-center animate-bounce">
              <div className="w-4 h-4 bg-slate-400 rounded-full" />
            </div>
          </div>
        )}

        {/* ESTADO DE ERROR (Si la imagen se rompe) */}
        {imageError && (
          <div className="absolute inset-0 bg-slate-100 flex flex-col items-center justify-center text-slate-400 z-0">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs font-medium">Sin portada</span>
          </div>
        )}

        {/* LA IMAGEN REAL NATIVA */}
        {safeImage && !imageError && (
          <img
            ref={imgRef} // 🔥 4. Le pasamos la referencia
            src={safeImage}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            onError={() => {
              setIsImageLoaded(true);
              setImageError(true);
            }}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 relative z-10 ${
              isImageLoaded ? "opacity-100" : "opacity-0 scale-110"
            }`}
          />
        )}

        {/* Overlay sutil para que los badges siempre se lean bien */}
        <div className="absolute inset-0 bg-linear-to-t from-transparent to-slate-900/10 pointer-events-none z-20" />

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-30">
          {level && (
            <Badge className="bg-white/95 text-slate-800 hover:bg-white border-none shadow-sm font-bold capitalize pointer-events-none backdrop-blur-sm">
              Nivel: {level}
            </Badge>
          )}
          {isCompleted && (
            <Badge className="bg-green-500 text-white hover:bg-green-600 border-none shadow-sm font-bold flex items-center gap-1 pointer-events-none">
              <CheckCircle2 className="w-3 h-3" /> Completado
            </Badge>
          )}
        </div>
      </div>

      {/* Contenido (Textos y barras) */}
      <div className="p-6 flex flex-col grow">
        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors">
          {title}
        </h3>

        <p className="text-slate-500 text-sm mb-6 line-clamp-3 grow leading-relaxed">
          {description}
        </p>

        {/* Barra de Progreso */}
        {(isStarted || isCompleted) && (
          <div className="mb-4 space-y-2 w-full">
            <div className="flex justify-between text-xs font-bold w-full">
              <span
                className={isCompleted ? "text-green-600" : "text-cyan-600"}
              >
                {isCompleted ? "¡Felicidades!" : "En progreso"}
              </span>
              <span className="text-slate-400">{progress}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2 bg-slate-100 w-full"
              indicatorClassName={isCompleted ? "bg-green-500" : "bg-cyan-500"}
            />
          </div>
        )}

        {/* Footer de la tarjeta */}
        <div className="flex items-center justify-between text-sm font-bold text-slate-400 pt-4 border-t border-slate-100 mt-auto w-full">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-500" />{" "}
            {duration ? `${duration} min` : "A tu ritmo"}
          </span>
          <span className="flex items-center text-cyan-500 group-hover:translate-x-1 transition-transform">
            {isCompleted ? "Repasar" : isStarted ? "Continuar" : "Empezar"}{" "}
            <ArrowRight className="w-4 h-4 ml-1" />
          </span>
        </div>
      </div>
    </>
  );

  // Comportamiento de Botón (Para formularios como en el Dashboard)
  if (asButton) {
    return (
      <Card
        className={`group relative rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col bg-white hover:-translate-y-1 w-full h-full ${isCompleted ? "opacity-80 hover:opacity-100" : ""}`}
      >
        <button
          type="submit"
          className="w-full h-full text-left flex flex-col focus:outline-none"
        >
          {InteriorDesign}
        </button>
        {actionSlot && (
          <div className="px-6 pb-6 pt-0 bg-white relative z-10 w-full">
            {actionSlot}
          </div>
        )}
      </Card>
    );
  }

  // Comportamiento normal de Enlace (Para la galería pública)
  return (
    <Card
      className={`group relative rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col bg-white hover:-translate-y-1 w-full h-full ${isCompleted ? "opacity-80 hover:opacity-100" : ""}`}
    >
      <Link
        href={href}
        className="w-full h-full flex flex-col focus:outline-none"
      >
        {InteriorDesign}
      </Link>
      {actionSlot && (
        <div className="px-6 pb-6 pt-0 bg-white relative z-10 w-full">
          {actionSlot}
        </div>
      )}
    </Card>
  );
}
