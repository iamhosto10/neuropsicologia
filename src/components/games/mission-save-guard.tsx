"use client";
// Aviso a pantalla completa cuando una misión no se pudo guardar (en vez de volver al HQ sin avisar).
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import {
  getSaveState,
  retryFailedSave,
  setNavigateHome,
  subscribeSaveState,
} from "@/lib/mission-save-client";

export default function MissionSaveGuard() {
  const router = useRouter();
  const state = useSyncExternalStore(subscribeSaveState, getSaveState, getSaveState);

  useEffect(() => {
    setNavigateHome(() => router.push("/hq"));
  }, [router]);

  if (!state.failed) return null;
  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      className="fixed inset-0 z-[300] bg-slate-950/95 flex flex-col items-center justify-center gap-6 p-8 text-center"
    >
      <AlertTriangle className="w-16 h-16 text-amber-400" />
      <h2 className="text-3xl font-black text-white">No pudimos guardar tu misión</h2>
      <p className="text-slate-300 max-w-md">
        Tu progreso está a salvo en este dispositivo. Revisa la conexión a internet y vuelve a intentarlo.
      </p>
      <button
        onClick={() => retryFailedSave()}
        disabled={state.retrying}
        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-bold text-lg px-8 py-4 rounded-2xl"
      >
        {state.retrying ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
        {state.retrying ? "Guardando..." : "Reintentar"}
      </button>
      <a href="/hq" className="text-slate-400 underline text-sm">
        Volver al Cuartel General sin guardar
      </a>
    </div>
  );
}
