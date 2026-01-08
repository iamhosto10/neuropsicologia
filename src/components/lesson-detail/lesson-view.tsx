import { LessonHeader } from "./lesson-header";
import { InteractiveQuiz } from "./interactive-quiz";
import { InteractiveDragDrop } from "./interactive-drag-drop";
import { LessonSidebar } from "./lesson-sidebar";
import { SanityActivity } from "@/lib/types";
import { urlFor } from "@/sanity/lib/image";
import { PlayCircle } from "lucide-react";

interface LessonViewProps {
  activity: SanityActivity;
}

function VideoPlayer({ activity }: { activity: SanityActivity }) {
  if (activity.video) {
    // If it's a youtube link or similar, we might need to embed it properly.
    // For now, let's assume it's a direct link or just show a placeholder if we can't embed.
    // If it's a sanity file, we can play it.
    // Let's just use the image as a poster if available.

    return (
       <div className="w-full aspect-video bg-black rounded-2xl flex items-center justify-center border overflow-hidden relative">
          {/* <video src={activity.video} controls className="w-full h-full" poster={activity.image ? urlFor(activity.image).url() : undefined} /> */}
           {/* Since we don't know the video format, let's fallback to a link or placeholder with image */}
           {activity.image && (
             <img src={urlFor(activity.image).url()} alt={activity.title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
           )}
           <a href={activity.video} target="_blank" rel="noopener noreferrer" className="z-10 flex flex-col items-center text-white gap-2 hover:scale-110 transition">
             <PlayCircle size={64} />
             <span>Ver Video</span>
           </a>
       </div>
    );
  }

  if (activity.image) {
    return (
       <div className="w-full aspect-video bg-slate-100 rounded-2xl flex items-center justify-center border overflow-hidden">
         <img src={urlFor(activity.image).url()} alt={activity.title} className="w-full h-full object-cover" />
       </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border">
      <p className="text-slate-400 font-medium">No video or image available</p>
    </div>
  );
}

export const LessonView = ({ activity }: LessonViewProps) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="pt-18">
        <LessonHeader activity={activity} />

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start">
          <main className="col-span-12 lg:col-span-8 space-y-8">
            <VideoPlayer activity={activity} />
            <article className="prose max-w-none">
              <p>
                {activity.description}
              </p>
              {/* Objectives */}
              {activity.objectives && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-2">Objetivos</h3>
                  <ul className="list-disc pl-5">
                    {activity.objectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
            <InteractiveQuiz />
            <InteractiveDragDrop />
          </main>
          <aside className="col-span-12 lg:col-span-4 lg:sticky top-22">
            <LessonSidebar materials={activity.materials} />
          </aside>
        </div>
      </div>
    </div>
  );
};
