// scripts/seed-avatars.mjs
// Crea avatares de prueba para el Bazar Espacial: genera una imagen SVG
// llamativa por avatar, la sube a Sanity y crea el documento storeAvatar.
//
// Uso:
//   node --env-file=.env.local scripts/seed-avatars.mjs          # crear / actualizar
//   node --env-file=.env.local scripts/seed-avatars.mjs --clean  # borrar
//
// Idempotente: ids fijos (demo-avatar-<slug>). Si cambias un emoji o un
// color, vuelve a correrlo y la imagen se reemplaza.
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

// El emoji también se usa en src/lib/utils.ts (AVATAR_MAP) para la
// pantalla "¿Quién juega hoy?"; si agregas uno, agrégalo allá también.
const AVATARS = [
  { slug: "piloto-cohete", title: "Piloto Cohete", emoji: "🚀", category: "suit", price: 80,
    description: "Traje de piloto con propulsores de colores.", colors: ["#06b6d4", "#1e3a8a"] },
  { slug: "alien-amigo", title: "Alien Amigo", emoji: "👽", category: "pet", price: 150,
    description: "Un compañero verde que siempre te acompaña.", colors: ["#22c55e", "#064e3b"] },
  { slug: "robot-r2", title: "Robot R-2", emoji: "🤖", category: "suit", price: 250,
    description: "Armadura robótica a prueba de asteroides.", colors: ["#a855f7", "#312e81"] },
  { slug: "gato-astronauta", title: "Gato Astronauta", emoji: "🐱", category: "pet", price: 350,
    description: "El felino más valiente de la galaxia.", colors: ["#f97316", "#7c2d12"] },
  { slug: "unicornio-galactico", title: "Unicornio Galáctico", emoji: "🦄", category: "pet", price: 600,
    description: "Viaja por el arcoíris del hiperespacio.", colors: ["#ec4899", "#4c1d95"] },
  { slug: "dragon-estelar", title: "Dragón Estelar", emoji: "🐉", category: "suit", price: 1200,
    description: "Escamas de estrella y fuego de nebulosa.", colors: ["#ef4444", "#450a0a"] },
  { slug: "corona-comandante", title: "Corona de Comandante", emoji: "👑", category: "helmet", price: 3000,
    description: "Solo para los cadetes más constantes.", colors: ["#facc15", "#713f12"] },
];

// PRNG con semilla para que las estrellas salgan igual en cada corrida
function rng(seedText) {
  let s = [...seedText].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function buildSvg({ slug, emoji, colors: [light, dark] }) {
  const r = rng(slug);
  const stars = Array.from({ length: 28 }, () => {
    const x = (r() * 500).toFixed(1);
    const y = (r() * 500).toFixed(1);
    const size = (0.8 + r() * 2.4).toFixed(1);
    const op = (0.4 + r() * 0.6).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${size}" fill="#fff" opacity="${op}"/>`;
  }).join("");
  const sparkles = Array.from({ length: 4 }, () => {
    const x = 60 + r() * 380;
    const y = 60 + r() * 380;
    const s = 8 + r() * 10;
    return `<path d="M${x} ${y - s} L${x + s * 0.25} ${y - s * 0.25} L${x + s} ${y} L${x + s * 0.25} ${y + s * 0.25} L${x} ${y + s} L${x - s * 0.25} ${y + s * 0.25} L${x - s} ${y} L${x - s * 0.25} ${y - s * 0.25} Z" fill="#fff" opacity="0.9"/>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${light}" stop-opacity="0.2"/>
    </linearGradient>
  </defs>
  <rect width="500" height="500" fill="url(#bg)"/>
  ${stars}
  <ellipse cx="250" cy="420" rx="210" ry="60" fill="${dark}" opacity="0.55"/>
  <circle cx="250" cy="245" r="170" fill="url(#glow)"/>
  <ellipse cx="250" cy="255" rx="200" ry="58" fill="none" stroke="url(#ring)" stroke-width="10" transform="rotate(-18 250 255)"/>
  <text x="250" y="300" font-size="210" text-anchor="middle" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text>
  ${sparkles}
</svg>`;
}

async function clean() {
  const ids = AVATARS.map((a) => `demo-avatar-${a.slug}`);
  const tx = client.transaction();
  ids.forEach((id) => tx.delete(id));
  await tx.commit();
  console.log(`🧹 Borrados ${ids.length} avatares de demo.`);
}

async function seed() {
  for (const avatar of AVATARS) {
    const asset = await client.assets.upload("image", Buffer.from(buildSvg(avatar)), {
      filename: `avatar-${avatar.slug}.svg`,
      contentType: "image/svg+xml",
    });
    await client.createOrReplace({
      _id: `demo-avatar-${avatar.slug}`,
      _type: "storeAvatar",
      title: avatar.title,
      slug: { _type: "slug", current: avatar.slug },
      description: avatar.description,
      price: avatar.price,
      category: avatar.category,
      isDefault: false,
      image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
    });
    console.log(`✅ ${avatar.emoji} ${avatar.title} — ${avatar.price} cristales`);
  }
}

(process.argv.includes("--clean") ? clean() : seed()).catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
