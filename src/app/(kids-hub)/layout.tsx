import React from "react";

export default function KidsHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 select-none font-sans relative">
      {/* Opcional: Un fondo de estrellas súper sutil (baja estimulación) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Aquí se renderizará el HQ o los Juegos */}
      <main className="relative z-10 h-full w-full flex flex-col items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
