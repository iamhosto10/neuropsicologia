import type { ReactNode } from "react";

// Contenedor común de las páginas legales/informativas (borradores).
export function LegalPage({ title, updated, draft = true, children }: { title: string; updated: string; draft?: boolean; children: ReactNode }) {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-slate-800">
      <h1 className="text-4xl font-black text-slate-900 mb-2">{title}</h1>
      <p className="text-sm text-slate-500 mb-6">Última actualización: {updated}</p>
      {draft && (
        <div role="note" className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Borrador pendiente de revisión legal.</strong> Los textos marcados con [REVISAR] deben completarse y ser validados por un abogado antes del lanzamiento.
        </div>
      )}
      <div className="space-y-4 leading-relaxed [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:mt-8 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
        {children}
      </div>
    </main>
  );
}
