import FeaturesGrid from "@/components/features-grid/features-grid";
import { HeroSection } from "@/components/heroSection/hero-section";
import PopularActivities from "@/components/popular-activities/popular-activities";
import { ToolsSection } from "@/components/tools-section/tools-section";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }
  return (
    <main className="bg-[#F9FAFB] ">
      <HeroSection />
      <FeaturesGrid />
      <ToolsSection />
      <PopularActivities />
    </main>
  );
}
