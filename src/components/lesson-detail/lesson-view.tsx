import { LessonHeader } from "./lesson-header";
import { InteractiveQuiz } from "./interactive-quiz";
import { InteractiveDragDrop } from "./interactive-drag-drop";
import { LessonSidebar } from "./lesson-sidebar";

function MockVideoPlayer() {
  return (
    <div className="w-full aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border">
      <p className="text-slate-400 font-medium">Mock Video Player</p>
    </div>
  );
}

export const LessonView = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="pt-18">
        <LessonHeader />

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start">
          <main className="col-span-12 lg:col-span-8 space-y-8">
            <MockVideoPlayer />
            <article className="prose max-w-none">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                euismod, nisl nec ultricies lacinia, nisl nisl aliquet nisl,
                eget aliquet nisl nisl sit amet nisl.
              </p>
            </article>
            <InteractiveQuiz />
            <InteractiveDragDrop />
          </main>
          <aside className="col-span-12 lg:col-span-4 lg:sticky top-22">
            <LessonSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
};
