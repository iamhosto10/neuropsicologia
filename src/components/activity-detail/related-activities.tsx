import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

interface RelatedActivity {
  id: string;
  title: string;
  image: string;
  duration: string;
  href: string;
}

interface RelatedActivitiesProps {
  activities: RelatedActivity[];
}

export default function RelatedActivities({
  activities,
}: RelatedActivitiesProps) {
  return (
    <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800">
      <h3 className="text-xl font-black text-white mb-6">
        Actividades Similares
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            href={activity.href}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-800 transition-colors group"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-800">
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-tight mb-1">
                {activity.title}
              </h4>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {activity.duration}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-500 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
