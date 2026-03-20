// src/components/dashboard/assign-button.tsx
"use client";

import { useState, useTransition } from "react";
import { assignToKid } from "@/app/actions/assignment.actions";
import { Button } from "@/components/ui/button";
import { Plus, Check, Loader2, ChevronDown } from "lucide-react";

interface Kid {
  _id: string;
  alias: string;
}

export default function AssignButton({
  kids,
  itemId,
  itemType,
}: {
  kids: Kid[];
  itemId: string;
  itemType: "course" | "activity";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [assignedId, setAssignedId] = useState<string | null>(null);

  const handleAssign = (kidId: string) => {
    startTransition(async () => {
      await assignToKid(kidId, itemId, itemType);
      setAssignedId(kidId);
      setTimeout(() => {
        setAssignedId(null);
        setIsOpen(false);
      }, 1500); // El chulito verde se queda 1.5s y luego se cierra
    });
  };

  if (kids.length === 0) return null;

  return (
    <div className="relative w-full">
      <Button
        variant="outline"
        className="w-full bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 hover:text-cyan-800 rounded-xl font-bold h-10 shadow-sm transition-all"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <Plus className="w-4 h-4 mr-2" /> Asignar a Cadete{" "}
        <ChevronDown className="w-4 h-4 ml-auto opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-[10px] font-black text-slate-400 uppercase px-3 pb-2 tracking-widest border-b border-slate-100 mb-1">
            Elige un perfil
          </p>
          {kids.map((kid) => (
            <button
              key={kid._id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAssign(kid._id);
              }}
              disabled={isPending}
              className="w-full text-left px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors"
            >
              {kid.alias}
              {isPending && !assignedId && (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              )}
              {assignedId === kid._id && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
