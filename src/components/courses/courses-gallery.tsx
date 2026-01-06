import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart } from "lucide-react";
import { Course } from "@/lib/types";
import { CourseCard } from "./courses-card";

const courses = [
  {
    title: "Aventuras de Construcción",
    description:
      "Fomenta la creatividad y habilidades motoras con bloques y juegos de construcción.",
    age: "2-4 años",
    lessons: "8 Lecciones",
    bgColor: "bg-orange-50",
  },
  {
    title: "Juegos en Grupo",
    description:
      "Desarrolla habilidades sociales y de comunicación a través de juegos interactivos.",
    age: "3-5 años",
    lessons: "10 Lecciones",
    bgColor: "bg-blue-50",
  },
  {
    title: "Arte y Creatividad",
    description:
      "Explora el mundo del arte con pintura, dibujo y manualidades.",
    age: "4-6 años",
    lessons: "12 Lecciones",
    bgColor: "bg-green-50",
  },
  {
    title: "Música y Movimiento",
    description:
      "Introduce a los niños al ritmo y la música con instrumentos y baile.",
    age: "2-5 años",
    lessons: "8 Lecciones",
    bgColor: "bg-purple-50",
  },
  {
    title: "Pequeños Científicos",
    description:
      "Experimentos divertidos y seguros para despertar la curiosidad científica.",
    age: "5-7 años",
    lessons: "15 Lecciones",
    bgColor: "bg-yellow-50",
  },
  {
    title: "Cuentacuentos Interactivo",
    description:
      "Fomenta el amor por la lectura con historias y actividades participativas.",
    age: "3-6 años",
    lessons: "10 Lecciones",
    bgColor: "bg-pink-50",
  },
] as Course[];

export function CoursesGallery() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center">
          Explora Nuestros Cursos
        </h2>
        <p className="text-muted-foreground mt-2">
          Encuentra la actividad perfecta para apoyar el desarrollo de tu hijo.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-12 bg-white rounded-[2rem] shadow-sm p-4">
        <div className="flex flex-wrap lg:flex-nowrap lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:flex-1 gap-4 w-full">
            <Select>
              <SelectTrigger className="bg-gray-100 border-none rounded-full px-4 h-10 text-sm text-black focus:ring-0">
                <SelectValue placeholder="Edad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2-4">2-4 años</SelectItem>
                <SelectItem value="4-6">4-6 años</SelectItem>
                <SelectItem value="6-8">6-8 años</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="bg-gray-100 border-none rounded-full px-4 h-10 text-sm text-black focus:ring-0">
                <SelectValue placeholder="Tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="creatividad">Creatividad</SelectItem>
                <SelectItem value="logica">Lógica</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="bg-gray-100 border-none rounded-full px-4 h-10 text-sm text-black focus:ring-0">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="principiante">Principiante</SelectItem>
                <SelectItem value="intermedio">Intermedio</SelectItem>
                <SelectItem value="avanzado">Avanzado</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="bg-gray-100 border-none rounded-full px-4 h-10 text-sm text-black focus:ring-0">
                <SelectValue placeholder="Duración" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4-semanas">4 semanas</SelectItem>
                <SelectItem value="8-semanas">8 semanas</SelectItem>
                <SelectItem value="12-semanas">12 semanas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-2 w-full lg:w-auto">
            <Button className="bg-[oklch(var(--brand-mustard-action))] text-black font-bold rounded-full hover:opacity-90 px-6 w-full lg:w-auto">
              Aplicar Filtros
            </Button>
            <Button
              variant="ghost"
              className="rounded-full text-black hover:bg-gray-100"
            >
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-in duration-1000 fade-in slide-in-from-bottom-8">
        {courses.map((course) => (
          // <Card
          //   key={course.title}
          //   className="bg-white pt-0 rounded-[2rem] border-none shadow-sm hover:shadow-lg overflow-hidden group transition-transform duration-500 hover:-translate-y-2"
          // >
          //   <div className={`relative h-48 ${course.bgColor}`}>
          //     <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full cursor-pointer">
          //       <Heart className="w-5 h-5 text-black" />
          //     </div>
          //   </div>
          //   <CardContent className="p-6 flex flex-col gap-2">
          //     <h3 className="text-xl font-bold text-black line-clamp-2">
          //       {course.title}
          //     </h3>
          //     <p className="text-sm text-muted-foreground line-clamp-2">
          //       {course.description}
          //     </p>
          //     <div className="flex items-center gap-2 mt-4">
          //       <Badge className="bg-[oklch(var(--brand-pastel-tag))] text-amber-900 rounded-full font-medium hover:bg-orange-200">
          //         {course.age}
          //       </Badge>
          //       <Badge className="bg-[oklch(var(--brand-pastel-tag))] text-amber-900 rounded-full font-medium hover:bg-orange-200">
          //         {course.lessons}
          //       </Badge>
          //     </div>
          //   </CardContent>
          // </Card>
          <CourseCard key={course.title} course={course} />
        ))}
      </div>
    </section>
  );
}
