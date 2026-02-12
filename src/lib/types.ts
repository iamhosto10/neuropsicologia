export interface Activity {
  _id: string;
  _type: "activity";
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  duration?: number;
  ageRange?: string;
  level?: "Básico" | "Intermedio" | "Avanzado";
  image?: {
    asset: {
      url: string;
      _id: string;
    };
  };
  video?: {
    url: string;
    file: {
      asset: {
        url: string;
        _id: string;
      };
    };
  };
  materials?: string[];
  objectives?: string[];
  instructions?: {
    title: string;
    description: string;
    icon: "Smile" | "Hand" | "Eye";
  }[];
  benefits?: string;
  advice?: string;
  relatedActivity?: Activity[];
}
export interface Lesson {
  _id: string;
  _type: "lesson";
  _createdAt: string;
  _updatedAt: string;

  title: string;
  slug: {
    _type: "slug";
    current: string;
  };
}

export interface Course {
  _id: string;
  _type: "course";
  _createdAt: string;
  _updatedAt: string;

  title: string;
  slug: {
    current: string;
  };
  description?: string;

  age?: string;
  duration?: number;

  level?: "Básico" | "Intermedio" | "Avanzado";

  image?: {
    asset: {
      url: string;
      _id: string;
    };
  };
  video?: {
    url: string;
    file: {
      asset: {
        url: string;
        _id: string;
      };
    };
  };

  objectives?: string[];

  syllabus?: { title: string; lessons: Lesson[] }[];
  relatedCourse: Course[];
}
