"use client";

import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Heart, Smile, Clock } from "lucide-react";

const durationTags = ["15 min", "30 min", "45+ min"];
const difficultyTags = ["Fácil", "Medio", "Difícil"];

const mockActivities = [
  {
    id: 1,
    title: "Laberinto de Trazos",
    description:
      "Ayuda a los niños a mejorar su motricidad fina y la coordinación mano-ojo.",
    age: "3-5 años",
    duration: "15 min",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Memoria de Formas",
    description:
      "Un juego clásico para potenciar la memoria visual y el reconocimiento de patrones.",
    age: "4-6 años",
    duration: "20 min",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Clasificación de Colores",
    description:
      "Fomenta el aprendizaje de los colores y la habilidad para categorizar objetos.",
    age: "2-4 años",
    duration: "10 min",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    title: "Construcción con Bloques",
    description:
      "Estimula la creatividad, la planificación y las habilidades espaciales.",
    age: "3-7 años",
    duration: "30 min",
    image: "/placeholder.svg",
  },
  {
    id: 5,
    title: "Cuento Interactivo",
    description:
      "Desarrolla la comprensión auditiva y la imaginación a través de una historia.",
    age: "4-8 años",
    duration: "25 min",
    image: "/placeholder.svg",
  },
  {
    id: 6,
    title: "Rompecabezas Numérico",
    description:
      "Introduce a los niños en el mundo de los números y el pensamiento lógico.",
    age: "5-7 años",
    duration: "20 min",
    image: "/placeholder.svg",
  },
];

function ActivityCard({
  activity,
  delay,
}: {
  activity: (typeof mockActivities)[0];
  delay: number;
}) {
  return (
    <Card
      className="bg-white shadow-sm rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 pt-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="p-0 relative">
        <div className="aspect-video bg-gray-100" />
        <Button
          size="icon"
          className="absolute top-3 right-3 bg-white rounded-full shadow hover:bg-gray-50"
        >
          <Heart className="h-5 w-5 text-gray-500" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="font-bold text-lg mb-1">
          {activity.title}
        </CardTitle>
        <p className="text-gray-600 text-sm line-clamp-2">
          {activity.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Smile className="h-4 w-4" />
          <span>{activity.age}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{activity.duration}</span>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ActivityCatalog() {
  const [ageRange, setAgeRange] = useState([2, 12]);
  const [selectedDuration, setSelectedDuration] = useState("30 min");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medio");
  const [activityType, setActivityType] = useState("Cognitivo");

  const handleResetFilters = () => {
    setAgeRange([2, 12]);
    setSelectedDuration("30 min");
    setSelectedDifficulty("Medio");
    setActivityType("Cognitivo");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
        Actividades para Descubrir y Crecer
      </h1>
      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Filter Panel */}
        <aside className="w-full lg:w-1/4 mb-8 lg:mb-0">
          <div className="bg-white rounded-3xl p-6 h-fit shadow-sm space-y-6">
            <div>
              <Label className="text-lg font-semibold">
                Edad: {ageRange[0]} - {ageRange[1]} años
              </Label>
              <Slider
                defaultValue={ageRange}
                min={0}
                max={15}
                step={1}
                onValueChange={setAgeRange}
                className="mt-4"
              />
            </div>

            <Separator />

            <div>
              <Label className="text-lg font-semibold">Duración</Label>
              <div className="flex flex-wrap gap-2 mt-4">
                {durationTags.map((tag) => (
                  <Button
                    key={tag}
                    onClick={() => setSelectedDuration(tag)}
                    variant="outline"
                    className={`rounded-full border transition-colors ${
                      selectedDuration === tag
                        ? "bg-[#ecfccb] border-[oklch(var(--highlight-green))] text-black hover:bg-[#d9f99d]"
                        : "bg-gray-100 text-black border-transparent hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-lg font-semibold">Dificultad</Label>
              <div className="flex flex-wrap gap-2 mt-4">
                {difficultyTags.map((tag) => (
                  <Button
                    key={tag}
                    onClick={() => setSelectedDifficulty(tag)}
                    variant="outline"
                    className={`rounded-full border transition-colors ${
                      selectedDifficulty === tag
                        ? "bg-[#ecfccb] border-[oklch(var(--highlight-green))] text-black hover:bg-[#d9f99d]"
                        : "bg-gray-100 text-black border-transparent hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-lg font-semibold">Tipo de Actividad</Label>
              <RadioGroup
                value={activityType}
                onValueChange={setActivityType}
                className="mt-4 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Sensorial"
                    id="r1"
                    className="data-[state=checked]:text-[oklch(var(--highlight-green))]"
                  />
                  <Label htmlFor="r1">Sensorial</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Motor"
                    id="r2"
                    className="data-[state=checked]:text-[oklch(var(--highlight-green))]"
                  />
                  <Label htmlFor="r2">Motor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="Cognitivo"
                    id="r3"
                    className="data-[state=checked]:text-[oklch(var(--highlight-green))]"
                  />
                  <Label htmlFor="r3">Cognitivo</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="pt-4">
              <Button className="w-full font-bold bg-[oklch(var(--highlight-green))] text-black hover:bg-[oklch(var(--highlight-green)/0.9)]">
                Aplicar Filtros
              </Button>
              <Button
                variant="link"
                onClick={handleResetFilters}
                className="w-full mt-2 text-gray-500 underline"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </aside>

        {/* Activity Grid */}
        <main className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockActivities.map((activity, i) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                delay={i * 200}
              />
            ))}
          </div>
          <div className="mt-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive
                    className="bg-[oklch(var(--highlight-green))] text-black"
                  >
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </main>
      </div>
    </div>
  );
}
