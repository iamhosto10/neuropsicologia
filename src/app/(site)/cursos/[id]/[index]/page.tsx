import { LessonViewV2 } from "@/components/lesson-detail-v2/lesson-view-v2";
import { LessonView } from "@/components/lesson-detail/lesson-view";

const page = () => {
  return (
    <>
      {/* esta sera la leccion estilo 1 */}
      <LessonView />
      {/* esta sera la leccion estilo 2 */}
      <LessonViewV2 />
    </>
  );
};

export default page;
