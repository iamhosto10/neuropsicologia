import { beforeEach, describe, expect, it } from "vitest";
import { freshWorld, state } from "./helpers/setup";
import { submitQuizAnswer } from "@/app/actions/quiz.actions";
import { submitOpenAnswer } from "@/app/actions/open-question.actions";
import { markActivityCompleted } from "@/app/actions/activity.actions";
import { markLessonCompleted } from "@/app/actions/course.actions";
import type { FakeSanity } from "./helpers/fake-sanity";

let s: FakeSanity;
const kid = () => s.docs.kid1;
beforeEach(() => {
  s = freshWorld();
});

describe("quiz: historial + recompensa calculados en el servidor", () => {
  it("respuesta incorrecta: guarda historial y NO da cristales", async () => {
    await submitQuizAnswer("lesson1", true /* mentira del cliente */, 9999, "/x", "A", "q1");
    expect(kid().energyCrystals).toBe(0);
    expect(kid().academicTelemetry).toHaveLength(1);
    expect(kid().academicTelemetry[0]).toMatchObject({ isCorrect: false, selected: "A" });
    expect(kid().completedQuizzes ?? []).toHaveLength(0);
  });

  it("respuesta correcta: guarda historial Y completedQuizzes Y la recompensa del bloque (no la del cliente)", async () => {
    await submitQuizAnswer("lesson1", false /* mentira */, 9999, "/x", "B", "q1");
    expect(kid().energyCrystals).toBe(10);
    expect(kid().completedQuizzes).toEqual(["lesson1-q1"]);
    expect(kid().academicTelemetry).toHaveLength(1); // regresión: antes se perdía
    expect(kid().academicTelemetry[0].isCorrect).toBe(true);
  });

  it("repetir la respuesta correcta no suma dos veces pero sí registra el intento", async () => {
    await submitQuizAnswer("lesson1", true, 10, "/x", "B", "q1");
    await submitQuizAnswer("lesson1", true, 10, "/x", "B", "q1");
    expect(kid().energyCrystals).toBe(10);
    expect(kid().completedQuizzes).toHaveLength(1);
    expect(kid().academicTelemetry).toHaveLength(2);
  });

  it("si otra petición modificó al niño a la vez (409) reintenta y premia UNA sola vez", async () => {
    let first = true;
    s.beforeCommit = () => {
      if (first) {
        first = false;
        s.touch("kid1");
      }
    };
    const r = await submitQuizAnswer("lesson1", true, 10, "/x", "B", "q1");
    expect(r).toMatchObject({ success: true });
    expect(kid().energyCrystals).toBe(10);
    expect(s.commits).toBe(2);
  });

  it("bloque inexistente, id inseguro o sin cadete activo: error y nada cambia", async () => {
    expect(await submitQuizAnswer("lesson1", true, 10, "/x", "B", "no-existe")).toHaveProperty("error");
    expect(await submitQuizAnswer('x"] || true', true, 10, "/x", "B", "q1")).toHaveProperty("error");
    state.activeKid = null;
    expect(await submitQuizAnswer("lesson1", true, 10, "/x", "B", "q1")).toHaveProperty("error");
    expect(kid().energyCrystals).toBe(0);
    expect(kid().academicTelemetry).toBeUndefined();
  });

  it("cadete que no es del usuario: no se escribe", async () => {
    state.owned = false;
    await submitQuizAnswer("lesson1", true, 10, "/x", "B", "q1");
    expect(kid().energyCrystals).toBe(0);
  });
});

describe("pregunta abierta", () => {
  it("guarda el texto Y completedOpenQuestions Y la recompensa del bloque (regresión: antes se perdía el texto)", async () => {
    await submitOpenAnswer("lesson1", "mi respuesta", 9999, "/x", "o1");
    expect(kid().energyCrystals).toBe(15);
    expect(kid().completedOpenQuestions).toEqual(["lesson1-o1"]);
    expect(kid().academicTelemetry).toHaveLength(1);
    expect(kid().academicTelemetry[0].responseText).toBe("mi respuesta");
  });
  it("la segunda vez no premia pero guarda el texto; el texto se recorta a 2000", async () => {
    await submitOpenAnswer("lesson1", "uno", 1, "/x", "o1");
    await submitOpenAnswer("lesson1", "x".repeat(5000), 1, "/x", "o1");
    expect(kid().energyCrystals).toBe(15);
    expect(kid().academicTelemetry[1].responseText).toHaveLength(2000);
  });
  it("una pregunta de quiz no se puede usar como abierta", async () => {
    expect(await submitOpenAnswer("lesson1", "hola", 5, "/x", "q1")).toHaveProperty("error");
    expect(kid().energyCrystals).toBe(0);
  });
});

describe("actividades", () => {
  it("guarda completedActivities Y activityLog Y suma 20 (regresión: antes quedaba completedActivities vacío)", async () => {
    await markActivityCompleted("kid1", "act1", "/a", { mood: "feliz", difficulty: 2 });
    expect(kid().completedActivities).toEqual(["act1"]);
    expect(kid().activityLog).toHaveLength(1);
    expect(kid().energyCrystals).toBe(20);
  });
  it("completar la MISMA actividad otra vez no da cristales (no se puede farmear)", async () => {
    for (let i = 0; i < 5; i++) await markActivityCompleted("kid1", "act1", "/a", { mood: "feliz", difficulty: 2 });
    expect(kid().energyCrystals).toBe(20);
    expect(kid().activityLog).toHaveLength(1);
  });
  it("un id inventado no da cristales", async () => {
    const r = await markActivityCompleted("kid1", "inventada", "/a");
    expect(r).toHaveProperty("error");
    expect(kid().energyCrystals).toBe(0);
  });
  it("id con comillas (inyección en la ruta del patch) se rechaza", async () => {
    expect(await markActivityCompleted("kid1", 'x"] || _ref != "', "/a")).toHaveProperty("error");
  });
  it("quita la actividad de las asignadas y normaliza la reflexión", async () => {
    s.docs.kid1.assignedActivities = [{ _ref: "act1" }, { _ref: "otra" }];
    await markActivityCompleted("kid1", "act1", "/a", { mood: "x".repeat(100), difficulty: 99 });
    expect(kid().assignedActivities).toEqual([{ _ref: "otra" }]);
    expect(kid().activityLog[0].reflection.difficulty).toBe(5);
    expect(kid().activityLog[0].reflection.mood).toHaveLength(30);
  });
  it("sin reflexión también marca completada", async () => {
    await markActivityCompleted("kid1", "act1", "/a");
    expect(kid().completedActivities).toEqual(["act1"]);
    expect(kid().activityLog ?? []).toHaveLength(0);
  });
  it("tres envíos simultáneos con conflicto: una sola recompensa", async () => {
    let n = 0;
    s.beforeCommit = () => {
      if (n++ < 2) s.touch("kid1");
    };
    await markActivityCompleted("kid1", "act1", "/a", { mood: "feliz", difficulty: 1 });
    expect(kid().energyCrystals).toBe(20);
  });
});

describe("lecciones", () => {
  it("suma 10 una vez y quita el curso de las asignadas", async () => {
    s.docs.kid1.assignedCourses = [{ _ref: "course1" }];
    await markLessonCompleted("kid1", "lesson1", "/c");
    await markLessonCompleted("kid1", "lesson1", "/c");
    expect(kid().energyCrystals).toBe(10);
    expect(kid().completedLessons).toEqual(["lesson1"]);
    expect(kid().assignedCourses).toEqual([]);
  });
  it("ids inventados no dan cristales (antes 5 ids falsos = +50)", async () => {
    for (let i = 0; i < 5; i++) await markLessonCompleted("kid1", `fake-${i}`, "/c");
    expect(kid().energyCrystals).toBe(0);
    expect(kid().completedLessons ?? []).toHaveLength(0);
  });
});
