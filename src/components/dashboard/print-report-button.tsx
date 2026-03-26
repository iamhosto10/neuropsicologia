// src/components/dashboard/print-report-button.tsx
"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { ClinicalReportTemplate } from "./clinical-report-template";

interface PrintReportButtonProps {
  kidData: any;
  totalSessions: number;
  completedSessions: number;
  accuracyData: any[];
  detailedStats: Record<string, { date: string; metrics: any }>;
}

export default function PrintReportButton({
  kidData,
  totalSessions,
  completedSessions,
  accuracyData,
  detailedStats,
}: PrintReportButtonProps) {
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Reporte_Clinico_${kidData?.alias || "Paciente"}`,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    `,
  });

  return (
    <>
      <Button
        onClick={handlePrint}
        variant="outline"
        className="rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-cyan-700 shadow-sm font-bold flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Exportar a PDF
      </Button>

      {/* La plantilla se mantiene oculta en la web, pero el hook la usa para imprimir */}
      <div className="hidden">
        <ClinicalReportTemplate
          ref={componentRef}
          kidData={kidData}
          totalSessions={totalSessions}
          completedSessions={completedSessions}
          accuracyData={accuracyData}
          detailedStats={detailedStats}
        />
      </div>
    </>
  );
}
