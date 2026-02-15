import { auth, currentUser } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { GET_USER_BY_CLERK_ID } from "@/sanity/lib/queries";
import { redirect } from "next/navigation";
import DashboardOverview from "@/components/dashboard/dashboard-overview";
import WeeklyChecklist from "@/components/weekly-checklist/weekly-checklist";
import MyActivitiesDashboard from "@/components/profile/my-activities-dashboard";
import { MobileProgressCard } from "@/components/dashboard/mobile-progress-card";

export default async function DashboardPage() {
  // 1. Obtenemos la sesión de Clerk
  const { userId } = await auth();
  const userClerk = await currentUser();

  // Si no hay usuario, mandamos al login (aunque el middleware ya debería proteger esto)
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Buscamos los datos extendidos en Sanity
  // Le pasamos el userId de Clerk a la query
  const sanityUser = await client.fetch(GET_USER_BY_CLERK_ID, {
    clerkId: userId,
  });

  // 3. Renderizamos la vista
  return (
    <div className="max-w-full mx-auto md:p-8">
      <MobileProgressCard />
      <DashboardOverview />
      <WeeklyChecklist />
      <MyActivitiesDashboard />
    </div>
  );
}
