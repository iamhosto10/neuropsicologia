import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Course } from "@/lib/types";

const syllabus = [
  {
    module: 1,
    title: "Introducción a la Neuropsicología",
    lessons: [
      "Historia y desarrollo de la neuropsicología",
      "Conceptos básicos de neuroanatomía funcional",
      "Modelos de organización cerebral",
    ],
  },
  {
    module: 2,
    title: "Evaluación Neuropsicológica",
    lessons: [
      "Principios de la evaluación neuropsicológica",
      "Baterías de pruebas y tests específicos",
      "Interpretación de resultados y elaboración de informes",
    ],
  },
  {
    module: 3,
    title: "Patologías y Trastornos",
    lessons: [
      "Trastornos del neurodesarrollo",
      "Daño cerebral adquirido: ACV, TCE",
      "Enfermedades neurodegenerativas",
    ],
  },
  {
    module: 4,
    title: "Intervención y Rehabilitación",
    lessons: [
      "Principios de la rehabilitación neuropsicológica",
      "Diseño de programas de intervención",
      "Técnicas de estimulación cognitiva",
    ],
  },
];

export function CourseSyllabus({ course }: { course: Course }) {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6">Contenido del Curso</h2>
      <Accordion type="single" collapsible className="w-full space-y-3">
        {course?.syllabus?.map((item, index) => (
          <AccordionItem
            key={index}
            value={`item-${index + 1}`}
            className="border rounded-2xl"
          >
            <AccordionTrigger className="p-4 text-left hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-yellow-100 rounded-md flex items-center justify-center text-yellow-700 font-bold shrink-0">
                  {index + 1}
                </div>
                <span className="font-semibold text-lg">{item.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              <ul className="list-disc pl-8 space-y-2 text-muted-foreground">
                {item?.lessons?.map((lesson, index) => (
                  <li key={index}>{lesson.title}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
