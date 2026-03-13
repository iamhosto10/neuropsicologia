// src/app/(login)/dashboard/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { getParentDashboardQuery } from "@/lib/query";
import { redirect } from "next/navigation";
import DashboardOverview from "@/components/dashboard/dashboard-overview";
import WeeklyChecklist from "@/components/weekly-checklist/weekly-checklist";
import MyActivitiesDashboard from "@/components/profile/my-activities-dashboard";
import { MobileProgressCard } from "@/components/dashboard/mobile-progress-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 1. Obtenemos la sesión de Clerk
  const { userId, redirectToSignIn } = await auth();
  const userClerk = await currentUser();

  if (!userId) {
    return redirectToSignIn();
  }

  // 2. Buscamos los datos de los hijos (cadetes) en Sanity
  const sanityUserId = `user-${userClerk?.id}`;
  const kids = await client.withConfig({ useCdn: false }).fetch(
    getParentDashboardQuery,
    {
      parentSanityId: sanityUserId,
    },
    { cache: "no-store" },
  );

  // 3. Renderizamos la vista manteniendo tu diseño original
  return (
    <div className="max-w-full mx-auto md:p-8 space-y-8">
      {/* Pasamos los datos de los niños al componente principal para que los muestre */}
      <DashboardOverview kidsData={kids} />

      {/* Tus otros componentes se mantienen intactos en el layout */}
      <MobileProgressCard />
      <WeeklyChecklist />
      <MyActivitiesDashboard />
    </div>
  );
}
