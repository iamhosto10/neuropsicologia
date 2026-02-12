import { defineQuery } from "next-sanity";

// 1. Get all courses (for gallery/cards)
export const GET_COURSES = defineQuery(`
  *[_type == "course"] {
    title,
    "slug": slug.current,
    description,
    age,
    bgColor,
    "lessonsCount": count(syllabus[].lessons[])
  }
`);

// 2. Get single course by slug (with syllabus and activities expanded)
export const GET_COURSE_BY_SLUG = defineQuery(`
  *[_type == "course" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    description,
    age,
    bgColor,
    syllabus[]{
      title,
      lessons[]->{
        title,
        "slug": slug.current,
        duration,
        level,
        image
      }
    }
  }
`);

// 3. Get single activity by slug
export const GET_ACTIVITY_BY_SLUG = defineQuery(`
  *[_type == "activity" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    description,
    duration,
    ageRange,
    level,
    image,
    video,
    materials,
    objectives
  }
`);

// 4. Get User Profile with completed courses
export const GET_USER_PROFILE = defineQuery(`
  *[_type == "user" && slug.current == $slug][0] {
    name,
    "slug": slug.current,
    image,
    bio,
    completedCourses[]->{
      title,
      "slug": slug.current
    }
  }
`);
