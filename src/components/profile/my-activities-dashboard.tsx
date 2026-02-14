import React from "react"
import { Search, SlidersHorizontal, Smile, Clock, Play, Heart, Star, Brain, Lightbulb, Zap, RotateCcw } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function MyActivitiesDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* A. Header & Search */}
      <header className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            Mis Actividades <span>🎨</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            ¡Sigue aprendiendo y divirtiéndote!
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Buscar actividad..."
            className="pl-9 pr-12 rounded-full bg-white border-gray-200 shadow-sm h-10"
          />
          <Button
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-yellow-400 text-black hover:bg-yellow-500 shadow-sm"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* B. Top Section (Progress & Filters) */}
      <section className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-8">

        {/* 1. Progress Card */}
        <Card className="col-span-12 lg:col-span-4 bg-white rounded-[2rem] p-0 shadow-sm border-none gap-0">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">Tu Progreso</h2>
              <p className="text-sm text-muted-foreground">Estás mejorando cada día</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Memoria Visual</span>
                  <span className="text-[oklch(var(--act-sky))]">80%</span>
                </div>
                <Progress value={80} className="h-2 bg-gray-100" indicatorClassName="bg-[oklch(var(--act-sky))]" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Vocabulario</span>
                  <span className="text-[oklch(var(--act-amber))]">45%</span>
                </div>
                <Progress value={45} className="h-2 bg-gray-100" indicatorClassName="bg-[oklch(var(--act-amber))]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Quick Filters */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros rápidos:</h3>

          <div className="flex flex-wrap gap-3">
             <Button
                variant="default"
                className="bg-black text-white hover:bg-gray-800 rounded-full px-6"
             >
               Todas
             </Button>
             {["4-6 Años", "Cortas", "Lógica", "Creatividad"].map((filter) => (
               <Button
                 key={filter}
                 variant="outline"
                 className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full px-6"
               >
                 {filter}
               </Button>
             ))}
          </div>
        </div>
      </section>

      {/* C. Content Grids */}
      <div className="space-y-12">

        {/* Section 1: "En Curso" (Recent) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">En Curso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Type A 1 */}
            <Card className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border-none p-0 gap-0">
              <div className="h-32 bg-[oklch(var(--act-pastel-blue))] relative flex items-center justify-center">
                 <Smile className="h-12 w-12 text-[oklch(var(--act-sky))] opacity-80" />
                 <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-white/50 rounded-full">
                    <Heart className="h-5 w-5" />
                 </Button>
                 {/* Bottom Border Progress */}
                 <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/30">
                    <div className="h-full w-[60%] bg-[oklch(var(--act-sky))] rounded-r-full" />
                 </div>
              </div>
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">Memoria</Badge>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                       <Clock className="h-3.5 w-3.5" />
                       <span>15 min</span>
                    </div>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-[oklch(var(--act-sky))] transition-colors">Aventura Submarina</h3>
                 <p className="text-muted-foreground text-sm line-clamp-2">
                    Encuentra los pares de peces de colores en el fondo del mar antes de que se acabe el tiempo.
                 </p>
                 <Button className="w-full bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 rounded-xl mt-6 h-12 gap-2 shadow-none border border-blue-100">
                    <span>Continuar</span>
                    <Play className="h-4 w-4 fill-current" />
                 </Button>
              </CardContent>
            </Card>

            {/* Card Type A 2 */}
            <Card className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border-none p-0 gap-0">
              <div className="h-32 bg-[oklch(var(--act-pastel-purple))] relative flex items-center justify-center">
                 <Brain className="h-12 w-12 text-purple-500 opacity-80" />
                 <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-white/50 rounded-full">
                    <Heart className="h-5 w-5" />
                 </Button>
                 {/* Bottom Border Progress */}
                 <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/30">
                    <div className="h-full w-[30%] bg-purple-500 rounded-r-full" />
                 </div>
              </div>
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">Lógica</Badge>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                       <Clock className="h-3.5 w-3.5" />
                       <span>10 min</span>
                    </div>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">Laberinto Mágico</h3>
                 <p className="text-muted-foreground text-sm line-clamp-2">
                    Guía al mago a través del laberinto resolviendo acertijos lógicos en cada esquina.
                 </p>
                 <Button className="w-full bg-purple-50 text-purple-600 font-bold hover:bg-purple-100 rounded-xl mt-6 h-12 gap-2 shadow-none border border-purple-100">
                    <span>Continuar</span>
                    <Play className="h-4 w-4 fill-current" />
                 </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 2: "Sugeridas para ti" (New) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-bold text-gray-900">Sugeridas para ti</h2>
             <Button variant="link" className="text-[oklch(var(--act-sky))] font-semibold">Ver todas</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card Type B 1 */}
            <Card className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border-none p-0 gap-0">
               <div className="h-28 bg-[oklch(var(--act-pastel-green))] relative flex items-center justify-center">
                  <Lightbulb className="h-10 w-10 text-green-600 opacity-80" />
               </div>
               <CardContent className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                     <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none rounded-md px-2 py-0.5 text-xs">Creatividad</Badge>
                     <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none rounded-md px-2 py-0.5 text-xs">Arte</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Pintando Sueños</h3>
                  <div className="flex items-center text-xs text-muted-foreground gap-1 mb-4">
                     <Clock className="h-3 w-3" />
                     <span>20 min</span>
                  </div>
                  <Button className="w-full bg-[oklch(var(--act-amber))] text-black font-bold hover:opacity-90 rounded-xl shadow-sm">
                     Jugar Ahora
                  </Button>
               </CardContent>
            </Card>

            {/* Card Type B 2 */}
            <Card className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border-none p-0 gap-0">
               <div className="h-28 bg-orange-100 relative flex items-center justify-center">
                  <Zap className="h-10 w-10 text-orange-500 opacity-80" />
               </div>
               <CardContent className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                     <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none rounded-md px-2 py-0.5 text-xs">Velocidad</Badge>
                     <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none rounded-md px-2 py-0.5 text-xs">Atención</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Rayo Veloz</h3>
                  <div className="flex items-center text-xs text-muted-foreground gap-1 mb-4">
                     <Clock className="h-3 w-3" />
                     <span>5 min</span>
                  </div>
                  <Button className="w-full bg-[oklch(var(--act-amber))] text-black font-bold hover:opacity-90 rounded-xl shadow-sm">
                     Jugar Ahora
                  </Button>
               </CardContent>
            </Card>

            {/* Card Type B 3 */}
            <Card className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border-none p-0 gap-0">
               <div className="h-28 bg-[oklch(var(--act-pastel-blue))] relative flex items-center justify-center">
                  <Star className="h-10 w-10 text-blue-500 opacity-80" />
               </div>
               <CardContent className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                     <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none rounded-md px-2 py-0.5 text-xs">Astronomía</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Explorador Espacial</h3>
                  <div className="flex items-center text-xs text-muted-foreground gap-1 mb-4">
                     <Clock className="h-3 w-3" />
                     <span>25 min</span>
                  </div>
                  <Button className="w-full bg-[oklch(var(--act-amber))] text-black font-bold hover:opacity-90 rounded-xl shadow-sm">
                     Jugar Ahora
                  </Button>
               </CardContent>
            </Card>

          </div>
        </section>

        {/* Section 3: "Guardadas" (Replay) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Guardadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

             {/* Card Type C 1 */}
             <Card className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border-none p-0 gap-0 opacity-90 hover:opacity-100">
              <div className="h-32 bg-gray-100 relative flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                 <RotateCcw className="h-12 w-12 text-gray-400" />
                 <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-red-500 hover:bg-white/50 rounded-full">
                    <Heart className="h-5 w-5 fill-current" />
                 </Button>
              </div>
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-gray-500 border-gray-200">Matemáticas</Badge>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                       <Clock className="h-3.5 w-3.5" />
                       <span>Completed</span>
                    </div>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-1">Números Divertidos</h3>
                 <p className="text-muted-foreground text-sm line-clamp-2">
                    Aprendiste a sumar y restar con frutas y animales.
                 </p>
                 <Button variant="outline" className="w-full border-2 border-[oklch(var(--act-amber))] text-[oklch(var(--act-amber))] font-bold hover:bg-[oklch(var(--act-amber))] hover:text-black rounded-xl mt-6 h-12 gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>Jugar de nuevo</span>
                 </Button>
              </CardContent>
            </Card>

            {/* Card Type C 2 */}
            <Card className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border-none p-0 gap-0 opacity-90 hover:opacity-100">
              <div className="h-32 bg-gray-100 relative flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500">
                 <RotateCcw className="h-12 w-12 text-gray-400" />
                 <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-red-500 hover:bg-white/50 rounded-full">
                    <Heart className="h-5 w-5 fill-current" />
                 </Button>
              </div>
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-gray-500 border-gray-200">Lenguaje</Badge>
                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                       <Clock className="h-3.5 w-3.5" />
                       <span>Completed</span>
                    </div>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-1">Sopa de Letras</h3>
                 <p className="text-muted-foreground text-sm line-clamp-2">
                    Encontraste todas las palabras ocultas en tiempo récord.
                 </p>
                 <Button variant="outline" className="w-full border-2 border-[oklch(var(--act-amber))] text-[oklch(var(--act-amber))] font-bold hover:bg-[oklch(var(--act-amber))] hover:text-black rounded-xl mt-6 h-12 gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>Jugar de nuevo</span>
                 </Button>
              </CardContent>
            </Card>

          </div>
        </section>

      </div>
    </div>
  )
}
