// scripts/seed-activities.mjs
// Crea actividades terapéuticas de ejemplo (para hacer en casa o en consulta).
// No toca las actividades existentes. Cada una lleva una ilustración de
// Unsplash (licencia libre), descargada en 1600px WebP para que no pese MB.
//
// Uso:
//   node --env-file=.env.local scripts/seed-activities.mjs          # crear / actualizar textos
//   node --env-file=.env.local scripts/seed-activities.mjs --images # forzar cambio de imágenes
//   node --env-file=.env.local scripts/seed-activities.mjs --clean  # borrar
//
// Idempotente: ids fijos (activity-<slug>). Al re-ejecutar se actualizan
// los textos y solo se sube la imagen si la actividad aún no tiene una.
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const step = (key, title, description, icon) => ({ _key: key, title, description, icon });

// Ilustraciones de Unsplash (https://unsplash.com/license) por slug
const PHOTOS = {
  "semaforo-de-las-emociones": "vector-1752770149851-d3dca1333b2f",
  "estatuas-musicales": "vector-1762072064899-22d8d718decc",
  "busqueda-del-tesoro-con-lista-visual": "vector-1753250862073-dd626da1b71b",
  "rincon-de-la-calma": "vector-1738325063642-ca6a57d8743e",
  "chef-con-receta-ilustrada": "vector-1781485836583-9baa66743001",
};
const FORCE_IMAGES = process.argv.includes("--images");

async function uploadPhoto(slug) {
  const photoId = PHOTOS[slug];
  const res = await fetch(`https://images.unsplash.com/${photoId}?w=1600&q=80&fm=webp`);
  if (!res.ok) throw new Error(`No se pudo descargar ${photoId}: ${res.status}`);
  const asset = await client.assets.upload("image", Buffer.from(await res.arrayBuffer()), {
    filename: `${slug}.webp`,
    contentType: "image/webp",
    source: { name: "unsplash", id: photoId, url: `https://unsplash.com/illustrations/${photoId.replace("vector-", "")}` },
    creditLine: "Ilustración: Unsplash",
  });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

const ACTIVITIES = [
  {
    slug: "semaforo-de-las-emociones",
    title: "Semáforo de las Emociones",
    description:
      "Una herramienta visual para que el niño identifique en qué nivel de activación está (calma, alerta o desborde) y elija una estrategia antes de que la emoción lo supere.",
    duration: 20,
    ageRange: "6-10 años",
    level: "Básico",
    materials: [
      "3 hojas o cartulinas: verde, amarilla y roja.",
      "Marcadores o colores.",
      "Cinta adhesiva para pegar el semáforo en la pared o la nevera.",
    ],
    objectives: [
      "Reconocer las señales corporales de cada emoción (conciencia interoceptiva).",
      "Ampliar el vocabulario emocional.",
      "Asociar cada nivel con una estrategia concreta de autorregulación.",
    ],
    instructions: [
      step("s1", "Construir el semáforo", "Juntos dibujen en cada hoja una carita: verde (tranquilo), amarillo (molesto o inquieto) y rojo (muy enojado o desbordado). Péguenlas en vertical en un lugar visible.", "Hand"),
      step("s2", "Ponerle nombre a cada color", "Pregunta: “¿Cómo se siente tu cuerpo cuando estás en rojo?”. Escriban debajo de cada color 2 o 3 señales que el niño mencione (calor en la cara, puños apretados, ganas de llorar).", "Smile"),
      step("s3", "Elegir una estrategia por color", "Para el amarillo y el rojo acuerden una acción: respirar 5 veces como globo, tomar agua, ir al rincón de la calma o pedir un abrazo. Dibújenla junto al color.", "Eye"),
      step("s4", "Practicar en calma", "Durante la semana pregunten 2 veces al día “¿en qué color estás?” cuando todo esté tranquilo. Así el niño aprende a usarlo antes de necesitarlo de verdad.", "Smile"),
    ],
    benefits:
      "Favorece la regulación emocional y reduce la intensidad y duración de las rabietas, porque el niño aprende a detectar la emoción en el amarillo y no solo cuando ya está en rojo.",
    advice:
      "No uses el semáforo como castigo (“vete al rojo”). Modela tú también: “Ahora estoy en amarillo porque se me hizo tarde, voy a respirar”. Celebra cuando el niño lo use por iniciativa propia.",
  },
  {
    slug: "estatuas-musicales",
    title: "Estatuas Musicales",
    description:
      "El clásico juego de bailar y congelarse cuando para la música, con variantes progresivas que entrenan la capacidad de frenar un movimiento a tiempo.",
    duration: 15,
    ageRange: "4-9 años",
    level: "Básico",
    materials: [
      "Un celular o parlante con música alegre.",
      "Espacio libre de obstáculos.",
      "Opcional: tarjetas con posturas de estatua (avión, árbol, robot).",
    ],
    objectives: [
      "Entrenar el control inhibitorio motor (detener una acción en marcha).",
      "Mejorar la atención auditiva sostenida.",
      "Liberar energía de forma estructurada.",
    ],
    instructions: [
      step("s1", "Ronda básica", "Pon música y que el niño baile libremente. Al pausar, debe quedarse totalmente quieto como estatua hasta contar 5.", "Smile"),
      step("s2", "Estatuas con forma", "Antes de pausar, muestra una tarjeta o di una postura (“¡árbol!”). Al parar la música debe congelarse en esa forma.", "Eye"),
      step("s3", "Regla al revés", "Nivel avanzado: cuando la música suena, se quedan quietos; cuando para, bailan. Cambiar la regla exige frenar el impulso aprendido.", "Hand"),
      step("s4", "Cierre en calma", "Termina con una canción lenta en la que se mueven en cámara lenta, para bajar la activación antes de la siguiente actividad.", "Smile"),
    ],
    benefits:
      "Fortalece la inhibición de respuesta y la flexibilidad cognitiva (cambio de regla), dos funciones ejecutivas que suelen estar comprometidas en el TDAH.",
    advice:
      "Empieza con pausas largas y predecibles, y hazlas más cortas e inesperadas a medida que lo logre. Si se mueve, no lo elimines: que haga 3 sentadillas y vuelva al juego.",
  },
  {
    slug: "busqueda-del-tesoro-con-lista-visual",
    title: "Búsqueda del Tesoro con Lista Visual",
    description:
      "El niño debe encontrar varios objetos por la casa siguiendo una lista con dibujos y marcando cada uno al terminarlo. Entrena planificación y memoria de trabajo de forma divertida.",
    duration: 25,
    ageRange: "5-10 años",
    level: "Intermedio",
    materials: [
      "Una hoja con 5 a 8 dibujos o fotos de objetos de la casa.",
      "Un lápiz o calcomanías para marcar lo encontrado.",
      "Una bolsa o canasta para reunir los objetos.",
      "Opcional: un temporizador visual.",
    ],
    objectives: [
      "Practicar la planificación (decidir un orden de búsqueda).",
      "Usar apoyos visuales para no depender solo de la memoria.",
      "Desarrollar la autosupervisión: revisar la lista y marcar avances.",
    ],
    instructions: [
      step("s1", "Preparar la lista", "Elige objetos fáciles de reconocer (una cuchara, un calcetín rojo, un libro). Dibújalos o pega fotos en una hoja con un cuadro al lado de cada uno.", "Hand"),
      step("s2", "Planear antes de buscar", "Antes de empezar, pregunta: “¿Por qué cuarto vas a empezar?”. Ayúdale a agrupar los objetos por lugar (cocina, cuarto, baño).", "Eye"),
      step("s3", "Buscar y marcar", "Por cada objeto encontrado, debe volver a la lista y marcarlo. Si se distrae, señala la lista en vez de repetirle la instrucción.", "Eye"),
      step("s4", "Revisar juntos", "Al final, comparen la bolsa con la lista. Pregunta qué le ayudó a encontrarlos y qué haría distinto la próxima vez.", "Smile"),
    ],
    benefits:
      "Traslada a un juego la misma habilidad que se necesita para rutinas como alistar la maleta: seguir una secuencia, sostener la meta y comprobar que todo esté completo.",
    advice:
      "Usa la misma lista visual para tareas reales (la rutina de la mañana, la maleta del colegio). Con el tiempo, el niño puede crear sus propias listas.",
  },
  {
    slug: "rincon-de-la-calma",
    title: "Rincón de la Calma",
    description:
      "Diseñar con el niño un espacio pequeño y acogedor con objetos sensoriales al que puede ir cuando se siente sobreestimulado. No es un castigo, es una herramienta de autorregulación.",
    duration: 30,
    ageRange: "4-12 años",
    level: "Básico",
    materials: [
      "Un rincón tranquilo (puede ser una tienda de tela, una caja grande o una esquina con cojines).",
      "Una manta o cojín pesado.",
      "2 o 3 objetos sensoriales: pelota antiestrés, botella de la calma, plastilina.",
      "Audífonos o protectores auditivos.",
      "Tarjetas con estrategias (respirar, contar, abrazar el peluche).",
    ],
    objectives: [
      "Ofrecer un espacio seguro para bajar la sobrecarga sensorial.",
      "Enseñar a pedir una pausa antes del desborde.",
      "Promover la autonomía en la regulación emocional.",
    ],
    instructions: [
      step("s1", "Elegir el lugar juntos", "Recorran la casa y que el niño elija el rincón. Que sea un lugar con poca luz y ruido, pero cerca de un adulto.", "Eye"),
      step("s2", "Armar la caja sensorial", "Seleccionen juntos los objetos. Preparen una “botella de la calma” con agua, pegamento transparente y escarcha: al agitarla, la escarcha cae despacio.", "Hand"),
      step("s3", "Practicar cuando está tranquilo", "Visiten el rincón en un momento de calma y prueben cada objeto. Así el niño sabrá qué le funciona cuando lo necesite.", "Smile"),
      step("s4", "Acordar cómo se usa", "Definan una señal para pedir ir (una tarjeta o una palabra clave) y cuánto tiempo puede quedarse. Al salir, conversen brevemente sobre cómo se siente.", "Smile"),
    ],
    benefits:
      "Especialmente útil en niños con TEA o hipersensibilidad sensorial: reduce la sobrecarga, previene crisis y le da al niño una forma concreta de autorregularse.",
    advice:
      "Nunca envíes al niño al rincón como castigo, porque dejará de verlo como un lugar seguro. Respeta su tiempo allí y evita hablarle mucho mientras se calma.",
  },
  {
    slug: "chef-con-receta-ilustrada",
    title: "Chef con Receta Ilustrada",
    description:
      "Preparar una merienda sencilla siguiendo una receta con imágenes paso a paso. Una actividad cotidiana que entrena secuenciación, atención y tolerancia a la espera.",
    duration: 30,
    ageRange: "6-12 años",
    level: "Intermedio",
    materials: [
      "Ingredientes para una receta sin fuego (sándwich, brochetas de fruta o yogur con cereal).",
      "Receta impresa con un dibujo o foto por paso.",
      "Utensilios seguros: cuchillo sin filo, platos y cucharas.",
      "Delantal (opcional, pero motiva mucho).",
    ],
    objectives: [
      "Seguir una secuencia de pasos en orden (funciones ejecutivas).",
      "Mantener la atención en una tarea hasta terminarla.",
      "Practicar la motricidad fina y la tolerancia a la espera.",
    ],
    instructions: [
      step("s1", "Leer la receta completa", "Antes de tocar cualquier ingrediente, revisen juntos todos los pasos con las imágenes. Pregúntale: “¿Qué hacemos primero? ¿Y al final?”.", "Eye"),
      step("s2", "Alistar ingredientes", "El niño reúne en la mesa todo lo que dice la receta y lo marca. Es el momento de practicar la espera: aún no se come nada.", "Hand"),
      step("s3", "Preparar paso a paso", "Avancen un paso a la vez, señalando la imagen correspondiente. Si se salta un paso, regresa a la receta en lugar de corregirlo con palabras.", "Hand"),
      step("s4", "Disfrutar y ordenar", "Compartan la merienda y terminen limpiando juntos: el orden también es parte de la receta.", "Smile"),
    ],
    benefits:
      "Lleva las funciones ejecutivas a la vida diaria: planificar, secuenciar y monitorear una tarea real, con una recompensa natural al final que mantiene la motivación.",
    advice:
      "Elige recetas de 4 a 6 pasos al inicio. Dale tareas reales y responsabilidad: un niño que siente que su ayuda importa se concentra mucho más.",
  },
];

async function clean() {
  const tx = client.transaction();
  ACTIVITIES.forEach((a) => {
    tx.delete(`activity-${a.slug}`);
    tx.delete(`drafts.activity-${a.slug}`);
  });
  await tx.commit();
  console.log(`🧹 Borradas ${ACTIVITIES.length} actividades de ejemplo.`);
}

async function seed() {
  const ids = ACTIVITIES.map((a) => `activity-${a.slug}`);
  // Cada actividad se relaciona con las dos siguientes
  const related = (i) =>
    [1, 2].map((d) => ({
      _key: `rel-${d}`,
      _type: "reference",
      _ref: ids[(i + d) % ids.length],
    }));

  // Imagen solo para las que aún no tienen
  const withImage = new Set(
    await client.fetch(`*[_id in $ids && defined(image.asset)]._id`, { ids }),
  );
  const images = {};
  for (const [i, a] of ACTIVITIES.entries()) {
    if (FORCE_IMAGES || !withImage.has(ids[i])) images[ids[i]] = await uploadPhoto(a.slug);
  }

  const tx = client.transaction();
  ACTIVITIES.forEach((a, i) => {
    const { slug, ...fields } = a;
    tx.createIfNotExists({ _id: ids[i], _type: "activity" });
    tx.patch(ids[i], (p) =>
      p.set({
        ...fields,
        slug: { _type: "slug", current: slug },
        instructions: a.instructions.map((s) => ({ ...s, _type: "object" })),
        relatedActivity: related(i),
        ...(images[ids[i]] ? { image: images[ids[i]] } : {}),
      }),
    );
  });
  await tx.commit();
  ACTIVITIES.forEach((a, i) =>
    console.log(`✅ ${a.title}${images[ids[i]] ? " (imagen subida)" : ""}`),
  );
}

(process.argv.includes("--clean") ? clean() : seed()).catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
