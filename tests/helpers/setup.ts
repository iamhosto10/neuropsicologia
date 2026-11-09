import { vi } from "vitest";
import { createFake, type FakeSanity } from "./fake-sanity";

export const state = {
  fake: null as any,
  owned: true,
  activeKid: "kid1" as string | null,
  role: "admin" as string | null,
  userId: "user_1" as string | null,
};

export function freshWorld(): FakeSanity {
  const fake = createFake();
  state.fake = fake;
  state.owned = true;
  state.activeKid = "kid1";
  state.role = "admin";
  state.userId = "user_1";

  fake.seed({ _id: "kid1", _type: "kidProfile", energyCrystals: 0, parent: { _ref: "user-user_1" } });
  fake.seed({
    _id: "lesson1",
    _type: "lesson",
    content: [
      { _key: "q1", _type: "lessonQuestion", options: ["A", "B", "C"], correctOptionIndex: 1, reward: 10 },
      { _key: "o1", _type: "lessonOpenQuestion", reward: 15 },
    ],
  });
  fake.seed({ _id: "act1", _type: "activity" });
  fake.seed({
    _id: "course1",
    _type: "course",
    syllabus: [{ lessons: [{ _ref: "lesson1" }] }],
  });
  fake.seed({ _id: "av-cheap", _type: "storeAvatar", slug: { current: "cheap" }, price: 20 });
  fake.seed({ _id: "av-pricey", _type: "storeAvatar", slug: { current: "pricey" }, price: 80 });

  fake
    .on(/_type == "kidProfile" && _id == \$kidId\]\[0\]/, (p, s) => s.docs[p.kidId] ?? null)
    .on(/lessonQuestion/, (p, s) => s.docs[p.lessonId]?.content?.find((b: any) => b._key === p.blockKey && b._type === "lessonQuestion") ?? null)
    .on(/lessonOpenQuestion/, (p, s) => s.docs[p.lessonId]?.content?.find((b: any) => b._key === p.blockKey && b._type === "lessonOpenQuestion") ?? null)
    .on(/count\(\*\[_type == "activity"/, (p, s) => s.docs[p.activityId]?._type === "activity")
    .on(/count\(\*\[_type == "lesson"/, (p, s) => s.docs[p.lessonId]?._type === "lesson")
    .on(/_type == "course"/, (p, s) => Object.values(s.docs).find((d: any) => d._type === "course" && d.syllabus?.some((m: any) => m.lessons?.some((l: any) => l._ref === p.lessonId))) ?? null)
    .on(/storeAvatar/, (p, s) => Object.values(s.docs).find((d: any) => d._type === "storeAvatar" && d.slug.current === p.itemId)?.price ?? null)
    .on(/_type == "dailySession"/, (p, s) =>
      Object.values(s.docs).find((d: any) => d._type === "dailySession" && d.kidProfile?._ref === p.kidId && d.missions?.some((m: any) => m._key === p.missionKey)) ?? null,
    );
  return fake;
}

vi.mock("@/sanity/lib/client", () => ({
  client: { withConfig: () => state.fake },
  writeClient: new Proxy({}, { get: (_, k) => (state.fake as any)[k]?.bind?.(state.fake) ?? (state.fake as any)[k] }),
}));
vi.mock("@/lib/auth-guards", () => ({
  isKidOwnedByCurrentUser: async () => state.owned,
  getOwnedActiveKidId: async () => (state.owned ? state.activeKid : null),
  canEditContent: async () => state.role === "admin" || state.role === "therapist",
  requireContentEditor: async () =>
    state.role === "admin" || state.role === "therapist"
      ? null
      : { success: false, error: "No tienes permiso para editar el contenido de la Academia." },
  getParentSanityId: async () => (state.userId ? `user-${state.userId}` : null),
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {}, revalidateTag: () => {} }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
}));
