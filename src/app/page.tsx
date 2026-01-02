import FeaturesGrid from "@/components/features-grid/features-grid";
import { HeroSection } from "@/components/heroSection/hero-section";
import { ToolsSection } from "@/components/tools-section/tools-section";

export default function Home() {
  return (
    <main className="bg-[#F9FAFB] ">
      <HeroSection />
      <FeaturesGrid />
      <ToolsSection />
    </main>
  );
}
