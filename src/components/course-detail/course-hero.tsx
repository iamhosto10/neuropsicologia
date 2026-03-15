import { Clock, BarChart } from "lucide-react";

interface CourseHeroProps {
  title: string;
  description: string;
  image: string;
  duration?: number | string;
  level?: string;
}

export default function CourseHero({
  title,
  description,
  image,
  duration,
  level,
}: CourseHeroProps) {
  return (
    <section className="relative bg-slate-900 text-white py-20 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
      </div>

      <div className="container mx-auto px-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-lg text-slate-300 mb-8 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap gap-4 text-sm font-bold">
            {duration && (
              <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{duration} min</span>
              </div>
            )}
            {level && (
              <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 capitalize">
                <BarChart className="w-4 h-4 text-cyan-400" />
                <span>Nivel {level}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
