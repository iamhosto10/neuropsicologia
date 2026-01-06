import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { Course } from "@/lib/types";

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="bg-white pt-0 rounded-[2rem] border-none shadow-sm hover:shadow-lg overflow-hidden group transition-all duration-500 hover:-translate-y-2 cursor-pointer">
      <div className={`relative h-48 ${course.bgColor}`}>
        <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full cursor-pointer transition hover:scale-105">
          <Heart className="w-5 h-5 text-black" />
        </div>
      </div>

      <CardContent className="p-6 flex flex-col gap-2">
        <h3 className="text-xl font-bold text-black line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-2 mt-4">
          <Badge className="bg-[oklch(var(--brand-pastel-tag))] text-amber-900 rounded-full font-medium">
            {course.age}
          </Badge>

          <Badge className="bg-[oklch(var(--brand-pastel-tag))] text-amber-900 rounded-full font-medium">
            {course.lessons}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
