import { CreativeHeader } from './creative-header';
import { DrawingSteps } from './drawing-steps';
import { DigitalArtCanvas } from './digital-art-canvas';
import { CreativeSidebar } from './creative-sidebar';

function MockVideoPlayer() {
  return (
    <div className="w-full aspect-video bg-slate-800 rounded-2xl flex items-center justify-center border">
      <p className="text-slate-400 font-medium">Mock Video Player</p>
    </div>
  );
}

export function LessonViewV2() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <main className="lg:col-span-8 space-y-8">
          <CreativeHeader />
          <MockVideoPlayer />
          <DrawingSteps />
          <DigitalArtCanvas />
        </main>
        <aside className="lg:col-span-4 lg:sticky lg:top-6">
          <CreativeSidebar />
        </aside>
      </div>
    </div>
  );
}
