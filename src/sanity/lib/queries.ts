import { defineQuery } from "next-sanity";
import { groq } from "next-sanity";

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

export const GET_USER_BY_CLERK_ID = groq`
  *[_type == "user" && clerkId == $clerkId][0] {
    _id,
    name,
    email,
    image,
    role,
    "completedCourses": completedCourses[]->{
      title,
      slug
    }
  }
`;
