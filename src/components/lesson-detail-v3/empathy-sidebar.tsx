import { CheckCircle2, PlayCircle, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const modules = [
  { title: 'Lección 1.1: ¿Qué es la empatía?', status: 'completed' },
  { title: 'Lección 1.2: Escuchando con el corazón', status: 'completed' },
  { title: 'Lección 1.3: El poder de la empatía', status: 'current' },
  { title: 'Lección 1.4: Poniéndote en sus zapatos', status: 'locked' },
  { title: 'Lección 1.5: Respondiendo con amabilidad', status: 'locked' },
];

const resources = [
  { title: 'Guía de Actividades', size: '2.3 MB' },
  { title: 'Hoja de Reflexión', size: '1.1 MB' },
];

const EmpathySidebar = () => {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 space-y-8">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Módulos del curso</h3>
        <ul className="space-y-2">
          {modules.map((mod, index) => (
            <li
              key={index}
              className={cn(
                'flex items-center p-3 rounded-lg transition-colors',
                mod.status === 'current' && 'bg-[oklch(var(--brand-blue-soft))]',
                mod.status !== 'current' && 'hover:bg-gray-50'
              )}
            >
              {mod.status === 'completed' && <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />}
              {mod.status === 'current' && <PlayCircle className="h-5 w-5 mr-3 text-blue-500" />}
              {mod.status === 'locked' && <div className="h-5 w-5 mr-3 flex items-center justify-center"><div className="h-2 w-2 rounded-full bg-gray-300"></div></div>}

              <span className={cn(
                'font-medium',
                mod.status === 'locked' && 'text-gray-400',
                mod.status === 'current' && 'text-blue-800',
                mod.status === 'completed' && 'text-gray-600'
              )}>
                {mod.title}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recursos Adicionales</h3>
        <ul className="space-y-3">
          {resources.map((res, index) => (
            <li key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-700">{res.title}</p>
                  <p className="text-sm text-gray-500">{res.size}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Download className="h-5 w-5 text-gray-600" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EmpathySidebar;
