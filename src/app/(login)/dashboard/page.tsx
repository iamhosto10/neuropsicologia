import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";
import DashboardOverview from "@/components/dashboard/dashboard-overview";
import MobileProgressCard from "@/components/dashboard/mobile-progress-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Identificamos al Terapeuta/Padre
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }

  // 🔥 CORRECCIÓN: Creamos el ID exacto que usa tu base de datos
  const sanityUserId = `user-${userId}`;
  const today = new Date().toISOString().split("T")[0];

  // 🔥 CORRECCIÓN: Buscamos usando parent._ref en lugar de parentId
  const query = `*[_type == "kidProfile" && parent._ref == $sanityUserId] | order(_createdAt desc) {
    _id,
    alias,
    activeAvatar,
    energyCrystals,
    "todaySession": *[_type == "dailySession" && kidReference._ref == ^._id && date == $today][0] {
      isCompleted,
      "totalMissions": count(missions),
      "completedMissions": count(completedMissions)
    }
  }`;

  const kids = await client
    .withConfig({ useCdn: false })
    .fetch(query, { sanityUserId, today }, { cache: "no-store" });

  // 3. Calculamos la data global
  const totalEnergy = kids.reduce(
    (sum: number, kid: any) => sum + (kid.energyCrystals || 0),
    0,
  );
  const totalKids = kids.length;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Panel de Comando
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Monitorea el progreso de tu escuadrón en tiempo real.
        </p>
      </div>

      {/* Tarjeta de Resumen Global */}
      <MobileProgressCard totalEnergy={totalEnergy} totalKids={totalKids} />

      {/* Grilla de Pacientes Reales */}
      <div>
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          Tus Cadetes
        </h2>
        <DashboardOverview kids={kids} />
      </div>
    </div>
  );
}
