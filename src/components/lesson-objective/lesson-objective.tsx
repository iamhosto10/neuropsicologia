import { cn } from "@/lib/utils";
import { JSX } from "react";

const LessonObjective = ({
  children,
  classname,
}: {
  children: JSX.Element;
  classname?: string;
}) => {
  return (
    <div
      className={cn(
        "bg-[oklch(var(--creative-amber-bg))] border border-amber-200 rounded-2xl p-4",
        classname
      )}
    >
      {children}
    </div>
  );
};

export default LessonObjective;
