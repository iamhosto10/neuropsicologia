import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  PlayCircle,
  Lock,
  Download,
  FileText,
  FileAudio,
} from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  { title: "Módulo 1: Introducción", isLocked: false, isActive: false },
  { title: "Lección 1.1: ¿Qué es la alegría?", isLocked: false, isActive: true },
  { title: "Lección 1.2: La tristeza", isLocked: true, isActive: false },
  { title: "Módulo 2: Emociones complejas", isLocked: true, isActive: false },
];

export const LessonSidebar = () => {
  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 h-fit">
      <Button
        className="w-full font-bold bg-[oklch(var(--learning-blue))] hover:bg-[oklch(var(--learning-blue)/0.9)]"
      >
        <Check className="w-5 h-5 mr-2" />
        Completar Lección
      </Button>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Button variant="outline">Anterior</Button>
        <Button
          className="bg-[oklch(var(--brand-mustard))] hover:bg-[oklch(var(--brand-mustard)/0.9)]"
        >
          Siguiente
        </Button>
      </div>

      <h3 className="font-bold mt-6 mb-2">Contenido del Curso</h3>
      <ScrollArea className="h-64 pr-4">
        <div className="space-y-2">
          {modules.map((module, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                {
                  "bg-blue-50 text-blue-700 font-bold": module.isActive,
                  "text-gray-400": module.isLocked,
                  "hover:bg-gray-50": !module.isActive && !module.isLocked,
                }
              )}
            >
              {module.isActive ? (
                <PlayCircle className="w-5 h-5" />
              ) : module.isLocked ? (
                <Lock className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5" /> // Placeholder for alignment
              )}
              <span className="flex-1">{module.title}</span>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-6 p-4 bg-sky-50 rounded-xl">
        <h4 className="font-bold mb-3">Recursos</h4>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-sm text-gray-700 hover:underline cursor-pointer">
            <Download className="w-4 h-4 text-sky-600" />
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Guía de la Lección (PDF)</span>
          </li>
          <li className="flex items-center gap-2 text-sm text-gray-700 hover:underline cursor-pointer">
            <Download className="w-4 h-4 text-sky-600" />
            <FileAudio className="w-4 h-4 text-sky-600" />
            <span>Audio Relajante (MP3)</span>
          </li>
        </ul>
      </div>
    </aside>
  );
};
