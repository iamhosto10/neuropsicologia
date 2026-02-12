import FeaturesGrid from "@/components/features-grid/features-grid";
import { HeroSection } from "@/components/heroSection/hero-section";
import PopularActivities from "@/components/popular-activities/popular-activities";
import { ToolsSection } from "@/components/tools-section/tools-section";

export default async function Home() {
  return (
    <main className="bg-[#F9FAFB] ">
      <HeroSection />
      <FeaturesGrid />
      <ToolsSection />
      <PopularActivities />
    </main>
  );
}
