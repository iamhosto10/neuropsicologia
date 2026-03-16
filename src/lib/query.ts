export const activitiesQuery = `
*[_type == "activity"] | order(_createdAt desc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  description,
  duration,
  ageRange,
  level,
  image {
    _type,
    asset->{
      _id,
      url
    }
  },
  video {
    file {
      asset->{
        _id,
        url
      }
    },
    url
  },
  materials,
  objectives,
  instructions,
  benefits,
  advice,
  relatedActivity[]->{
    _id,
    title,
    slug,
    level,
    image {
      asset->{
        _id,
        url
      }
    }
  }
}
`;

export const activitiesBySlugQuery = `
*[_type == "activity" && slug.current == $slug][0] {
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  description,
  duration,
  ageRange,
  level,

  image {
    _type,
    asset->{
      _id,
      url
    }
  },

  video {
    file {
      asset->{
        _id,
        url
      }
    },
    url
  },

  materials,
  objectives,
  instructions,
  benefits,
  advice,

  relatedActivity[]->{
    _id,
    title,
    slug,
    duration,
    ageRange,
    level,
    image {
      asset->{
        _id,
        url
      }
    }
  }
}
`;

export const coursesQuery = `
*[_type == "course"] | order(_createdAt desc) {
  _id,
  _type,
  _createdAt,
  _updatedAt,

  title,
  description,
  age,
  duration,
  level,

  slug {
    current
  },

  image {
    _type,
    asset->{
      _id,
      url
    }
  },

  video {
    file {
      asset->{
        _id,
        url
      }
    },
    url
  },

  objectives[],

  syllabus[] {
    title,
    lessons[]->{
      _id,
      title,
      slug {
        current
      },
    }
  }
}
`;

export const courseBySlugQuery = `
*[_type == "course" && slug.current == $slug][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,

  title,
  description,
  age,
  duration,
  level,

  slug {
    current
  },

  image {
    _type,
    asset->{
      _id,
      url
    }
  },

  video {
    file {
      asset->{
        _id,
        url
      }
    },
    url
  },

  objectives[],

  syllabus[] {
    title,
    lessons[]->{
      _id,
      title,
      slug {
        current
      },
    }
  },
  relatedCourse[]->{
    _id,
    title,
    slug,
    age,
    syllabus[] {
    title,
    lessons[]->{
      _id,
      title,
      slug {
        current
      },
    }
  },
    image {
      asset->{
        _id,
        url
      }
    }
  }
}
`;

export const getParentDashboardQuery = `
  *[_type == "kidProfile" && parent._ref == $parentSanityId]{
    _id,
    alias,
    avatarStatus,
    activeAvatar,
    energyCrystals,
    "latestSession": *[_type == "dailySession" && references(^._id)] | order(_createdAt desc)[0]{
      date,
      isCompleted,
      completedMissions,
      missions
    }
  }
`;

export const getAllMissionsQuery = `
  *[_type == "mission"]{
    _id,
    title,
    gameType,
    difficulty,
    timeLimit,
    energyReward
  }
`;

export const getAllCoursesQuery = `
  *[_type == "course"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    "imageUrl": image.asset->url,
    duration,
    level,
    "lessonsCount": count(lessons)
  }
`;

// Traer todas las Actividades
export const getAllActivitiesQuery = `
  *[_type == "activity"] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    "imageUrl": image.asset->url,
    ageRange,
    duration,
    category
  }
`;

export const getCourseBySlugQuery = `
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    "imageUrl": image.asset->url,
    duration,
    level,
    // Entramos al syllabus para buscar los módulos y sus lecciones referenciadas
    syllabus[]{
      title,
      lessons[]->{
        _id,
        title,
        "slug": slug.current
      }
    }
  }
`;

export const getCourseAndLessonQuery = `
  *[_type == "course" && slug.current == $courseSlug][0] {
    title,
    "courseSlug": slug.current,
    syllabus[]{
      title,
      lessons[]->{
        _id,
        title,
        "slug": slug.current
      }
    },
    // Sub-consulta para traer el contenido de la lección exacta que estamos viendo
    "currentLesson": *[_type == "lesson" && slug.current == $lessonSlug][0] {
      _id,
      title,
      content
    }
  }
`;

export const getActivityBySlugQuery = `
  *[_type == "activity" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    "imageUrl": image.asset->url,
    ageRange,
    duration,
    category,
    objectives,
    materials,
    instructions[]{
      step,
      description
    },
    videoUrl,
    "relatedActivities": *[_type == "activity" && category == ^.category && slug.current != ^.slug.current][0...3] {
      _id,
      title,
      "slug": slug.current,
      "imageUrl": image.asset->url,
      duration,
      category
    }
  }
`;
