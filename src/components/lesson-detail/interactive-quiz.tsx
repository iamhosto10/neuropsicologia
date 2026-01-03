import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { HelpCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const quizOptions = [
  {
    label: "Niños Riendo",
    isSelected: true,
    isCorrect: true,
  },
  {
    label: "Niño Llorando",
    isSelected: false,
    isCorrect: false,
  },
  {
    label: "Niña Enojada",
    isSelected: false,
    isCorrect: false,
  },
  {
    label: "Bebé Durmiendo",
    isSelected: false,
    isCorrect: false,
  },
];

export const InteractiveQuiz = () => {
  return (
    <Card className="overflow-hidden rounded-2xl border-gray-100 shadow-sm">
      <CardHeader className="bg-[oklch(var(--learning-purple))] p-4 rounded-t-2xl flex flex-row items-center gap-2">
        <HelpCircle className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-bold text-purple-900">
          ¿Juguemos a adivinar?
        </h3>
      </CardHeader>
      <CardContent className="p-6">
        <p className="mb-4">
          Selecciona la imagen que mejor representa la emoción de la{" "}
          <strong>alegría</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizOptions.map((option, index) => (
            <div
              key={index}
              className={cn(
                "border-2 rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-all",
                {
                  "border-blue-400 bg-blue-50 relative": option.isSelected,
                  "border-gray-200": !option.isSelected,
                }
              )}
            >
              {option.isSelected && (
                <div className="absolute top-2 right-2 bg-white rounded-full">
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                </div>
              )}
              <div className="h-32 w-full bg-gray-200 rounded-lg mb-2" />
              <p className="text-center font-medium">{option.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <div className="w-full bg-[oklch(var(--learning-success))] text-green-800 p-3 rounded-b-lg flex gap-2 items-center">
          <p>¡Correcto! La risa es señal de alegría.</p>
        </div>
      </CardFooter>
    </Card>
  );
};
