# Plan de correcciones NeuroPlay — de lo más urgente a lo menos urgente

Pensado para que **otra IA (o un dev)** lo ejecute sin contexto previo. Cada punto trae: problema, evidencia reproducida, archivos, pasos, cómo verificar y criterio de aceptación.
Complementa `AUDITORIA_NEUROPLAY.md` (mapa de funcionalidades y guía para el cliente).

## Contexto técnico mínimo
- Next.js 16 (App Router, Server Actions), React 19 + React Compiler, Clerk (login), **Sanity** (base de datos; cliente `@sanity/client` vía `next-sanity`), Tailwind.
- Escrituras: `client.withConfig({ token: process.env.SANITY_API_WRITE_TOKEN, useCdn:false })` en `src/app/actions/*.ts`. Autorización: `src/lib/auth-guards.ts` (`isKidOwnedByCurrentUser`, `getOwnedActiveKidId`).
- Los 14 juegos: `src/components/games/*-game.tsx` + motores `src/hooks/use*Engine.ts`. Telemetría → `saveMissionProgress` (`src/app/actions/mission.actions.ts`) → `dailySession.telemetryData` (strings JSON) → leída por `src/lib/telemetry-engine.ts`.
- Dataset: **`production` compartido** con datos reales de otras familias. Para probar usa solo el cadete **"QA Auditoría"** (`_id: rJpN1YbXC50opvyT1KFcyA`, padre `user-user_39iW21RwZH9AF1VF1id0XtbTrOm`). Nunca toques otros `kidProfile`. Cualquier documento de prueba debe llevar el prefijo `qa-audit-` y borrarse al terminar.
- Comandos: `npm run dev`, `npx tsc --noEmit` (hoy pasa), `npx next build` (hoy pasa), `npx eslint src` (226 problemas).
- Lo que se probó en vivo con login: crear cadete, planificador, jugar 5 misiones reales, tienda, lección con quiz y pregunta abierta, asignar y completar actividad, ficha y reporte por juego, directorio, cursos.

## Estado en que quedó el cadete "QA Auditoría" (no se borró)
205 cristales; avatares `casco-turbo` y `piloto-cohete` (equipado); sesión de hoy 5/5 completada; lección 1 de "El Código de Navegación Estelar" completada; actividad "Búsqueda del Tesoro" completada con reflexión. Sirve para repetir pruebas.

---

> ✅ **Ítems 24, 26 y 27 corregidos** (lecturas de progreso sin caché CDN con prueba guardiana; lint sin errores — `any` y 2 reglas de temporizadores quedan como advertencias; sonido compartido, aria-label, reduced-motion; `npm run check`). Verificado en vivo. Siguen pendientes 21, 25, 28 (CI/E2E) y 29 (iPad real).
> ✅ **Ítems 15 a 20 y 22-23 corregidos** (15 respaldo de audio; 16 páginas legales BORRADOR con [REVISAR] + consentimiento del tutor; 17 sonidos reasignados a archivos existentes; 18 landing; 19 sin console.log de datos, proxy.ts, bundle y límite de cuerpo; 20 slug sin tildes y recompensa 0; 22-23 títulos, barra superior real y cabecera del modo práctica). **Pendientes:** 21 (política de recompensas: requiere decisión), 24 (accesibilidad), 25 (migración de datos antiguos), 26-29 (lint, caché CDN, CI/E2E, iPad real). Aún falta en el panel de Sanity registrar el dominio de producción en CORS (15).
> ✅ **Ítems 8 a 14 corregidos** (excepto 11.5: misiones sin interacción); verificado en vivo: mínimos de duración, reasignación, relojes, duración de Carga, guardado único, etiquetas de la ficha y botón de reinicio del Casco; pendiente de verificar en vivo: arrastre táctil del Satelital (el panel limita rAF) y el aviso de "sin movimientos" del Casco.
> ✅ **Ítems 1 a 7 corregidos y commiteados** con pruebas de regresión (`npm test`, 88 pruebas): 1-3 acciones de servidor y `src/lib/sanity-safe.ts`; 4 permisos (`src/lib/content-roles.ts`; requiere rol `admin`/`therapist` en Clerk publicMetadata o env `CONTENT_EDITOR_USER_IDS`); 5 `src/lib/mission-save-client.ts`; 6-7 `src/lib/clerk-sync.ts`. Falta verificación en vivo de 4-7 (la sesión de Clerk del navegador expiró) y que quiz/pregunta abierta lean el resultado `{error}`.

## 🔴 URGENTE (pérdida de datos, dinero/trampas, seguridad) — hacer antes de usar con datos reales

### 1. Se pierde el historial académico y de actividades: dos `.append()` en el mismo patch de Sanity (CRÍTICO, reproducido)
- **Problema:** en `@sanity/client`, encadenar dos `.append()` en un mismo `patch` **descarta el primero** (la operación `insert` se sobrescribe). Prueba aislada: `append("a",["A1"]).append("b",["B1"])` → `a: []`, `b: ["B1"]`.
- **Evidencia en la app:** al responder 2 quizzes y 1 pregunta abierta, `completedQuizzes` y los cristales se guardaron pero `academicTelemetry` quedó `[]`; el "Boletín Académico" muestra "Aún no hay registros de quizzes completados". Al completar una actividad con reflexión: `activityLog` se guardó pero `completedActivities` quedó `[]`, así que **la misma actividad se puede completar una y otra vez ganando +20 cristales** y el candado visual nunca funciona.
- **Archivos:** `src/app/actions/quiz.actions.ts`, `open-question.actions.ts`, `activity.actions.ts` (y revisar cualquier otro sitio con dos `.append`/`.insert` en el mismo patch: `grep -n "\.append(" -r src/app/actions`).
- **Pasos:**
  1. Reemplazar el patch único por una **transacción con un patch por cada append** sobre el mismo documento:
     ```ts
     const tx = writeClient.transaction();
     tx.patch(kidId, (p) => p.setIfMissing({ academicTelemetry: [] }).append("academicTelemetry", [telemetryRecord]));
     if (shouldReward) {
       tx.patch(kidId, (p) => p.setIfMissing({ completedQuizzes: [] }).append("completedQuizzes", [uniqueId]).inc({ energyCrystals: reward }));
     }
     await tx.commit();
     ```
     Hacer lo mismo en `open-question.actions.ts` y en `activity.actions.ts` (`completedActivities` y `activityLog` en patches distintos; el `unset` de `assignedActivities` puede ir en uno de ellos).
  2. Añadir un test (script) que haga la llamada equivalente y compruebe que ambos arrays crecen.
  3. **Reparar datos históricos** si importan: no es recuperable el telemetría perdida; solo informar.
- **Verificar:** como QA Auditoría, responder un quiz/pregunta abierta nueva (otra lección) y completar otra actividad; con un script `node --env-file=.env.local q.mjs '*[_id=="rJpN1YbXC50opvyT1KFcyA"][0]{academicTelemetry,completedActivities,activityLog}'` ver ambos arrays con datos. Abrir `/dashboard/kid/<id>/academico` y ver el registro.
- **Aceptación:** ningún server action usa dos `append`/`insert` en el mismo patch; el boletín muestra respuestas; completar la misma actividad dos veces no suma cristales la segunda vez.

### 2. El servidor confía en lo que manda el navegador (trampas y datos clínicos falsificables)
- **Problema/evidencia:** `submitQuizAnswer(lessonId, isCorrect, reward, …)` y `submitOpenAnswer(…, reward, …)` aceptan `isCorrect` y `reward` del cliente; `markLessonCompleted` / `markActivityCompleted` dan cristales por **cualquier id** (prueba: 5 ids inventados = +50); `saveMissionProgress` acepta telemetría JSON arbitraria. Un niño puede llamar la acción desde la consola.
- **Pasos:**
  1. `quiz.actions.ts`: ignorar `isCorrect` y `reward`. Leer de Sanity el bloque: `*[_type=="lesson" && _id==$lessonId][0].content[_key==$blockKey][0]{_type, correctOptionIndex, reward}`; calcular `isCorrect` comparando con la opción elegida (revisar en `src/components/lesson-detail/interactive-quiz.tsx` líneas ~49-65 qué envía hoy `selected`: debe ser el índice) y usar el `reward` del bloque.
  2. `open-question.actions.ts`: usar el `reward` del bloque; limitar `responseText` (p. ej. 2000 caracteres).
  3. `course.actions.ts` y `activity.actions.ts`: antes de premiar comprobar que el id existe (`count(*[_type=="lesson" && _id==$id])>0`, `_type=="activity"`) y que no está completado.
  4. `mission.actions.ts`: validar que `telemetry` sea un array de ≤ 1 objeto, ≤ ~5 KB, con solo claves numéricas/booleanas conocidas del `gameType`.
  5. Sanitizar el `activityId`/`lessonId` interpolado en `patch.unset([`assignedActivities[_ref == "${id}"]`])`: usar solo ids que ya validaste existen y rechazar comillas.
- **Aceptación:** invocar la acción con `reward: 99999`, `isCorrect: true` o un id inventado no cambia `energyCrystals`.

### 3. Condiciones de carrera: recompensas duplicadas y saldos incorrectos (reproducido)
- **Evidencia:** 3 peticiones simultáneas de "completar lección" dieron 30 cristales (esperado 10) y el id repetido 3 veces. Mismo patrón (leer → decidir → escribir) en misiones, quizzes, actividades, compra de avatares (puede dejar saldo negativo).
- **Pasos:** leer también `_rev` del documento y escribir con `.ifRevisionId(rev)`; si falla con conflicto, reintentar una vez releyendo. Alternativa: marcar con `tx.createIfNotExists({_id: \`${kidId}.reward.${uniqueId}\`, _type:"rewardClaim"})` y solo sumar si se creó. En `store.actions.ts` comprobar saldo dentro del mismo patch con `ifRevisionId`.
- **Verificar:** script con `Promise.all` de 5 llamadas → cristales aumentan una sola vez.

### 4. Cualquier usuario con sesión puede crear, editar y borrar cursos/lecciones globales y gastar la API de voz
- **Archivos:** `src/app/actions/builder.actions.ts` (todas las acciones solo hacen `auth().userId`), UI en `src/app/(login)/dashboard/cursos/*` (cualquier padre ve "Crear Nuevo Curso" y "Editar", verificado).
- **Pasos:** 1) Definir rol en Clerk (`publicMetadata.role = "admin" | "therapist"`); crear `requireContentEditor()` en `auth-guards.ts` que lea `sessionClaims.metadata.role`. 2) Llamarla al inicio de cada acción de `builder.actions.ts`. 3) Ocultar botones Crear/Editar en la UI si no hay rol. 4) `uploadAssetAction`/`createCourseAction`: validar `file.type` ∈ {image/jpeg,png,webp}, tamaño ≤ 5 MB. 5) Límite de caracteres por guion TTS y de audios por lección; rate-limit por usuario. 6) Opcional: guardar `owner` en cada curso/lección y permitir editar solo al dueño.
- **Aceptación:** con una cuenta sin rol, las acciones devuelven `{success:false,error:"No autorizado"}` y la UI no muestra los botones.

### 5. El guardado de misión falla en silencio en los 14 juegos
- **Evidencia:** `await saveMissionProgress(...)` seguido de `router.push("/hq")` sin leer el resultado ni `try/catch` (probado: con el guardado fallando, la app redirigió igual). Warp usa `.then()` sin `.catch`.
- **Pasos:** 1) Crear hook compartido `useSaveMission()` en `src/hooks/` que: llame a la acción dentro de `try/catch`, reintente 2 veces con espera, y devuelva `{status:"saving"|"saved"|"error"}`. 2) Si falla, mostrar pantalla "No pudimos guardar tu progreso" con botón **Reintentar** (no redirigir) y guardar `{kidId, missionId, telemetry}` en `localStorage` para reintentar al volver. 3) Cambiar los 14 componentes para usarlo y solo hacer `router.push("/hq")` con `saved`. 4) En `saveMissionProgress` devolver `{success:false,error}` con mensaje.
- **Aceptación:** simular fallo (cortar red / token inválido) → el niño ve el error y puede reintentar; nunca vuelve al HQ sin guardar.

### 6. No se puede eliminar un cadete con sesiones (reproducido) y no hay borrado de datos de menores
- **Evidencia:** Sanity responde `cannot be deleted as there are references to it from "<dailySession>"`. `deleteKidProfile` devuelve el error genérico.
- **Pasos:** en `profile.actions.ts` `deleteKidProfile`: obtener `ids = *[_type=="dailySession" && kidProfile._ref==$kidId]._id`, y en una `transaction()` borrar todas las sesiones y luego el cadete. Confirmar en UI con texto explícito ("se borrarán X sesiones, irreversible"). Añadir en el webhook de Clerk el evento `user.deleted` que borre al usuario y sus cadetes y sesiones.
- **Aceptación:** crear cadete de prueba con sesión → borrar desde `/dashboard/pacientes` funciona y no quedan documentos huérfanos (`*[_type=="dailySession" && !defined(kidProfile->_id)]` vacío). *(No borrar "QA Auditoría"; usar otro cadete de prueba.)*

### 7. Alta de usuarios frágil: sin webhook nadie puede crear cadetes (reproducido)
- **Pasos:** 1) En `createKidProfile` (y en `select-profile`/`dashboard` si se desea) llamar `client.withConfig({token}).createIfNotExists({_id:\`user-${userId}\`, _type:"user", name, clerkId, email, role:"free", slug})` usando `currentUser()` antes de crear el cadete. 2) `src/app/api/webhooks/clerk/route.ts`: leer el cuerpo con `await req.text()` y verificar la firma con ese texto (hoy hace `req.json()` y re-serializa, puede fallar con caracteres especiales); devolver 400 si falta el secreto en vez de lanzar. 3) Manejar `user.updated` y `user.deleted`. 4) Documentar en el README cómo registrar el webhook (URL pública + secreto) también para el dominio de producción.
- **Aceptación:** un usuario nuevo recién creado en Clerk puede crear su primer cadete aunque el webhook no haya corrido.

---

## 🟠 ALTA (rompe la experiencia o falsea los reportes) — siguiente sprint

### 8. Relojes mal formateados (reproducido)
Seis juegos pintan `00:{timeLeft % 60}`: con 60 s arranca en "00:00"; con 120 s cuenta dos veces. Archivos: `asteroid-field`, `cargo-laboratory`, `memory-matrix`, `nebula-storm`, `signal-decoder`, `warp-drive` (`*-game.tsx`). **Pasos:** crear `formatClock(seconds)` en `src/lib/utils.ts` → `mm:ss` con `Math.floor(s/60)` y `s%60`; sustituirlo en los 14 HUD (los que ya lo hacen bien pueden reutilizarlo). **Aceptación:** con 60 s arranca "01:00" y con 120 s "02:00".

### 9. Duración configurada ignorada o inviable
- `cargo-laboratory-game.tsx:58` fuerza `duration: 40` → usar `config.duration || 40` (reproducido: pedí 10 s y duró 40 s).
- Panel de Seguridad con 10 s: el patrón y la espera consumen ~9 s, el niño no llega a responder ninguna ronda y igual cobra la recompensa (reproducido). **Pasos:** definir en un solo sitio `MIN_DURATION_BY_GAME` (p. ej. Panel 45 s, Navegación 60 s…), usarlo en `mission-assigner.tsx` (atributo `min` por juego) **y** validar en `assignDailySession`; y/o no descontar del reloj el tiempo de mostrar el patrón (`useMemoryEngine.ts`).

### 10. Error de React: el fin de partida se dispara dentro de un `setState` (reproducido en Asteroides y Laboratorio de Carga)
Consola: "Cannot update a component (Router) while rendering…". Causa: `finishGame()` (que llama `onFinish` → `router.push`) se invoca dentro del updater de `setTimeLeft` (`useGoNoGoEngine.ts`, `useSatelliteEngine.ts`, otros). **Pasos:** quitar la llamada del updater y añadir `useEffect(() => { if (gameState==="playing" && timeLeft<=0) finishGame(); }, [timeLeft, gameState, finishGame])` (patrón que ya usa `useMemoryEngine.ts`); asegurar que `finishGame` solo corre una vez con un `useRef` bandera. Revisar los 8 avisos de `react-hooks/exhaustive-deps` del lint (closures obsoletos: el botón de silencio no afecta eventos por timeout). **Aceptación:** consola sin ese error y un solo `saveMissionProgress` por partida (también en modo estricto de dev).

### 11. Reportes clínicos con números engañosos
1. **Panel de Seguridad fácil** nunca genera rondas inversas (`reverseChance:0`) y `telemetry-engine.ts` promedia `directo` con `inverso = 0` → máximo 50 %. Arreglo: en `computeOtherAccuracy` si no hubo rondas de un tipo (guardar `null` en vez de 0 en `useMemoryEngine.getAccuracy`) promediar solo los existentes.
2. **"CRISTALES GENERADOS"** en la ficha muestra el **saldo actual** (185) no lo ganado (tras gastar 100 debería ser 285). Mostrar "Saldo" o calcular el acumulado (guardar `totalCrystalsEarned`).
3. **"DÍAS ENTRENADOS"** cuenta días con misiones **asignadas** (mostró 1 con 0 jugadas). Contar sesiones con `completedMissions>0`.
4. **Precisión de Warp** cuenta la ecuación sin responder como fallo (80 % con 0 errores): calcular sobre respondidas.
5. Misiones donde el niño no hizo nada (0 estímulos respondidos) cuentan como precisión 0 % y como "completadas 100 %": marcar `participation: "none"` y excluirlas del promedio.
6. La ficha solo lee las **últimas 7 sesiones** (`getKidClinicalReportQuery` `[0...7]`) y el gráfico agrupa por "DD/MM": ampliar a 30–90 días y usar fecha completa.
7. Directorio de Pacientes: la query usa `kidReference` (inexistente) y la tabla ni muestra sesiones/último acceso; cambiar a `kidProfile._ref` y añadir columnas.

### 12. Re-asignar un día no reinicia el progreso
`assignDailySession` (`mission.actions.ts`) pisa `missions` pero conserva `completedMissions`/`telemetryData` antiguos → `isCompleted` puede marcarse con misiones sin jugar. **Pasos:** al sobrescribir `.set({missions, completedMissions: [], isCompleted:false})` (y decidir si se archiva la telemetría vieja en otro campo); si ya hay progreso, pedir confirmación en `mission-assigner.tsx`. Validar en servidor: máx. 5 misiones, `gameType` ∈ los 14 conocidos, `timeLimit` 10–600, `energyReward` 0–500, `date` ≥ hoy.

### 13. Rastreador Satelital no jugable en tablet y dependiente de la frecuencia de pantalla
Usa `onMouseEnter/Leave` (`satellite-tracker-game.tsx:241`) y desgasta la señal **por fotograma** (`useSatelliteEngine.ts`: `drain`, `boost`, `eventChance` sin `dt`). **Pasos:** cambiar a `onPointerEnter/Leave/Down/Move` (para táctil: el dedo "arrastra" y el satélite sigue al dedo, o convertir la mecánica a "mantener el dedo sobre el objetivo"); escalar `drain`, `boost` y `eventChance` por `dt/16.67`. **Aceptación:** mismo resultado a 60 y 120 Hz; jugable con dedo en iPad.

### 14. Desensamblaje del Casco sin salida
Sin botón de reinicio ni detección de bloqueo; solo 2 plantillas por nivel (`useHullEngine.ts`). **Pasos:** botón "Reiniciar sector" (cuenta como `resets` en telemetría), detectar tablero sin movimientos válidos y ofrecer reiniciar, y ampliar/generar niveles resolubles.

---

## 🟡 MEDIA (confiabilidad, legal, calidad percibida)

### 15. Audio de lecciones depende de la lista CORS de Sanity (reproducido)
`cdn.sanity.io/.../*.mp3` respondió **403** al origen `localhost:3100` (200 en `localhost:3000`). El reproductor (`audio-player-block.tsx`, wavesurfer) se queda cargando sin mensaje de error. **Pasos:** en Sanity Manage → API → CORS origins, agregar el dominio de producción, los de Vercel preview (`https://*.vercel.app` si aplica) y los puertos de dev; en el componente, escuchar `wavesurfer.on("error")` y mostrar `<audio controls src=...>` como respaldo + mensaje. **Verificar:** abrir una lección con audio en el dominio de producción.

### 16. Textos legales y enlaces muertos
Footer: "Metodología Clínica", "Preguntas Frecuentes", "Política de Privacidad", "Términos de Servicio" apuntan a `#` (`src/components/footer/footer.tsx` líneas 90–117); correo `hola@neuroplay.com` por confirmar. **Pasos:** crear rutas `/privacidad`, `/terminos`, `/metodologia`, `/faq` en `src/app/(site)/` con el contenido que genere la skill `revisor-legal-lanzamiento` (borrador para abogado), enlazarlas, y añadir casilla de consentimiento del tutor al crear el cadete.

### 17. Sonidos inexistentes (9 archivos)
Referenciados y ausentes en `public/sounds`: `ambient-ship, ambient-tech, bg-tech, bg-warp, collect-bad, collect-good, rewind, ui-click, wall-crash` (404 en consola). **Pasos:** `grep -rn "/sounds/" src` para ver qué juego usa cada uno; añadir los mp3 o reutilizar existentes.

### 18. Landing no coincide con el producto
`src/components/landing/tools-section.tsx`: describe "Rastreador Satelital" como memoria de secuencias y "Campo de Asteroides" como disparar a asteroides; solo muestra 6 de 14 juegos. Alinear con `src/lib/clinical-dictionary.ts`; revisar claims "Terapia", "Basado en Evidencia", "Cero frustración".

### 19. Higiene de seguridad y configuración
1. Quitar `NEXT_PUBLIC_SANITY_API_WRITE_TOKEN` de `.env.local` y de Vercel; **rotar** el token de escritura (si alguna vez estuvo expuesto).
2. Separar datasets (`development` vs `production`) y claves Clerk de desarrollo/producción; no probar contra `production`.
3. `next.config.ts`: `bodySizeLimit: "10mb"` en server actions es muy alto sin validación; bajar a 2–4 MB.
4. Renombrar `src/middleware.ts` a `src/proxy.ts` (Next 16 lo marca deprecado). Eliminar `package-lock.json` o `pnpm-lock.yaml` (hay dos) y fijar `turbopack.root`.
5. Quitar los 20 `console.log` (HQ `page.tsx`, ficha del cadete, mission actions) que imprimen datos del niño.

### 20. Validaciones de servidor pendientes
Alias (20 caracteres solo en cliente; aceptado 200), `avatarStatus:"locked"` fuera del esquema (`profile.actions.ts`, valores válidos `happy|hungry|tired`), `unlockedAvatars` sin `default-cadet` al crear, slugs que borran tildes (`lecci-n-1-…`; usar `slugify` con `normalize("NFD")`), `parseInt(reward)||10` que impide recompensa 0. Usar Zod en cada server action.

### 21. Consistencia de recompensas
Hoy casi todos pagan el máximo aun sin acertar y Warp paga proporcional. Decidir política (participación vs desempeño; recomendado: base por completar + bonus por desempeño) y aplicarla en un helper `computeReward(telemetry, gameType, max)` en servidor.

---

## 🟢 BAJA (pulido y mantenimiento)

22. **Metadatos/títulos**: `/dashboard/*`, `/actividades/[slug]`, `/dashboard/add-cadet` muestran el título genérico; añadir `metadata`/`generateMetadata`.
23. **UI**: insignia "LABORATORIO" tapa el HUD en modo práctica (`inline-game-wrapper.tsx`); import sin uso de `sanity.config` en ese archivo (infla el bundle público); campana con punto rojo y "Comandante · Especialista" fijos en `topbar.tsx` (usar `useUser()` y quitar la campana o implementarla); texto cortado "El primer" en la tienda; error de hidratación en el menú lateral (ids de Radix `aria-controls`) en `/dashboard`.
24. **Accesibilidad**: reglas solo por color rojo/verde (Comunicador Inverso, Asteroides): añadir icono/texto; respetar `prefers-reduced-motion`; etiquetas `aria-label` en botones de icono; modo sin sonido persistente.
25. **Datos antiguos**: `avatarStatus:"locked"` en todos los cadetes existentes y `unlockedAvatars:null`: migrar con un script idempotente.
26. **Lint/tipos**: 117 `any`, 48 variables sin usar, 22 `<img>` (usar `next/image`), 8 `exhaustive-deps`, 5 `set-state-in-effect`. Hacer `eslint --fix` donde aplique y tipar `SessionTelemetry` por juego en `src/lib/types.ts`.
27. **Consultas con CDN**: usar `useCdn:false` en lecturas de progreso inmediatamente tras escritura (ficha, lección) o `revalidateTag`.
28. **Pruebas automáticas**: Vitest para `telemetry-engine.ts` (precisión por juego), para las acciones (con cliente Sanity simulado) y Playwright para el flujo: crear cadete → asignar → jugar → ver reporte → comprar avatar. Añadir un job de CI con `tsc`, `eslint`, `next build`.
29. **Perfiles por defecto**: `Rastreador`, `Gran Evasión` y `Casco` en tablets: probar en un iPad real antes de la demo.

---

## Orden recomendado de ejecución para una IA
1. Ítems **1 → 2 → 3** (misma zona de código: `src/app/actions/*`), con un script de verificación contra QA Auditoría.
2. **5** (hook de guardado) y **10** (fin de partida) juntos, tocando los 14 juegos una sola vez; incluir **8** (reloj) y **9** en la misma pasada.
3. **4, 6, 7** (permisos, borrado, alta de usuarios).
4. **11, 12** (reportes y reasignación) y **13, 14** (juegos concretos).
5. Los demás por prioridad. Tras cada bloque: `npx tsc --noEmit && npx next build`, repetir la prueba manual con "QA Auditoría" y actualizar este archivo marcando lo hecho.
