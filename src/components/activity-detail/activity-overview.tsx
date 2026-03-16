import { Clock, Users, PlayCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ActivityOverviewProps {
  title: string;
  description: string;
  duration?: string;
  ageRange?: string;
  category?: string;
  image: string;
  videoUrl?: string;
}

export default function ActivityOverview({
  title,
  description,
  duration,
  ageRange,
  category,
  image,
  videoUrl,
}: ActivityOverviewProps) {
  return (
    <div className="bg-white rounded-[2.5rem] p-4 md:p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
      {/* Imagen Principal */}
      <div className="w-full md:w-2/5 aspect-square md:aspect-auto md:h-80 rounded-3xl overflow-hidden relative shrink-0">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {category && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-800 px-4 py-2 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2">
            <Tag className="w-4 h-4 text-cyan-500" />
            {category}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 px-2 md:px-6 py-4">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-lg text-slate-500 mb-8 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-4 md:gap-8 mb-8">
          {duration && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-500">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">Duración</p>
                <p className="font-bold text-slate-800">{duration} min</p>
              </div>
            </div>
          )}

          {ageRange && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">Edades</p>
                <p className="font-bold text-slate-800">{ageRange}</p>
              </div>
            </div>
          )}
        </div>

        {videoUrl && (
          <Link href={videoUrl} target="_blank" rel="noopener noreferrer">
            <Button className="rounded-xl h-14 px-8 font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg gap-2 text-lg">
              <PlayCircle className="w-6 h-6" /> Ver Video Demostrativo
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
