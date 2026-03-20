// src/components/courses/courses-gallery.tsx
"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import CoursesCard from "./courses-card"; // Asegúrate de que la ruta de tu componente Card sea la correcta

export default function CoursesGallery({
  initialCourses = [],
}: {
  initialCourses?: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtramos por búsqueda
  const filteredCourses = initialCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <section className="container mx-auto px-4 py-12">
      {/* Buscador */}
      <div className="max-w-md mx-auto mb-12 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar cursos..."
          className="pl-12 h-14 rounded-2xl bg-white shadow-sm border-slate-200 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de Cursos */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CoursesCard
              key={course._id}
              title={course.title}
              description={course.description}
              image={course.image || "/placeholder-image.jpg"}
              href={`/cursos/${course.slug}`}
              duration={course.duration}
              level={course.level}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">
          <p className="text-xl font-bold">No se encontraron cursos.</p>
          <p>
            Intenta buscar con otra palabra o añade cursos en Sanity Studio.
          </p>
        </div>
      )}
    </section>
  );
}
