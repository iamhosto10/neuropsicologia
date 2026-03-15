// src/components/courses/courses-card.tsx
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CoursesCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
  duration?: number | string;
  level?: string;
}

export default function CoursesCard({
  title,
  description,
  image,
  href,
  duration,
  level,
}: CoursesCardProps) {
  return (
    <Link href={href} className="group h-full flex cursor-pointer">
      <Card className="rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col bg-white hover:-translate-y-1 w-full">
        {/* Portada del Curso */}
        <div className="h-48 relative bg-slate-100 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {level && (
            <Badge className="absolute top-4 left-4 bg-white/90 text-slate-800 hover:bg-white border-none shadow-sm font-bold capitalize">
              Nivel: {level}
            </Badge>
          )}
        </div>

        {/* Contenido */}
        <CardContent className="p-6 flex flex-col grow">
          <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors">
            {title}
          </h3>
          <p className="text-slate-500 text-sm mb-6 line-clamp-3 grow leading-relaxed">
            {description}
          </p>

          {/* Footer de la tarjeta */}
          <div className="flex items-center justify-between text-sm font-bold text-slate-400 pt-4 border-t border-slate-100 mt-auto">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-500" />{" "}
              {duration ? `${duration} min` : "A tu ritmo"}
            </span>
            <span className="flex items-center text-cyan-500 group-hover:translate-x-1 transition-transform">
              Ver Curso <ArrowRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
