import { Button } from '@/components/ui/button';
import { Eye, Smile, Type, Sticker, RefreshCcw } from 'lucide-react';

export function DigitalArtCanvas() {
  return (
    <div className="bg-[oklch(var(--creative-amber-bg))] rounded-[2rem] p-8 animate-in zoom-in-95 duration-500">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* The Canvas */}
        <div className="w-64 h-64 bg-white border-8 border-[oklch(var(--creative-amber))] rounded-full shadow-sm relative shrink-0">
          {/* Mock content could go here */}
        </div>

        {/* The Toolbar */}
        <div className="flex flex-col items-center gap-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡Tu Turno!</h3>
            <div className="bg-white py-6 px-4 rounded-full shadow-sm flex flex-col gap-4">
                <Button size="icon" variant="ghost" className="rounded-full h-12 w-12 hover:bg-[oklch(var(--creative-amber-bg))]">
                    <Eye className="h-6 w-6 text-gray-500" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full h-12 w-12 hover:bg-[oklch(var(--creative-amber-bg))]">
                    <Smile className="h-6 w-6 text-gray-500" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full h-12 w-12 hover:bg-[oklch(var(--creative-amber-bg))]">
                    <Type className="h-6 w-6 text-gray-500" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full h-12 w-12 hover:bg-[oklch(var(--creative-amber-bg))]">
                    <Sticker className="h-6 w-6 text-gray-500" />
                </Button>
            </div>
            <Button variant="outline" className="rounded-full mt-2">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Reiniciar
            </Button>
        </div>
      </div>
    </div>
  );
}
