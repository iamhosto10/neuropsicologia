import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, PlayCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type LessonStatus = "Completed" | "Active" | "Locked";

interface Lesson {
  title: string;
  duration: string;
  status: LessonStatus;
}

const lessons: Lesson[] = [
  {
    title: "1.1: Introducción a las Formas",
    duration: "12 min",
    status: "Completed",
  },
  {
    title: "1.2: Dibujando Emociones",
    duration: "15 min",
    status: "Active",
  },
  {
    title: "1.3: Creando tu Primer Personaje",
    duration: "25 min",
    status: "Locked",
  },
  {
    title: "1.4: Sombras y Profundidad",
    duration: "18 min",
    status: "Locked",
  },
];

const statusIcons: Record<LessonStatus, ReactNode> = {
  Completed: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  Active: <PlayCircle className="h-6 w-6 text-blue-500 fill-blue-500" />,
  Locked: <Lock className="h-6 w-6 text-gray-400" />,
};

export function CreativeSidebar() {
  return (
    <Card className="p-6 rounded-3xl border-gray-100 shadow-sm">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Contenido del Curso</h3>
      <div className="space-y-2">
        {lessons.map((lesson) => (
          <div
            key={lesson.title}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-colors",
              lesson.status === "Active" && "bg-blue-50 text-blue-700 font-bold",
              lesson.status === "Completed" && "text-gray-500 line-through",
              lesson.status === "Locked" && "text-gray-400"
            )}
          >
            <div className="flex items-center gap-3">
              {statusIcons[lesson.status]}
              <span className="flex-1">{lesson.title}</span>
            </div>
            <span className="text-sm font-mono">{lesson.duration}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="w-full rounded-full">Anterior</Button>
        <Button className="w-full rounded-full bg-[oklch(var(--creative-amber))] hover:bg-[oklch(var(--creative-amber)/0.9)] text-amber-900">
          Siguiente
        </Button>
      </div>
    </Card>
  );
}
