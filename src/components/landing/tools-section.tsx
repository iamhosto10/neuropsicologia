import {
  Target,
  Satellite,
  RefreshCcw,
  LayoutGrid,
  Zap,
  Telescope,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

const toolsData = [
  {
    id: 1,
    title: "Limpieza Espacial",
    cognitiveArea: "Atención Sostenida",
    description:
      "Entrena la capacidad de mantener el foco en estímulos específicos ignorando los distractores de la basura espacial.",
    icon: <Target className="w-6 h-6 text-orange-500" />,
    color: "bg-orange-50",
  },
  {
    id: 2,
    title: "Rastreador Satelital",
    cognitiveArea: "Memoria de Trabajo",
    description:
      "Fortalece la retención a corto plazo obligando al cadete a recordar secuencias de luces y sonidos.",
    icon: <Satellite className="w-6 h-6 text-blue-500" />,
    color: "bg-blue-50",
  },
  {
    id: 3,
    title: "Campo de Asteroides",
    cognitiveArea: "Control Inhibitorio",
    description:
      "Clásico paradigma 'Go/No-Go'. Dispara a los asteroides, pero frena tus impulsos cuando aparezcan naves aliadas.",
    icon: <Telescope className="w-6 h-6 text-slate-700" />,
    color: "bg-slate-100",
  },
  {
    id: 4,
    title: "Comunicador Inverso",
    cognitiveArea: "Flexibilidad Cognitiva",
    description:
      "Desafía el cerebro a invertir órdenes. Si la flecha apunta arriba, debes presionar abajo. Rompe la rigidez mental.",
    icon: <RefreshCcw className="w-6 h-6 text-emerald-500" />,
    color: "bg-emerald-50",
  },
  {
    id: 5,
    title: "Matriz de Memoria",
    cognitiveArea: "Memoria Visoespacial",
    description:
      "Memoriza la ubicación exacta de las celdas de energía en una cuadrícula que se vuelve más compleja con cada nivel.",
    icon: <LayoutGrid className="w-6 h-6 text-purple-500" />,
    color: "bg-purple-50",
  },
  {
    id: 6,
    title: "Evasión Multitarea",
    cognitiveArea: "Atención Dividida",
    description:
      "El reto final: esquiva meteoritos mientras resuelves ecuaciones simples. Exige procesar múltiples fuentes de datos.",
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    color: "bg-yellow-50",
  },
];

export default function ToolsSection() {
  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsData.map((tool) => (
          <div
            key={tool.id}
            className="p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 bg-white group flex flex-col h-full"
          >
            {/* ... Icono y textos (Se queda igual) ... */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                {tool.icon}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {tool.cognitiveArea}
                </span>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">
                  {tool.title}
                </h3>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 grow">
              {tool.description}
            </p>

            {/* 🔥 AQUI REEMPLAZAMOS EL BOTÓN FINAL */}
            <div className="mt-auto w-full">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button
                    variant="ghost"
                    className="w-full rounded-xl font-bold text-cyan-600 bg-cyan-50 hover:bg-cyan-500 hover:text-white transition-colors"
                  >
                    Regístrate para jugar
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/select-profile" className="w-full block">
                  <Button
                    variant="ghost"
                    className="w-full rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Asignar Misión
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
