import { activity } from "./activity";
import { course } from "./course";
import { user } from "./user";
import { lesson } from "./lesson";
import { gameModule } from "./gameModule";
import { kidProfile } from "./kidProfile";
import { mission } from "./mission";
import { dailySession } from "./dailySession";
import { storeAvatar } from "./storeAvatar";
import { lessonQuestion } from "./lessonQuestion";
import { lessonOpenQuestion } from "./lessonOpenQuestion";
import { lessonAudio } from "./lessonAudio";

export const schema = {
  types: [
    activity,
    course,
    user,
    lesson,
    gameModule,
    kidProfile,
    mission,
    dailySession,
    storeAvatar,
    lessonQuestion,
    lessonOpenQuestion,
    lessonAudio,
  ],
};
