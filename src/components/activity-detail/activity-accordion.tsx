// src/components/activity-detail/activity-accordion.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Target, Box } from "lucide-react";

interface ActivityAccordionProps {
  objectives: string[];
  materials: string[];
}

export default function ActivityAccordion({
  objectives,
  materials,
}: ActivityAccordionProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <Accordion
        type="single"
        collapsible
        defaultValue="objectives"
        className="w-full"
      >
        {/* Acordeón de Objetivos */}
        <AccordionItem value="objectives" className="border-b border-slate-100">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                <Target className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-800">
                Objetivos Terapéuticos
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            {objectives && objectives.length > 0 ? (
              <ul className="space-y-3">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic text-sm pl-4">
                No se especificaron objetivos.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Acordeón de Materiales */}
        <AccordionItem value="materials" className="border-none">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <Box className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-800">
                Materiales Necesarios
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            {materials && materials.length > 0 ? (
              <ul className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {materials.map((mat, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-slate-700 font-medium"
                  >
                    <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm" />
                    {mat}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic text-sm pl-4">
                No se requieren materiales.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
