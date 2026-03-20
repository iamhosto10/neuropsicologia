"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

export default function SubmitButton() {
  // 🔥 Este hook detecta automáticamente si el formulario padre está enviando datos
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-12 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md shadow-cyan-900/20 disabled:opacity-70"
    >
      {pending ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <Save className="w-5 h-5 mr-2" />
      )}
      {pending ? "Guardando..." : "Guardar Cambios"}
    </Button>
  );
}
