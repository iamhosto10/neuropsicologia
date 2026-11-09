import { beforeEach, describe, expect, it, vi } from "vitest";
import { clerk, freshWorld, state } from "./helpers/setup";
import { createKidProfile, deleteKidProfile, updateKidProfile } from "@/app/actions/profile.actions";
import { deleteKidCascade, deleteUserCascade, ensureSanityUser } from "@/lib/clerk-sync";
import type { FakeSanity } from "./helpers/fake-sanity";

let s: FakeSanity;
const form = (alias: string) => {
  const f = new FormData();
  f.set("alias", alias);
  return f;
};
const rethrowRedirect = async (p: Promise<any>) => {
  try {
    return await p;
  } catch (e: any) {
    if (String(e.message).startsWith("NEXT_REDIRECT")) return { redirected: e.message };
    throw e;
  }
};

beforeEach(() => {
  s = freshWorld();
  clerk.cookies.clear();
  // consultas de clerk-sync
  s.on(/references\(\$kidId\) && _id != \$kidId/, (p, st) =>
    Object.values(st.docs).filter((d: any) => d._id !== p.kidId && JSON.stringify(d).includes(`"_ref":"${p.kidId}"`)).map((d: any) => d._id),
  );
  s.on(/_type == "kidProfile" && parent\._ref == \$userId/, (p, st) =>
    Object.values(st.docs).filter((d: any) => d._type === "kidProfile" && d.parent?._ref === p.userId).map((d: any) => d._id),
  );
  s.on(/references\(\$kids\)/, (p, st) =>
    Object.values(st.docs).filter((d: any) => p.kids.some((k: string) => JSON.stringify(d).includes(`"_ref":"${k}"`))).map((d: any) => d._id),
  );
  s.seed({ _id: "user-user_1", _type: "user", clerkId: "user_1" });
  s.seed({ _id: "sess-a", _type: "dailySession", kidProfile: { _ref: "kid1" }, date: "2026-11-09" });
  s.seed({ _id: "sess-b", _type: "dailySession", kidProfile: { _ref: "kid1" }, date: "2026-11-10" });
});

describe("borrar un cadete", () => {
  it("con sesiones: ahora funciona y borra también sus sesiones (antes fallaba por referencias)", async () => {
    expect(await deleteKidProfile("kid1")).toEqual({ success: true });
    expect(s.docs.kid1).toBeUndefined();
    expect(s.docs["sess-a"]).toBeUndefined();
    expect(s.docs["sess-b"]).toBeUndefined();
    expect(s.docs["user-user_1"]).toBeDefined(); // el padre se queda
  });
  it("la regla de integridad del cliente falso rechaza el borrado SIN cascada (documenta el bug original)", async () => {
    await expect(s.transaction().delete("kid1").commit()).rejects.toThrow(/references/);
  });
  it("limpia la cookie del cadete activo", async () => {
    clerk.cookies.set("activeKidId", "kid1");
    await deleteKidProfile("kid1");
    expect(clerk.cookies.has("activeKidId")).toBe(false);
  });
  it("cadete ajeno: no borra nada", async () => {
    state.owned = false;
    expect(await deleteKidProfile("kid1")).toHaveProperty("error");
    expect(s.docs.kid1).toBeDefined();
    expect(s.docs["sess-a"]).toBeDefined();
  });
  it("deleteKidCascade solo borra lo que referencia a ese cadete", async () => {
    s.seed({ _id: "kid2", _type: "kidProfile", parent: { _ref: "user-user_1" } });
    s.seed({ _id: "sess-k2", _type: "dailySession", kidProfile: { _ref: "kid2" } });
    expect(await deleteKidCascade(s as any, "kid1")).toEqual({ deletedRelated: 2 });
    expect(s.docs.kid2).toBeDefined();
    expect(s.docs["sess-k2"]).toBeDefined();
  });
});

describe("crear cadete", () => {
  it("si el webhook nunca corrió (no existe el usuario en Sanity) igual se crea, y se crea el usuario", async () => {
    delete s.docs["user-user_1"];
    state.userId = "user_1";
    const r = await rethrowRedirect(createKidProfile(form("Leo")));
    expect(r).toEqual({ redirected: "NEXT_REDIRECT:/dashboard" });
    expect(s.docs["user-user_1"]).toMatchObject({ _type: "user", clerkId: "user_1", name: "Ana Pérez", email: "ana@example.com" });
    const kid: any = Object.values(s.docs).find((d: any) => d.alias === "Leo");
    expect(kid).toMatchObject({ parent: { _ref: "user-user_1" }, energyCrystals: 0, avatarStatus: "hungry", unlockedAvatars: ["default-cadet"], activeAvatar: "default-cadet" });
  });
  it("no pisa un usuario existente", async () => {
    s.docs["user-user_1"].name = "Nombre Manual";
    await rethrowRedirect(createKidProfile(form("Leo")));
    expect(s.docs["user-user_1"].name).toBe("Nombre Manual");
  });
  it("alias vacío o de más de 20 caracteres se rechaza en el servidor", async () => {
    expect(await createKidProfile(form("   "))).toHaveProperty("error");
    expect(await createKidProfile(form("x".repeat(21)))).toMatchObject({ error: expect.stringMatching(/20/) });
    expect(Object.values(s.docs).some((d: any) => d.alias === "x".repeat(21))).toBe(false);
  });
  it("sin sesión: error", async () => {
    state.userId = null;
    expect(await createKidProfile(form("Leo"))).toHaveProperty("error");
  });
  it("editar alias también valida el largo", async () => {
    expect(await updateKidProfile("kid1", form("x".repeat(30)))).toHaveProperty("error");
  });
});

describe("sincronización con Clerk", () => {
  it("ensureSanityUser es idempotente", async () => {
    await ensureSanityUser(s as any, { id: "user_9", firstName: "Luis", lastName: null, email: "l@x.com" });
    await ensureSanityUser(s as any, { id: "user_9", firstName: "Otro", lastName: null, email: "o@x.com" });
    expect(s.docs["user-user_9"].name).toBe("Luis");
  });
  it("user.deleted: borra usuario, cadetes y sesiones", async () => {
    s.seed({ _id: "kid-extra", _type: "kidProfile", parent: { _ref: "user-user_1" } });
    s.seed({ _id: "otro-user", _type: "user" });
    s.seed({ _id: "otro-kid", _type: "kidProfile", parent: { _ref: "otro-user" } });
    const r = await deleteUserCascade(s as any, "user_1");
    expect(r.deleted).toBe(5); // user + kid1 + kid-extra + 2 sesiones
    for (const id of ["user-user_1", "kid1", "kid-extra", "sess-a", "sess-b"]) expect(s.docs[id]).toBeUndefined();
    expect(s.docs["otro-user"]).toBeDefined();
    expect(s.docs["otro-kid"]).toBeDefined();
  });
});

// ---- webhook ----
const svix = vi.hoisted(() => ({ verify: vi.fn(), received: [] as any[] }));
vi.mock("svix", () => ({
  Webhook: class {
    verify(body: any, headers: any) {
      svix.received.push(body);
      return svix.verify(body, headers);
    }
  },
}));

describe("webhook de Clerk", () => {
  const call = async (body: string, secret: string | undefined = "whsec_test") => {
    if (secret) process.env.CLERK_WEBHOOK_SECRET = secret;
    else delete process.env.CLERK_WEBHOOK_SECRET;
    const { POST } = await import("@/app/api/webhooks/clerk/route");
    return POST(new Request("http://x/api/webhooks/clerk", { method: "POST", body }));
  };
  beforeEach(() => {
    svix.received.length = 0;
    svix.verify.mockReset();
  });

  it("verifica la firma con el cuerpo CRUDO (con tildes/espacios), no re-serializado", async () => {
    const raw = '{ "type":"user.created",  "data":{"id":"user_7","first_name":"Ñandú","last_name":"Gómez","email_addresses":[{"email_address":"n@x.com"}]} }';
    svix.verify.mockReturnValue(JSON.parse(raw));
    const res = await call(raw);
    expect(res.status).toBe(200);
    expect(svix.received[0]).toBe(raw);
    expect(s.docs["user-user_7"]).toMatchObject({ name: "Ñandú Gómez", email: "n@x.com" });
  });
  it("firma inválida: 400 y no escribe", async () => {
    svix.verify.mockImplementation(() => {
      throw new Error("bad sig");
    });
    const res = await call("{}");
    expect(res.status).toBe(400);
    expect(Object.keys(s.docs)).not.toContain("user-user_7");
  });
  it("sin secreto configurado: 500 controlado (no lanza excepción)", async () => {
    expect((await call("{}", "")).status).toBe(500);
  });
  it("user.deleted borra los datos del usuario", async () => {
    svix.verify.mockReturnValue({ type: "user.deleted", data: { id: "user_1", deleted: true } });
    expect((await call("{}")).status).toBe(200);
    expect(s.docs["user-user_1"]).toBeUndefined();
    expect(s.docs.kid1).toBeUndefined();
  });
});
