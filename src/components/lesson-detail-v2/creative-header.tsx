import { Palette } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export function CreativeHeader() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Cursos &gt; Dibujo Creativo &gt; Lección 1.2
        </p>
        <div className="flex items-center gap-2 w-48">
          <span className="text-xs font-semibold text-gray-600">PROGRESO</span>
          <Progress value={40} className="h-2 [&>*]:bg-[oklch(var(--creative-amber))]" />
        </div>
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-gray-800">
        Lección 1.2: Dibujando emociones
      </h1>
      <div className="bg-[oklch(var(--creative-amber-bg))] border border-amber-200 rounded-2xl p-4">
        <div className="flex items-start gap-4">
          <div className="bg-white p-2 rounded-full border border-amber-200">
            <Palette className="h-6 w-6 text-[oklch(var(--creative-amber))]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Objetivos de la lección</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Aprender a combinar formas básicas para crear personajes.</li>
              <li>Entender cómo las expresiones faciales transmiten emociones.</li>
              <li>Practicar el dibujo de al menos tres expresiones diferentes.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
