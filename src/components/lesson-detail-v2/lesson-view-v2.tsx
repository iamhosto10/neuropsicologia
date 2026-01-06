import { CreativeHeader } from "./creative-header";
import { DrawingSteps } from "./drawing-steps";
import { DigitalArtCanvas } from "./digital-art-canvas";
import { LessonSidebar } from "./lesson-sidebar";

function MockVideoPlayer() {
  return (
    <div className="w-full aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border">
      <p className="text-slate-400 font-medium">Mock Video Player</p>
    </div>
  );
}

export function LessonViewV2() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <CreativeHeader />

      {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"> */}
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start">
        <main className="lg:col-span-8 space-y-8">
          <MockVideoPlayer />
          <DrawingSteps />
          <DigitalArtCanvas />
        </main>
        <aside className="col-span-12 lg:col-span-4 lg:sticky top-22">
          <LessonSidebar />
        </aside>
      </div>
    </div>
  );
}
