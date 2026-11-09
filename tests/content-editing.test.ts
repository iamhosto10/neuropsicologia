import { beforeEach, describe, expect, it } from "vitest";
import { freshWorld, state } from "./helpers/setup";
import {
  createCourseAction,
  createLessonAction,
  deleteLessonAction,
  getLessonForEditAction,
  updateCourseMetadataAction,
  updateLessonAction,
  uploadAssetAction,
} from "@/app/actions/builder.actions";
import {
  isContentEditor,
  parseAllowList,
  validateImageFile,
  validateTtsBlocks,
  UPLOAD_MAX_BYTES,
} from "@/lib/content-roles";

beforeEach(() => {
  freshWorld();
});

const form = (o: Record<string, string> = {}) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};

describe("solo editores de contenido pueden tocar el catálogo global", () => {
  for (const role of [null, "free", "parent", undefined]) {
    it(`rol ${String(role)}: TODAS las acciones del constructor devuelven 'sin permiso' y no escriben nada`, async () => {
      state.role = role as any;
      const results = await Promise.all([
        createCourseAction(form({ title: "Hackeado" })),
        createLessonAction("course1", "Modulo", form({ lessonTitle: "x" })),
        getLessonForEditAction("lesson1"),
        updateLessonAction("lesson1", "course1", form({ lessonTitle: "x" })),
        updateCourseMetadataAction("course1", form({ title: "x" })),
        deleteLessonAction("course1", "lesson1"),
        uploadAssetAction(form()),
      ]);
      for (const r of results) {
        expect(r).toMatchObject({ success: false });
        expect((r as any).error).toMatch(/permiso/i);
      }
      expect(state.fake.commits).toBe(0);
      expect(Object.keys(state.fake.docs).sort()).toEqual(
        ["act1", "av-cheap", "av-pricey", "course1", "kid1", "lesson1"],
      );
    });
  }
});

describe("reglas de rol", () => {
  it("admin y therapist sí; free no; la lista de ids permitidos también", () => {
    expect(isContentEditor({ userId: "u", role: "admin" })).toBe(true);
    expect(isContentEditor({ userId: "u", role: "therapist" })).toBe(true);
    expect(isContentEditor({ userId: "u", role: "free" })).toBe(false);
    expect(isContentEditor({ userId: "u", role: { role: "admin" } })).toBe(false);
    expect(isContentEditor({ userId: null, role: "admin" })).toBe(false);
    expect(isContentEditor({ userId: "u", allowList: ["a", "u"] })).toBe(true);
    expect(isContentEditor({ userId: "u", allowList: [] })).toBe(false);
    expect(parseAllowList(" a, b ,,c ")).toEqual(["a", "b", "c"]);
    expect(parseAllowList(undefined)).toEqual([]);
  });
});

describe("límites de subida y de voz (costo/abuso)", () => {
  it("imágenes: solo tipos permitidos y máx. 5 MB", () => {
    expect(validateImageFile({ size: 100, type: "image/png" })).toBeNull();
    expect(validateImageFile({ size: 0, type: "x" })).toBeNull(); // sin archivo = opcional
    expect(validateImageFile({ size: 100, type: "application/pdf" })).toMatch(/Formato/);
    expect(validateImageFile({ size: 100, type: "image/svg+xml" })).toMatch(/Formato/);
    expect(validateImageFile({ size: UPLOAD_MAX_BYTES + 1, type: "image/png" })).toMatch(/5 MB/);
  });
  it("audio TTS: límites por guion, por lección y cantidad", () => {
    const a = (n: number) => ({ type: "lessonAudio", scriptText: "x".repeat(n) });
    expect(validateTtsBlocks([a(100), a(100)])).toBeNull();
    expect(validateTtsBlocks([a(8001)])).toMatch(/8000/);
    expect(validateTtsBlocks(Array.from({ length: 7 }, () => a(10)))).toMatch(/Máximo/);
    expect(validateTtsBlocks([a(7000), a(7000), a(7000)])).toMatch(/total/);
    expect(validateTtsBlocks([{ type: "text", scriptText: "x".repeat(99999) }])).toBeNull();
  });
  it("uploadAssetAction rechaza un PDF aunque el usuario sea editor", async () => {
    state.role = "admin";
    const f = new FormData();
    f.set("file", new File(["%PDF"], "a.pdf", { type: "application/pdf" }));
    expect(await uploadAssetAction(f)).toMatchObject({ success: false, error: expect.stringMatching(/Formato/) });
  });
});
