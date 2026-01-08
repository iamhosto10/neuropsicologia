export type Course = {
  title: string;
  description: string;
  age: string;
  lessons: string;
  bgColor: string;
};

export type SanityCourse = {
  title: string;
  slug: string;
  description: string;
  age: string;
  bgColor: string;
  lessonsCount: number;
};

export type SanityLesson = {
  title: string;
  slug: string;
  duration: number;
  level: string;
  image: any; // Sanity Image object
};

export type SanityModule = {
  title: string;
  lessons: SanityLesson[];
};

export type SanityCourseDetail = SanityCourse & {
  syllabus: SanityModule[];
};

export type SanityActivity = {
  title: string;
  slug: string;
  description: string;
  duration: number;
  ageRange: string;
  level: string;
  image: any;
  video: string;
  materials: string[];
  objectives: string[];
};
