// scripts/seed-demo.mjs
// Crea datos de demo para un cadete: 2 semanas de sesiones con telemetría
// realista (mejora progresiva), misiones pendientes para hoy, cristales y
// bitácora de actividades.
//
// Uso:
//   node --env-file=.env.local scripts/seed-demo.mjs <kidId>          # crear / actualizar
//   node --env-file=.env.local scripts/seed-demo.mjs <kidId> --clean  # borrar lo de demo
//
// Es idempotente: los documentos de demo usan ids fijos (demo-session-...),
// así que correrlo dos veces deja lo mismo. Nunca toca sesiones reales de
// días pasados; la sesión real de HOY sí se reinicia (misiones pendientes)
// para poder jugarla en vivo, conservando su telemetría.
import { createClient } from "@sanity/client";

const kidId = process.argv[2];
const CLEAN = process.argv.includes("--clean");
if (!kidId || kidId.startsWith("--")) {
  console.error("Uso: node --env-file=.env.local scripts/seed-demo.mjs <kidId> [--clean]");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const TIME_ZONE = process.env.NEXT_PUBLIC_APP_TIME_ZONE || "America/Bogota";
const DEMO_PREFIX = `demo-session-${kidId}-`;

// ---------- Utilidades ----------

// PRNG con semilla: mismos datos en cada corrida
let prngState = 42;
const rand = () => {
  prngState = (prngState * 1664525 + 1013904223) % 4294967296;
  return prngState / 4294967296;
};
const noise = (amp) => (rand() * 2 - 1) * amp;
const lerp = (from, to, p, amp = 0) => from + (to - from) * p + noise(amp);
const int = (x) => Math.max(0, Math.round(x));
const pct = (x) => Math.min(100, Math.max(0, Math.round(x)));

function todayYmd() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
function addDays(ymd, days) {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---------- Catálogo (mismos gameType que CLINICAL_DICTIONARY) ----------

const GAMES = {
  asteroids_go_nogo: "Campo de Asteroides",
  cargo_n_back: "Laboratorio de Carga",
  nebula_storm: "Tormenta de Nebulosa",
  signal_decoder: "Decodificador de Señales",
  simon_says_reverse: "Panel de Seguridad",
  satellite_tracker: "Rastreador de Satélites",
  space_cleanup: "Limpieza Espacial",
  multitask_evasion: "Gran Evasión",
  reverse_communicator: "Comunicador Inverso",
  navigation: "Ruta de Navegación",
  warp_drive: "Propulsores Warp",
  star_docking: "Acoplamiento Estelar",
  hull_disassembly: "Desensamblaje del Casco",
  water_sort: "Laboratorio de Fluidos",
};

// Telemetría con la misma forma que guarda cada motor (src/hooks/use*Engine.ts).
// p va de 0 (sesión más antigua) a 1 (más reciente): el niño mejora con el tiempo.
const TELEMETRY = {
  asteroids_go_nogo: (p) => {
    const commissionErrors = int(lerp(5, 1, p, 1));
    const omissionErrors = int(lerp(4, 1, p, 1));
    const correctHits = 28 - omissionErrors;
    return {
      finalScore: correctHits * 10,
      maxCombo: int(lerp(6, 14, p, 2)),
      totalStimuli: 40,
      correctHits,
      correctRejections: 12 - commissionErrors,
      commissionErrors,
      omissionErrors,
      avgReactionTimeMs: int(lerp(620, 450, p, 30)),
    };
  },
  cargo_n_back: (p) => {
    const truePositives = int(lerp(5, 8, p, 1));
    const falsePositives = int(lerp(5, 2, p, 1));
    return {
      finalScore: truePositives * 15,
      totalStimuli: 30,
      truePositives,
      trueNegatives: 21 - falsePositives,
      falsePositives,
      falseNegatives: 9 - truePositives,
      avgReactionTimeMs: int(lerp(1100, 800, p, 60)),
    };
  },
  nebula_storm: (p) => ({
    finalScore: int(lerp(180, 290, p, 15)),
    totalTrials: 30,
    omissions: int(lerp(4, 1, p, 1)),
    accuracyCongruentPercent: pct(lerp(85, 96, p, 3)),
    accuracyIncongruentPercent: pct(lerp(64, 86, p, 4)),
    avgReactionTimeCongruentMs: int(lerp(700, 560, p, 30)),
    avgReactionTimeIncongruentMs: int(lerp(860, 680, p, 35)),
  }),
  signal_decoder: (p) => {
    const totalAttempts = int(lerp(18, 28, p, 2));
    const accuracyPercent = pct(lerp(72, 92, p, 3));
    const correctMatches = Math.round((totalAttempts * accuracyPercent) / 100);
    return {
      finalScore: correctMatches * 10,
      totalAttempts,
      correctMatches,
      incorrectMatches: totalAttempts - correctMatches,
      accuracyPercent,
      avgReactionTimeMs: int(lerp(2100, 1500, p, 90)),
    };
  },
  simon_says_reverse: (p) => ({
    finalScore: int(lerp(120, 240, p, 15)),
    highestLevelReached: int(lerp(4, 7, p, 0.5)),
    totalRounds: 10,
    maxSequenceDirect: int(lerp(4, 6, p, 0.4)),
    maxSequenceReverse: int(lerp(3, 5, p, 0.4)),
    accuracyDirectPercent: pct(lerp(75, 92, p, 3)),
    accuracyReversePercent: pct(lerp(58, 82, p, 4)),
  }),
  satellite_tracker: (p) => ({
    durationSeconds: 60,
    finalScore: int(lerp(300, 520, p, 25)),
    criticalEventsTriggered: 8,
    criticalEventsCaught: Math.min(8, int(lerp(5, 7, p, 0.6))),
    falsePositives: int(lerp(6, 2, p, 1)),
    averageReactionTimeMs: int(lerp(900, 620, p, 40)),
    timeOnTargetPercentage: pct(lerp(55, 82, p, 4)),
  }),
  space_cleanup: (p) => {
    const correctClicks = int(lerp(20, 32, p, 2));
    const incorrectClicks = int(lerp(7, 2, p, 1));
    return {
      durationSeconds: 60,
      finalScore: correctClicks * 10,
      finalEnergy: int(lerp(40, 85, p, 6)),
      correctClicks,
      incorrectClicks,
      missedTargets: int(lerp(6, 2, p, 1)),
      accuracyPercent: pct((correctClicks / (correctClicks + incorrectClicks)) * 100),
      result: "win",
    };
  },
  multitask_evasion: (p) => ({
    finalScore: int(lerp(150, 320, p, 20)),
    survivalTimeSeconds: 60,
    healthRemaining: int(lerp(1, 3, p, 0.4)),
    wallsHit: int(lerp(6, 2, p, 1)),
    correctNumbersCaught: int(lerp(8, 15, p, 1)),
    incorrectNumbersCaught: int(lerp(4, 1, p, 0.8)),
    targetRule: rand() > 0.5 ? "even" : "odd",
  }),
  reverse_communicator: (p) => ({
    finalScore: int(lerp(140, 260, p, 15)),
    maxCombo: int(lerp(4, 10, p, 1)),
    totalAttempts: 24,
    totalOmissions: int(lerp(4, 1, p, 1)),
    accuracyDirectPercent: pct(lerp(85, 95, p, 3)),
    accuracyReversePercent: pct(lerp(60, 84, p, 4)),
    avgReactionTimeDirectMs: int(lerp(700, 550, p, 30)),
    avgReactionTimeReverseMs: int(lerp(980, 720, p, 40)),
  }),
  navigation: (p) => ({
    finalScore: int(lerp(200, 380, p, 20)),
    levelsCompleted: int(lerp(3, 6, p, 0.5)),
    totalCrashes: int(lerp(5, 1, p, 1)),
    totalCorrections: int(lerp(6, 2, p, 1)),
    avgPlanningTimeMs: int(lerp(5200, 3400, p, 200)),
    efficiencyScore: pct(lerp(64, 88, p, 3)),
  }),
  warp_drive: (p) => {
    const totalEquations = int(lerp(14, 22, p, 1.5));
    const accuracyRate = pct(lerp(68, 90, p, 3));
    const correctAnswers = Math.round((totalEquations * accuracyRate) / 100);
    return {
      totalEquations,
      correctAnswers,
      errorCount: totalEquations - correctAnswers,
      maxStreak: int(lerp(4, 9, p, 1)),
      avgReactionTimeMs: int(lerp(3400, 2400, p, 150)),
      accuracyRate,
    };
  },
  star_docking: (p) => {
    const totalAttempts = int(lerp(10, 16, p, 1));
    const successfulDocks = Math.round(totalAttempts * lerp(0.6, 0.87, p, 0.04));
    return {
      totalAttempts,
      successfulDocks,
      failedDocks: totalAttempts - successfulDocks,
      averageErrorMargin: int(lerp(14, 5, p, 1.5)),
      averageDecisionTime: int(lerp(2600, 1700, p, 120)),
    };
  },
  hull_disassembly: (p) => ({
    totalMoves: int(lerp(30, 44, p, 3)),
    stagesCompleted: int(lerp(2, 5, p, 0.5)),
    invalidMoves: int(lerp(8, 2, p, 1)),
    averageTimePerMoveMs: int(lerp(3200, 2200, p, 150)),
  }),
  water_sort: (p) => ({
    totalMoves: int(lerp(28, 40, p, 3)),
    invalidPours: int(lerp(7, 2, p, 1)),
    undosUsed: int(lerp(3, 2, p, 0.6)),
    stagesCompleted: int(lerp(2, 5, p, 0.5)),
    averageDecisionTimeMs: int(lerp(3000, 2100, p, 120)),
  }),
};

// ---------- Plan de sesiones ----------

// Días atrás con sesión (huecos realistas) y cuántas misiones completó.
const PAST_SESSIONS = [
  { daysAgo: 14, done: 3 },
  { daysAgo: 13, done: 3 },
  { daysAgo: 12, done: 3 },
  { daysAgo: 10, done: 1 },
  { daysAgo: 9, done: 3 },
  { daysAgo: 8, done: 3 },
  { daysAgo: 7, done: 3 },
  { daysAgo: 6, done: 2 },
  { daysAgo: 5, done: 3 },
  { daysAgo: 3, done: 3 },
  { daysAgo: 2, done: 3 },
  { daysAgo: 1, done: 3 },
];
const GAME_ORDER = Object.keys(GAMES);
const TODAY_GAMES = ["water_sort", "star_docking", "asteroids_go_nogo"];
const REWARD = 50;
const DEMO_ACTIVITY_KEYS = [0, 1, 2].map((j) => `demo-activity-${j}`);
const unsetDemoActivities = DEMO_ACTIVITY_KEYS.map((k) => `activityLog[_key=="${k}"]`);

function buildMission(gameType, key, difficulty, timeLimit) {
  return {
    _key: key,
    _type: "missionConfig",
    gameType,
    title: GAMES[gameType],
    difficulty,
    timeLimit,
    energyReward: REWARD,
  };
}

// ---------- Main ----------

async function clean() {
  const ids = await client.fetch(
    `*[_type == "dailySession" && _id match $prefix]._id`,
    { prefix: `${DEMO_PREFIX}*` },
  );
  const tx = client.transaction();
  ids.forEach((id) => tx.delete(id));
  tx.patch(kidId, (p) => p.unset(unsetDemoActivities));
  await tx.commit();
  console.log(`🧹 Borradas ${ids.length} sesiones de demo y la bitácora de demo.`);
}

async function seed() {
  const kid = await client.fetch(`*[_type == "kidProfile" && _id == $kidId][0]{_id, alias}`, { kidId });
  if (!kid) throw new Error(`No existe el kidProfile ${kidId}`);

  const today = todayYmd();
  const realSessions = await client.fetch(
    `*[_type == "dailySession" && kidProfile._ref == $kidId && !(_id match $prefix)]{_id, date}`,
    { kidId, prefix: `${DEMO_PREFIX}*` },
  );
  const realByDate = Object.fromEntries(realSessions.map((s) => [s.date, s._id]));

  const tx = client.transaction();
  let crystals = 0;
  let gameCursor = 0;
  const skipped = [];

  PAST_SESSIONS.forEach(({ daysAgo, done }, i) => {
    const date = addDays(today, -daysAgo);
    const p = i / (PAST_SESSIONS.length - 1);
    // Avanzamos el cursor aunque se salte el día, para que los datos no cambien
    const games = [0, 1, 2].map((j) => GAME_ORDER[(gameCursor + j) % GAME_ORDER.length]);
    gameCursor += 3;
    if (realByDate[date]) {
      skipped.push(date);
      return;
    }

    const difficulty = p < 0.35 ? "easy" : p < 0.75 ? "medium" : "hard";
    const missions = games.map((g, j) => buildMission(g, `demo-${date}-${j}`, difficulty, 60));
    const completed = missions.slice(0, done);

    const telemetryData = completed.map((m, j) =>
      JSON.stringify({
        missionId: m._key,
        gameType: m.gameType,
        timestamp: `${date}T${16 + j}:${String(10 + j * 7).padStart(2, "0")}:00-05:00`,
        metrics: TELEMETRY[m.gameType](Math.min(1, Math.max(0, p + noise(0.05)))),
      }),
    );
    crystals += completed.length * REWARD;

    tx.createOrReplace({
      _id: `${DEMO_PREFIX}${date}`,
      _type: "dailySession",
      kidProfile: { _type: "reference", _ref: kidId },
      date,
      missions,
      completedMissions: completed.map((m) => m._key),
      isCompleted: done === missions.length,
      telemetryData,
    });
  });

  // Hoy: misiones pendientes y cortas para jugarlas en vivo
  const todayMissions = TODAY_GAMES.map((g, j) =>
    buildMission(g, `demo-${today}-${j}-${Date.now().toString(36)}`, "medium", 45),
  );
  if (realByDate[today]) {
    tx.patch(realByDate[today], (p) =>
      p.set({ missions: todayMissions, completedMissions: [], isCompleted: false }),
    );
  } else {
    tx.createOrReplace({
      _id: `${DEMO_PREFIX}${today}`,
      _type: "dailySession",
      kidProfile: { _type: "reference", _ref: kidId },
      date: today,
      missions: todayMissions,
      completedMissions: [],
      isCompleted: false,
      telemetryData: [],
    });
  }

  // Bitácora de actividades físicas (referencias a actividades reales)
  const activities = await client.fetch(`*[_type == "activity"] | order(_createdAt asc)[0...3]{_id}`);
  const moods = ["frustrado", "normal", "feliz"];
  const activityLog = activities.map((a, j) => ({
    _key: DEMO_ACTIVITY_KEYS[j],
    _type: "object",
    activityRef: { _type: "reference", _ref: a._id },
    completedAt: `${addDays(today, -(11 - j * 4))}T17:30:00-05:00`,
    reflection: { mood: moods[j % moods.length], difficulty: 4 - j },
  }));

  tx.patch(kidId, (p) =>
    p
      .unset(unsetDemoActivities)
      .setIfMissing({ activityLog: [], unlockedAvatars: ["default-cadet"], activeAvatar: "default-cadet" })
      .append("activityLog", activityLog)
      // Cristales del historial + margen para comprar en la tienda en vivo
      .set({ energyCrystals: crystals + 150 }),
  );

  await tx.commit();

  console.log(`✅ Datos de demo para "${kid.alias}" (${kidId})`);
  console.log(`   Sesiones pasadas: ${PAST_SESSIONS.length - skipped.length} (de ${addDays(today, -14)} a ${addDays(today, -1)})`);
  if (skipped.length) console.log(`   Días con sesión real (no tocados): ${skipped.join(", ")}`);
  console.log(`   Hoy (${today}): ${TODAY_GAMES.map((g) => GAMES[g]).join(", ")} — ${realByDate[today] ? "sesión real reiniciada" : "sesión creada"}`);
  console.log(`   Bitácora: ${activityLog.length} actividades · Cristales: ${crystals + 150}`);
}

(CLEAN ? clean() : seed()).catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
