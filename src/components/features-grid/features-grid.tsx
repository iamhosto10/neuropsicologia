import { Puzzle, GraduationCap, ListTodo, Gamepad2 } from "lucide-react";
import React from "react";

const features = [
  {
    icon: <Puzzle className="h-8 w-8 text-[#22C55E]" />,
    title: "Actividades",
    subtitle: "Explora y diviértete",
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-[#22C55E]" />,
    title: "Cursos",
    subtitle: "Aprende a tu ritmo",
  },
  {
    icon: <ListTodo className="h-8 w-8 text-[#22C55E]" />,
    title: "Checklists",
    subtitle: "Organiza tus tareas",
  },
  {
    icon: <Gamepad2 className="h-8 w-8 text-[#22C55E]" />,
    title: "Juegos",
    subtitle: "Desafía tu mente",
  },
];

const FeaturesGrid: React.FC = () => {
  return (
    <div className=" container mx-auto grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4 lg:gap-8 px-6 lg:px-10 py-5">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="flex flex-col items-center text-center p-6 rounded-2xl border border-green-100 bg-white hover:scale-110 hover:cursor-pointer transition-transform"
        >
          {feature.icon}
          <h3 className="mt-4 font-bold">{feature.title}</h3>
          <p className="text-sm text-gray-500">{feature.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default FeaturesGrid;
