import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Smile, Clock, BarChart, PlayCircle } from 'lucide-react';

const metadata = [
  { icon: Smile, label: 'Nivel', value: 'Principiante' },
  { icon: Clock, label: 'Duración', value: '10 horas' },
  { icon: BarChart, label: 'Modalidad', value: 'Online' },
];

export function CourseHero() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Column: Video */}
      <div className="w-full lg:w-2/3">
        <div className="relative aspect-video bg-gray-900 rounded-[2rem] flex items-center justify-center p-4">
          {/* Placeholder for a video or image */}
          <div className="absolute inset-0 bg-black/50 rounded-[2rem]"></div>
          <PlayCircle className="h-20 w-20 text-white/70" />
        </div>
      </div>

      {/* Right Column: Sidebar/Metadata */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        {/*
          Layout Logic:
          - Mobile (<md): flex-col (default, but handled by parent's flex direction)
          - Tablet (md to lg): flex-row
          - Desktop (lg+): flex-col (as it's inside a flex-col container)
        */}
        <div className="flex flex-col md:flex-row lg:flex-col gap-4">
            <div className='flex flex-1 flex-col md:flex-row gap-4'>
                {metadata.map((item, index) => (
                    <Card key={index} className="p-4 rounded-2xl shadow-sm flex-1 flex flex-col items-center justify-center gap-2">
                        <item.icon className="h-8 w-8 text-muted-foreground" />
                        <span className="font-semibold">{item.value}</span>
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                    </Card>
                ))}
            </div>

            <Button
            size="lg"
            className="w-full bg-[oklch(var(--brand-sky))] text-black font-bold rounded-full text-lg py-6"
            >
            Inscríbete ahora
            </Button>
        </div>
      </div>
    </div>
  );
}
