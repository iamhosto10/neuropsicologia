// src/components/dashboard/clinical-report-template.tsx
import { forwardRef } from "react";
import { Brain, Activity, Target } from "lucide-react";
import { CLINICAL_DICTIONARY } from "@/lib/clinical-dictionary";

interface ClinicalReportProps {
  kidData: any;
  totalSessions: number;
  completedSessions: number;
  accuracyData: any[];
  detailedStats: Record<string, { date: string; metrics: any }>;
}

export const ClinicalReportTemplate = forwardRef<
  HTMLDivElement,
  ClinicalReportProps
>(
  (
    { kidData, totalSessions, completedSessions, accuracyData, detailedStats },
    ref,
  ) => {
    const today = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div
        ref={ref}
        className="p-12 bg-white text-black font-sans w-full max-w-[210mm] mx-auto min-h-[297mm]"
      >
        {/* MEMBRETE CLÍNICO */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <Brain className="w-10 h-10 text-slate-800" />
            <div>
              <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">
                NeuroSpace Clinic
              </h1>
              <p className="text-sm text-slate-500">
                Unidad de Entrenamiento Neuropsicológico
              </p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-600 space-y-1">
            <p>
              <strong>Fecha de Emisión:</strong> {today}
            </p>
            <p>
              <strong>ID Documento:</strong> REP-
              {Math.floor(Math.random() * 10000)}
            </p>
          </div>
        </div>

        {/* DATOS DEL PACIENTE */}
        <div className="bg-slate-50 p-6 rounded-lg mb-8 border border-slate-200">
          <h2 className="text-lg font-bold border-b border-slate-300 pb-2 mb-4 uppercase text-slate-800">
            Resumen del Paciente
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p>
              <strong>Paciente:</strong> {kidData.alias}
            </p>
            <p>
              <strong>ID Clínico:</strong> {kidData._id.split("-").pop()}
            </p>
            <p>
              <strong>Días Entrenados:</strong> {totalSessions} sesiones
            </p>
            <p>
              <strong>Completitud de Tratamiento:</strong>{" "}
              {totalSessions > 0
                ? Math.round((completedSessions / totalSessions) * 100)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* 🔥 NUEVO: PERFIL COGNITIVO DETALLADO (LO QUE EL TERAPEUTA REALMENTE QUIERE VER) */}
        <div className="mb-8">
          <h2 className="text-lg font-bold border-b border-slate-800 pb-2 mb-4 uppercase flex items-center gap-2 text-slate-800">
            <Target className="w-5 h-5" /> Perfil Cognitivo (Última Evaluación)
          </h2>

          {Object.keys(detailedStats).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(detailedStats).map(([gameType, data]) => {
                const gameInfo = CLINICAL_DICTIONARY[gameType];
                if (!gameInfo) return null;

                return (
                  <div
                    key={gameType}
                    className="border border-slate-200 rounded-lg overflow-hidden break-inside-avoid"
                  >
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">
                          {gameInfo.title}
                        </p>
                        <p className="text-xs text-slate-500 uppercase">
                          {gameInfo.domain}
                        </p>
                      </div>
                      <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold">
                        Eval: {data.date}
                      </span>
                    </div>

                    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 bg-white">
                      {Object.entries(gameInfo.metrics).map(
                        ([metricKey, metricDef]) => {
                          const rawValue = data.metrics[metricKey];
                          if (rawValue === undefined || rawValue === null)
                            return null;

                          let displayValue = rawValue.toString();
                          if (metricDef.isPercentage)
                            displayValue = `${rawValue}%`;
                          if (metricDef.isTime) displayValue = `${rawValue} ms`;

                          return (
                            <div key={metricKey}>
                              <p className="text-xs text-slate-500 leading-tight mb-1">
                                {metricDef.label}
                              </p>
                              <p className="text-lg font-black text-slate-900">
                                {displayValue}
                              </p>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic p-4 bg-slate-50 border border-slate-200 rounded text-center">
              Aún no hay telemetría cognitiva detallada registrada para este
              paciente.
            </p>
          )}
        </div>

        {/* FIRMA DEL TERAPEUTA */}
        <div className="mt-24 pt-8 flex justify-end break-inside-avoid">
          <div className="text-center">
            <div className="w-48 border-b border-slate-800 mb-2 mx-auto"></div>
            <p className="font-bold text-slate-800">Firma del Especialista</p>
            <p className="text-xs text-slate-500">NeuroSpace Clinic Dept.</p>
          </div>
        </div>
      </div>
    );
  },
);

ClinicalReportTemplate.displayName = "ClinicalReportTemplate";
