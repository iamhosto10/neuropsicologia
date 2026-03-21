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

export const GET_LESSON_BY_SLUG = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    content[]{
      ...,
      _type == "image" => {
        asset->
      },
      _type == "gameModule" => {
        _key,
        _type,
        gameType,
        title,
        instruction,
        difficulty,
        duration,
        targetObject,
        distractorObjects[]
      }
    }
  }
`);

export const getKidDashboardQuery = `
  *[_type == "kidProfile" && _id == $kidId][0]{
    _id,
    alias,
    energyCrystals,
    avatarStatus,
    unlockedAvatars,
    activeAvatar,
    "activeAvatarDetails": *[_type == "storeAvatar" && slug.current == ^.activeAvatar][0]{
      title,
      "imageUrl": image.asset->url
    },
    "todaySession": *[_type == "dailySession" && references(^._id) && date == $todayDate][0]{
      _id,
      isCompleted,
      completedMissions,
      missions[]->{
        _id,
        title,
        gameType,
        difficulty,
        energyReward
      }
    }
  }
`;

export const getKidsByParentQuery = `
  *[_type == "kidProfile" && parent._ref == $parentSanityId]{
    _id,
    alias,
    avatarStatus,
    activeAvatar,
    energyCrystals
  }
`;

export const getKidClinicalReportQuery = `
  *[_type == "kidProfile" && _id == $kidId && parent._ref == $parentSanityId][0]{
    _id,
    alias,
    energyCrystals,
    "sessionsHistory": *[_type == "dailySession" && references(^._id)] | order(date desc)[0...7]{
      _id,
      date,
      isCompleted,
      "assignedCount": count(missions),
      "completedCount": count(completedMissions),
      telemetryData
    }
  }
`;
