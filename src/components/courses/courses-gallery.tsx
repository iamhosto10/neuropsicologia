import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SanityCourse } from "@/lib/types";
import { CourseCard } from "./courses-card";

interface CoursesGalleryProps {
  courses: SanityCourse[];
}

export function CoursesGallery({ courses }: CoursesGalleryProps) {
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
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </section>
  );
}
