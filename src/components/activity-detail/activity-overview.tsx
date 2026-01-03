import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Clock,
  Users,
  BarChart,
  Play,
  Heart,
  Hammer,
  Lightbulb,
  CheckCircle2,
  Target,
} from "lucide-react";

const ActivityOverview = () => {
  return (
    <div className="container mx-auto max-w-5xl px-6 lg:px-10 pt-36 pb-8 animate-in slide-in-from-bottom-5 fade-in duration-700">
      {/* A. Header Info */}
      <header>
        <Breadcrumb className="text-sm text-muted-foreground">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/actividades">Actividades</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Juego de Memoria</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl md:text-5xl font-extrabold text-black mt-2">
          Juego de Memoria con Animales
        </h1>
        <p className="text-gray-600 mt-2">
          Una actividad divertida para mejorar la memoria y el reconocimiento de
          patrones en los niños, utilizando tarjetas con ilustraciones de
          animales.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge className="bg-[oklch(var(--brand-cream))] text-gray-800 hover:bg-orange-100 rounded-full px-4 py-1">
            <Clock className="h-4 w-4 mr-1" />
            20 min
          </Badge>
          <Badge className="bg-[oklch(var(--brand-cream))] text-gray-800 hover:bg-orange-100 rounded-full px-4 py-1">
            <Users className="h-4 w-4 mr-1" />
            3-5 años
          </Badge>
          <Badge className="bg-[oklch(var(--brand-cream))] text-gray-800 hover:bg-orange-100 rounded-full px-4 py-1">
            <BarChart className="h-4 w-4 mr-1" />
            Nivel Básico
          </Badge>
        </div>
      </header>

      {/* B. Media Player */}
      <div className="relative w-full h-64 md:h-96 rounded-[2rem] overflow-hidden mt-8 shadow-md">
        <div className="bg-gray-200 object-cover w-full h-full"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="h-16 w-16 rounded-full bg-[oklch(var(--brand-mustard))] text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
            <Play className="h-8 w-8 fill-black" />
          </button>
        </div>
      </div>

      {/* C. Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 mt-8">
        <Button className="w-full md:w-auto bg-[oklch(var(--brand-mustard))] text-black font-bold hover:bg-yellow-500 rounded-full text-lg h-12 px-8">
          Iniciar Actividad
        </Button>
        <Button
          variant="outline"
          className="w-full md:w-auto bg-white border shadow-sm rounded-full h-12 px-6"
        >
          <Heart className="h-5 w-5 mr-2" />
          Guardar en Favoritos
        </Button>
      </div>

      {/* D. Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
        {/* Card 1: Materiales */}
        <Card className="bg-white border-none shadow-sm p-6 rounded-3xl">
          <CardHeader className="flex flex-row items-center gap-4 p-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[oklch(var(--brand-blue-soft))]">
              <Hammer className="h-6 w-6 text-blue-800" />
            </div>
            <CardTitle>Materiales</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span>Tarjetas de memoria de animales</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span>Superficie plana (mesa o suelo)</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span>Cronómetro (opcional)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Card 2: Objetivos */}
        <Card className="bg-white border-none shadow-sm p-6 rounded-3xl">
          <CardHeader className="flex flex-row items-center gap-4 p-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[oklch(var(--brand-purple-soft))]">
              <Lightbulb className="h-6 w-6 text-purple-800" />
            </div>
            <CardTitle>Objetivos</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <ul className="space-y-2">
              <li className="flex items-center">
                <Target className="h-5 w-5 text-yellow-600 mr-2" />
                <span>Mejorar la memoria a corto plazo</span>
              </li>
              <li className="flex items-center">
                <Target className="h-5 w-5 text-yellow-600 mr-2" />
                <span>Fomentar la concentración</span>
              </li>
              <li className="flex items-center">
                <Target className="h-5 w-5 text-yellow-600 mr-2" />
                <span>Reconocer diferentes animales</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityOverview;
