import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smile, Clock, BarChart, PlayCircle } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

const metadata = [
  { icon: Smile, label: "4 - 6 años", value: "Edad Recomendada" },
  { icon: Clock, label: "10 horas", value: "Duración" },
  { icon: BarChart, label: "Nivel", value: "Principiante" },
];

export function CourseHero() {
  return (
    <div className=" flex  flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-0 gap-8">
      <header>
        <Breadcrumb className="text-sm text-muted-foreground">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cursos">cursos</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Aventura de las emociones</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl md:text-5xl font-extrabold text-black mt-2">
          Aventura de las emociones
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 ">
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-1 flex-col md:flex-row lg:flex-col gap-4">
              {metadata.map((item, index) => (
                <Card
                  key={index}
                  className="p-4 rounded-2xl shadow-sm flex-1 flex flex-col items-left justify-center gap-2"
                >
                  <item.icon className="h-8 w-8 text-brand-mustard" />
                  <span className="font-semibold">{item.value}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
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
    </div>
  );
}
