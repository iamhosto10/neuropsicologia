import { LessonViewV2 } from "@/components/lesson-detail-v2/lesson-view-v2";
import LessonViewV3 from "@/components/lesson-detail-v3/lesson-view-v3";
import { LessonView } from "@/components/lesson-detail/lesson-view";

const page = () => {
  return (
    <>
      {/* esta sera la leccion estilo 1 */}
      <LessonView />
      {/* esta sera la leccion estilo 2 */}
      {/* <LessonViewV2 /> */}
      {/* <LessonViewV3 /> */}
    </>
  );
};

export default page;
