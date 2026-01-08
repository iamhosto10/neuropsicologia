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
