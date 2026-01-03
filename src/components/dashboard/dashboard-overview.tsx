// src/components/dashboard/dashboard-overview.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Check,
  Gamepad2,
  GraduationCap,
  Lightbulb,
  Puzzle,
  Trophy,
} from 'lucide-react';

const DashboardOverview = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {/* Welcome Header */}
          <Card className="rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">¡Hola, Campeón!</h2>
                <p className="text-muted-foreground">
                  Hoy es un gran día para aprender.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-full p-2 flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full bg-amber-200">
                😊
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                😐
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                😢
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Card className="rounded-[2rem] p-6 flex flex-col items-center gap-3 text-center cursor-pointer hover:-translate-y-1 transition-transform bg-[oklch(var(--dash-blue-pastel))]">
              <div className="bg-white/80 rounded-full p-3">
                <Puzzle className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-bold text-lg">Actividades</h3>
            </Card>
            <Card className="rounded-[2rem] p-6 flex flex-col items-center gap-3 text-center cursor-pointer hover:-translate-y-1 transition-transform bg-[oklch(var(--dash-amber-pastel))]">
              <div className="bg-white/80 rounded-full p-3">
                <GraduationCap className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="font-bold text-lg">Cursos</h3>
            </Card>
            <Card className="rounded-[2rem] p-6 flex flex-col items-center gap-3 text-center cursor-pointer hover:-translate-y-1 transition-transform bg-[oklch(var(--dash-green-pastel))]">
              <div className="bg-white/80 rounded-full p-3">
                <Gamepad2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-bold text-lg">Juegos</h3>
            </Card>
          </div>

          {/* Progress Section */}
          <Card className="rounded-[2rem] p-6 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CardHeader className="flex flex-row items-center gap-2 p-0 mb-4">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <CardTitle>Tu Súper Progreso</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col gap-4">
              <div>
                <p className="font-semibold mb-2">Lectura</p>
                <Progress
                  value={75}
                  className="h-4"
                  indicatorClassName="bg-[oklch(var(--dash-progress-orange))]"
                />
              </div>
              <div>
                <p className="font-semibold mb-2">Matemáticas</p>
                <Progress
                  value={50}
                  className="h-4"
                  indicatorClassName="bg-[oklch(var(--dash-progress-blue))]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          {/* Agenda Widget */}
          <Card className="rounded-[2rem] p-6 shadow-sm h-fit animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CardHeader className="flex flex-row items-center gap-2 p-0 mb-4">
              <Calendar className="h-6 w-6" />
              <CardTitle>Agenda del Día</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px]">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 opacity-60">
                    <Check className="h-5 w-5" />
                    <p className="line-through">10:00 - Desayuno</p>
                  </div>
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-xl font-semibold">
                    <p>15:00 - Terapia del Habla</p>
                  </div>
                  <div>
                    <p>17:00 - Lección de Inglés</p>
                  </div>
                </div>
              </ScrollArea>
              <Button className="w-full mt-4 bg-[oklch(var(--brand-mustard))] font-bold hover:bg-[oklch(var(--brand-mustard)/0.9)]">
                Ver Checklist Completo
              </Button>
            </CardContent>
          </Card>

          {/* Tip Card */}
          <div className="bg-gradient-to-br from-[oklch(var(--dash-gradient-start))] to-[oklch(var(--dash-gradient-end))] rounded-[2rem] p-6 text-white relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative z-10">
              <Lightbulb className="h-8 w-8 mb-2" />
              <h3 className="font-bold text-lg mb-1">Consejo del Día</h3>
              <p>Beber agua ayuda a tu cerebro a pensar mejor.</p>
            </div>
            <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-8 -right-1 h-16 w-16 rounded-full bg-white/10"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;