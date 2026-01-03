import { Brain, Frown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const ReflectionQuiz = () => {
  return (
    <div className="bg-[oklch(var(--empathy-purple))] p-6 md:p-8 rounded-[2rem] animate-in fade-in slide-in-from-bottom-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-white/20 p-2 rounded-full">
          <Brain className="h-6 w-6 text-purple-900" />
        </div>
        <h2 className="text-2xl font-bold text-purple-900">¿Qué harías tú?</h2>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-shrink-0">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-purple-100">
              <Frown className="h-10 w-10 text-purple-400" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-grow text-center md:text-left">
          <p className="text-lg font-semibold text-gray-800">
            Lucas está triste porque se le ha roto su juguete favorito. ¿Qué puedes hacer para ayudarle a sentirse mejor?
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" className="w-full md:w-auto border-purple-300 text-purple-800 hover:bg-purple-100 hover:text-purple-900 transition-colors">
            Ayudarle a repararlo
          </Button>
          <Button variant="outline" className="w-full md:w-auto border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">
            Ignorarlo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReflectionQuiz;
