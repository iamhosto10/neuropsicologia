//

// src/components/courses/courses-card.tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // 🔥 Importamos la barra

interface CoursesCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  duration?: number | string;
  level?: string;
  progress?: number; // 🔥 Nueva propiedad opcional
}

export default function CoursesCard({
  title,
  description,
  image,
  href,
  duration,
  level,
  progress = 0, // Por defecto es 0
}: CoursesCardProps) {
  const isCompleted = progress === 100;
  const isStarted = progress > 0 && progress < 100;

  return (
    <Link href={href} className="group h-full flex cursor-pointer">
      <Card
        className={`rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col bg-white hover:-translate-y-1 w-full ${isCompleted ? "opacity-80 hover:opacity-100" : ""}`}
      >
        {/* Portada del Curso */}
        <div className="h-48 relative bg-slate-100 overflow-hidden">
          <img
            src={image || "/placeholder-image.jpg"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {level && (
              <Badge className="bg-white/90 text-slate-800 hover:bg-white border-none shadow-sm font-bold capitalize">
                Nivel: {level}
              </Badge>
            )}
            {isCompleted && (
              <Badge className="bg-green-500 text-white hover:bg-green-600 border-none shadow-sm font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completado
              </Badge>
            )}
          </div>
        </div>

        {/* Contenido */}
        <CardContent className="p-6 flex flex-col grow">
          <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors">
            {title}
          </h3>
          <p className="text-slate-500 text-sm mb-6 line-clamp-3 grow leading-relaxed">
            {description}
          </p>

          {/* 🔥 Barra de Progreso (Solo se muestra si se empezó a ver) */}
          {(isStarted || isCompleted) && (
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span
                  className={isCompleted ? "text-green-600" : "text-cyan-600"}
                >
                  {isCompleted ? "¡Felicidades!" : "En progreso"}
                </span>
                <span className="text-slate-400">{progress}%</span>
              </div>
              <Progress
                value={progress}
                className="h-2 bg-slate-100"
                indicatorClassName={
                  isCompleted ? "bg-green-500" : "bg-cyan-500"
                }
              />
            </div>
          )}

          {/* Footer de la tarjeta */}
          <div className="flex items-center justify-between text-sm font-bold text-slate-400 pt-4 border-t border-slate-100 mt-auto">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-500" />{" "}
              {duration ? `${duration} min` : "A tu ritmo"}
            </span>
            <span className="flex items-center text-cyan-500 group-hover:translate-x-1 transition-transform">
              {isCompleted ? "Repasar" : isStarted ? "Continuar" : "Empezar"}{" "}
              <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
