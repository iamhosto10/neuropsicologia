import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  color?: string;
}

export function HeroSection({
  title,
  subtitle,
  color = "bg-cyan-500",
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "w-full pt-32 pb-16 md:pt-40 md:pb-24 text-white relative overflow-hidden",
        color,
      )}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20px 20px, white 2%, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight drop-shadow-md">
          {title}
        </h1>
        <p className="text-lg md:text-xl font-medium text-white/90 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
