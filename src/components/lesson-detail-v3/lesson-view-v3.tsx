import EmpathyHeader from './empathy-header';
import ReflectionQuiz from './reflection-quiz';
import CardCreator from './card-creator';
import EmpathySidebar from './empathy-sidebar';

const LessonViewV3 = () => {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 items-start">

          {/* Main Content */}
          <main className="lg:col-span-8 w-full space-y-8">
            <EmpathyHeader />

            {/* Mock Video Player */}
            <div className="w-full aspect-video bg-gray-100 rounded-2xl flex items-center justify-center">
              <p className="text-gray-500 font-medium">Mock Video Player</p>
            </div>

            <ReflectionQuiz />
            <CardCreator />
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 w-full mt-8 lg:mt-0 lg:sticky lg:top-6">
            <EmpathySidebar />
          </aside>

        </div>
      </div>
    </div>
  );
};

export default LessonViewV3;
