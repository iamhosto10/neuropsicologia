// src/components/activity-detail/instructions-list.tsx
import { CheckCircle2 } from "lucide-react";

interface Instruction {
  step?: string;
  description?: string;
}

interface InstructionsListProps {
  instructions: Instruction[];
}

export default function InstructionsList({
  instructions,
}: InstructionsListProps) {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-900 mb-8">Paso a Paso</h2>

      <div className="space-y-6">
        {instructions.map((instruction, index) => (
          <div
            key={index}
            className="flex gap-6 p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group"
          >
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-black text-lg group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                {index + 1}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                {instruction.step || `Paso ${index + 1}`}
                <CheckCircle2 className="w-5 h-5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {instruction.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
