import { CourseCard } from "../courses/courses-card";
import { Course } from "@/lib/types";

// const courses = [
//   {
//     title: "Aventuras de Construcción",
//     description:
//       "Fomenta la creatividad y habilidades motoras con bloques y juegos de construcción.",
//     age: "2-4 años",
//     lessons: "8 Lecciones",
//     bgColor: "bg-orange-50",
//   },
//   {
//     title: "Juegos en Grupo",
//     description:
//       "Desarrolla habilidades sociales y de comunicación a través de juegos interactivos.",
//     age: "3-5 años",
//     lessons: "10 Lecciones",
//     bgColor: "bg-blue-50",
//   },
//   {
//     title: "Arte y Creatividad",
//     description:
//       "Explora el mundo del arte con pintura, dibujo y manualidades.",
//     age: "4-6 años",
//     lessons: "12 Lecciones",
//     bgColor: "bg-green-50",
//   },
//   {
//     title: "Música y Movimiento",
//     description:
//       "Introduce a los niños al ritmo y la música con instrumentos y baile.",
//     age: "2-5 años",
//     lessons: "8 Lecciones",
//     bgColor: "bg-purple-50",
//   },
//   {
//     title: "Pequeños Científicos",
//     description:
//       "Experimentos divertidos y seguros para despertar la curiosidad científica.",
//     age: "5-7 años",
//     lessons: "15 Lecciones",
//     bgColor: "bg-yellow-50",
//   },
//   {
//     title: "Cuentacuentos Interactivo",
//     description:
//       "Fomenta el amor por la lectura con historias y actividades participativas.",
//     age: "3-6 años",
//     lessons: "10 Lecciones",
//     bgColor: "bg-pink-50",
//   },
// ] as Course[];

export function RelatedCourses({ course }: { course: Course }) {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6">Quizás también te interese...</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {course?.relatedCourse?.map((course, index) => (
          <CourseCard key={course.title} course={course} />
        ))}
      </div>
    </div>
  );
}
