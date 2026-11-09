// scripts/migrate-kid-defaults.mjs
// Normaliza los perfiles de cadete creados con versiones anteriores:
//   - avatarStatus fuera del esquema ("locked") -> "hungry" (valores válidos: happy | hungry | tired)
//   - unlockedAvatars ausente                    -> ["default-cadet"]
//   - activeAvatar ausente                       -> "default-cadet"
// NO toca cristales, avatares comprados, alias ni ningún otro dato.
//
// Uso (por defecto es SOLO LECTURA: muestra qué cambiaría):
//   node --env-file=.env.local scripts/migrate-kid-defaults.mjs            # vista previa (dry-run)
//   node --env-file=.env.local scripts/migrate-kid-defaults.mjs --apply    # aplica los cambios
//
// Idempotente: correrlo dos veces no cambia nada la segunda vez.
import { createClient } from "@sanity/client";

const APPLY = process.argv.includes("--apply");
const VALID_STATUS = ["happy", "hungry", "tired"];

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

export function planFor(kid) {
  const set = {};
  if (!VALID_STATUS.includes(kid.avatarStatus)) set.avatarStatus = "hungry";
  if (!Array.isArray(kid.unlockedAvatars) || kid.unlockedAvatars.length === 0) set.unlockedAvatars = ["default-cadet"];
  if (!kid.activeAvatar) set.activeAvatar = "default-cadet";
  return set;
}

const kids = await client.fetch(`*[_type == "kidProfile"]{_id, avatarStatus, unlockedAvatars, activeAvatar}`);
const plans = kids.map((k) => ({ id: k._id, set: planFor(k) })).filter((p) => Object.keys(p.set).length > 0);

console.log(`${kids.length} perfiles, ${plans.length} necesitan cambios (${APPLY ? "APLICANDO" : "vista previa, no se escribe nada"})`);
const byField = {};
for (const p of plans) for (const f of Object.keys(p.set)) byField[f] = (byField[f] ?? 0) + 1;
console.log("campos a normalizar:", byField);

if (APPLY && plans.length) {
  const tx = client.transaction();
  for (const p of plans) tx.patch(p.id, (patch) => patch.set(p.set));
  await tx.commit();
  console.log("listo.");
} else if (!APPLY && plans.length) {
  console.log("Para aplicar: agrega --apply");
}
