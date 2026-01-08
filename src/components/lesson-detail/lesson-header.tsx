import { Badge } from "@/components/ui/badge";
import { Clock, Star, BookOpen } from "lucide-react";
import { SanityActivity } from "@/lib/types";

interface LessonHeaderProps {
  activity: SanityActivity;
}

export function LessonHeader({ activity }: LessonHeaderProps) {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
          <BookOpen className="w-3 h-3 mr-1" />
          Actividad
        </Badge>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{activity.duration} min</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span>{activity.level}</span>
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
        {activity.title}
      </h1>

      <p className="text-lg text-slate-600 max-w-3xl">
        {activity.description}
      </p>
    </div>
  );
}
