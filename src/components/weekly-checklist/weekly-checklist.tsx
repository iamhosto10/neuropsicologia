"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Bed,
  Sun,
  Book,
  Check,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Types
type TaskStatus = "pending" | "completed";

interface Task {
  id: number;
  text: string;
  icon: LucideIcon;
  status: TaskStatus;
  hasReminder?: boolean;
}

interface Day {
  dayName: string;
  tasks: Task[];
}

// Mock Data
const weeklyData: Day[] = [
  {
    dayName: "Lunes",
    tasks: [
      {
        id: 1,
        text: "Tender la cama",
        icon: Bed,
        status: "completed",
      },
      { id: 2, text: "Desayunar", icon: Sun, status: "pending" },
    ],
  },
  {
    dayName: "Martes",
    tasks: [
      {
        id: 3,
        text: "Leer 10 min",
        icon: Book,
        status: "pending",
        hasReminder: true,
      },
    ],
  },
  {
    dayName: "Miércoles",
    tasks: [],
  },
  {
    dayName: "Jueves",
    tasks: [
      { id: 4, text: "Meditación", icon: Sun, status: "completed" },
      { id: 5, text: "Ejercicio", icon: Sun, status: "pending" },
    ],
  },
  {
    dayName: "Viernes",
    tasks: [{ id: 6, text: "Trabajo", icon: Book, status: "pending" }],
  },
  {
    dayName: "Sábado",
    tasks: [{ id: 7, text: "Descansar", icon: Bed, status: "completed" }],
  },
  {
    dayName: "Domingo",
    tasks: [],
  },
];

// Main component
const WeeklyChecklist = () => {
  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-black mb-4 md:mb-0">
          Mis Checklists de la Semana
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="font-bold whitespace-nowrap">
              20 - 26 de Mayo, 2024
            </span>
            <Button variant="ghost" size="icon">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <Button variant="ghost" size="icon">
            <Calendar className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-7 gap-6 md:gap-4 animate-in zoom-in-95 fade-in duration-500">
        {weeklyData.map((day) => (
          <DayColumn key={day.dayName} day={day} />
        ))}
      </div>
    </section>
  );
};

// DayColumn Component
const DayColumn = ({ day }: { day: Day }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm p-4 flex flex-col gap-4 h-full">
      <h2 className="font-bold text-lg">{day.dayName}</h2>
      <div className="flex-grow space-y-3">
        {day.tasks.length > 0 ? (
          day.tasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm">No hay actividades</p>
          </div>
        )}
      </div>
      <Button className="w-full bg-[oklch(var(--checklist-sky))] hover:bg-[oklch(var(--checklist-sky)/0.9)] text-white font-bold rounded-xl mt-auto">
        <Plus className="w-4 h-4 mr-2" />
        Añadir Actividad
      </Button>
    </div>
  );
};

// TaskItem Component
const TaskItem = ({ task }: { task: Task }) => {
  const isCompleted = task.status === "completed";
  const Icon = task.icon;

  return (
    <div
      className={cn(
        "rounded-2xl p-3 flex items-center gap-3 transition-colors",
        isCompleted
          ? "bg-[oklch(var(--checklist-green))]"
          : "bg-[oklch(var(--checklist-gray-bg))]"
      )}
    >
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
          isCompleted
            ? "bg-[oklch(var(--checklist-green-solid))] text-white"
            : "border-2 border-gray-300"
        )}
      >
        {isCompleted && <Check className="w-4 h-4" />}
      </div>
      <div className="flex-grow flex items-center gap-2">
        <Icon
          className={cn(
            "w-5 h-5",
            isCompleted ? "text-green-900" : "text-gray-500"
          )}
        />
        <span
          className={cn(
            "text-sm",
            isCompleted ? "text-green-950 font-medium" : "text-gray-800"
          )}
        >
          {task.text}
        </span>
      </div>
      {task.hasReminder && (
        <Bell className="w-5 h-5 text-amber-500 shrink-0" />
      )}
    </div>
  );
};

export default WeeklyChecklist;
