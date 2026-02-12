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
