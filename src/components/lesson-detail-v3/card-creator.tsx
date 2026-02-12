"use client";

import { useState } from 'react';
import { Gift, Sun, Heart, Tent, Flower, Printer, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const drawings = [
  { id: 'sun', icon: Sun },
  { id: 'heart', icon: Heart },
  { id: 'tent', icon: Tent },
  { id: 'flower', icon: Flower },
];

const messages = [
  '¡Eres muy especial!',
  'Gracias por tu amistad.',
  'Tu sonrisa ilumina el día.',
  '¡Sigue así de genial!',
];

const CardCreator = () => {
  const [selectedDrawing, setSelectedDrawing] = useState('sun');
  const [selectedMessage, setSelectedMessage] = useState(messages[0]);

  const SelectedIcon = drawings.find(d => d.id === selectedDrawing)?.icon || Sun;

  return (
    <div className="bg-[oklch(var(--empathy-sunny))] p-6 md:p-8 rounded-[2rem] space-y-8 animate-in fade-in slide-in-from-bottom-6">
      <div className="flex items-center gap-3">
        <div className="bg-white/40 p-2 rounded-full">
          <Gift className="h-6 w-6 text-yellow-800" />
        </div>
        <h2 className="text-2xl font-bold text-yellow-900">Crea una Tarjeta de Alegría</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Controls */}
        <div className="w-full md:w-1/2 space-y-6">
          <div>
            <label className="text-lg font-semibold text-yellow-800 mb-2 block">1. Elige un dibujo</label>
            <div className="flex items-center gap-3">
              {drawings.map(({ id, icon: Icon }) => (
                <Button
                  key={id}
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-14 w-14 rounded-full bg-white/50 border-2 border-yellow-300 ring-4 ring-transparent transition-all hover:bg-white',
                    selectedDrawing === id && 'ring-yellow-500 border-yellow-500'
                  )}
                  onClick={() => setSelectedDrawing(id)}
                >
                  <Icon className="h-7 w-7 text-yellow-700" />
                </Button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-lg font-semibold text-yellow-800 mb-2 block">2. Elige un mensaje</label>
            <Select onValueChange={setSelectedMessage} defaultValue={selectedMessage}>
              <SelectTrigger className="w-full bg-white/50 border-yellow-300 text-yellow-900">
                <SelectValue placeholder="Elige un mensaje..." />
              </SelectTrigger>
              <SelectContent>
                {messages.map(msg => (
                  <SelectItem key={msg} value={msg}>{msg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="aspect-[3/4] w-full max-w-xs mx-auto bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-xl shadow-lg flex flex-col items-center justify-center gap-4 p-6 text-center">
            <SelectedIcon className="h-20 w-20 text-yellow-600 drop-shadow-lg" />
            <p className="text-xl font-medium text-yellow-800">{selectedMessage}</p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-yellow-300/50">
          <Button variant="outline" className="w-full sm:w-auto bg-white hover:bg-yellow-50 text-yellow-800 border-yellow-300">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button className="w-full sm:w-auto bg-[oklch(var(--brand-mustard))] hover:bg-[oklch(var(--brand-mustard-action))] text-white">
            <Send className="mr-2 h-4 w-4" />
            Enviar digital
          </Button>
        </div>
    </div>
  );
};

export default CardCreator;
