import { ChevronRight, Heart } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const EmpathyHeader = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-gray-500">
        <span>Cursos</span>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span>Empatía</span>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-gray-800 font-medium">Lección 1.3</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">PROGRESO</span>
          <Progress value={60} className="w-full h-3" indicatorClassName="bg-[oklch(var(--progress-orange))]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Lección 1.3: El poder de la empatía
        </h1>
      </div>

      <div className="bg-[oklch(var(--empathy-sunny))] p-6 rounded-2xl flex items-start gap-4">
        <div className="bg-white/70 p-2 rounded-full">
          <Heart className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-yellow-900 mb-2">Objetivos de la lección</h3>
          <ul className="list-disc list-inside space-y-1 text-yellow-800">
            <li>Entender cómo se sienten los demás en diferentes situaciones.</li>
            <li>Aprender a hacer algo pequeño para crear un momento de alegría.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmpathyHeader;
