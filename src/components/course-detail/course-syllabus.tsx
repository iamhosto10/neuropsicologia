import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SanityModule } from '@/lib/types';

interface CourseSyllabusProps {
  syllabus: SanityModule[];
}

export function CourseSyllabus({ syllabus }: CourseSyllabusProps) {
  if (!syllabus || syllabus.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6">Contenido del Curso</h2>
      <Accordion type="single" collapsible className="w-full space-y-3">
        {syllabus.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border rounded-2xl">
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
                {item.lessons && item.lessons.map((lesson, lessonIndex) => (
                  <li key={lessonIndex}>{lesson.title}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
