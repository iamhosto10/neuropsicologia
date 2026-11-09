# Auditoría de NeuroPlay — funcionalidades, hallazgos, mejoras y guía para el cliente

Fecha: 2026-11-09 · Rama: `claude/app-audit-testing-57b137` · Stack: Next.js 16 (App Router), Clerk (login), Sanity (base de datos/CMS), Tailwind, framer-motion.

## 0. Cómo se hizo y qué NO se pudo hacer (leer primero)

| Qué | Cómo |
|---|---|
| Código | Lectura de acciones de servidor, páginas, motores de juego, telemetría, esquemas. `tsc` sin errores; `eslint`: **226 problemas (144 errores)**. |
| Juegos | Los **14 juegos** se montaron en un arnés temporal sin login (ya borrado) y se arrancaron en el navegador. Se jugó a fondo Warp Drive y se verificó el flujo de fin de partida/guardado de Campo de Asteroides y Rastreador Satelital; el resto se verificó que carga, arranca y responde, y su lógica se revisó en código. |
| Datos | Pruebas contra el dataset `production` de Sanity con documentos `qa-audit-*` (creados y **borrados**; 0 restos verificados). Confirman 5 bugs de integridad de datos. |
| **NO hecho** | **No creé usuario en Clerk ni inicié sesión**: crear cuentas/introducir credenciales en un proveedor externo está fuera de lo que puedo hacer aunque lo autorices. Por eso el panel de padres, el HQ del niño, la tienda y los reportes con datos reales **no se recorrieron en pantalla**; se revisaron por código y por pruebas del lado de datos. Si inicias sesión tú en el navegador integrado, puedo continuar el recorrido visual. |

## 1. Mapa de la aplicación (qué es y para qué sirve)

**Producto:** plataforma de entrenamiento cognitivo para niños con TDAH/TEA. El niño ("cadete") juega misiones espaciales; el adulto ("comandante": padre o terapeuta) asigna misiones y ve telemetría clínica.

### Zona pública (sin login)
1. **Landing `/`** — propuesta de valor, "diseñado para dos mundos", vista previa de 6 juegos. Sirve para captar.
2. **Academia `/cursos` y detalle** — cursos para padres/terapeutas (módulos → lecciones con texto, imágenes, audio, quiz, pregunta abierta, mini-juegos).
3. **Laboratorio `/actividades` y detalle** — catálogo de ejercicios físicos/manuales para casa o consulta.
4. **Lección `/cursos/[curso]/[lección]`** — lectura + quizzes + audio narrado + juegos en "modo práctica"; al completarla da 10 cristales.

### Zona del adulto (`/dashboard`, requiere login)
5. **Panel de Comando** — resumen del escuadrón, energía total, estado de la sesión de hoy por niño.
6. **Directorio de Pacientes** (`/pacientes`) — tabla de niños, editar/eliminar.
7. **Añadir cadete** — crea perfil (alias).
8. **Ficha del cadete** (`/kid/[id]`) — 4 pestañas (Resumen, Atención, Memoria, Proc. complejo), gráfica de precisión, progreso en cursos, bitácora de actividades, **informe imprimible**.
9. **Reporte por juego** (`/reporte/[gameType]`) — métricas clínicas por juego + diccionario clínico.
10. **Agenda y Planificador** (`/assign`, `/planificador`) — asignar hasta 5 misiones por día (juego, dificultad, duración, cristales).
11. **Laboratorio / Académico** del cadete — asignar actividades y cursos; progreso de quizzes y respuestas abiertas.
12. **Constructor de cursos** (`/cursos/nuevo`, `/editar`, `/leccion`) — crear cursos y lecciones con bloques (texto, imagen, **audio con voz IA de Google**, quiz, pregunta abierta).
13. **Ajustes** — gestión de cuenta (componente Clerk).

### Zona del niño (`/select-profile`, `/hq`, `/misiones`)
14. **¿Quién juega hoy?** — selector de perfil (cookie 12 h).
15. **Cuartel General** — misiones del día, cristales, avatar, accesos a Tienda/Academia/Laboratorio.
16. **Misión** — ejecuta uno de los 14 juegos y guarda telemetría + cristales.
17. **Bazar Espacial** (tienda) — compra/equipa avatares con cristales.

### Los 14 juegos (función cognitiva que miden)
Limpieza Espacial (atención selectiva) · Rastreador Satelital (atención sostenida) · Campo de Asteroides (Go/No-Go, inhibición) · Comunicador Inverso (flexibilidad) · Panel de Seguridad (Corsi, memoria visoespacial) · Gran Evasión (multitarea) · Laboratorio de Carga (N-Back) · Tormenta de Nebulosa (Flanker) · Decodificador de Señales (SDMT, velocidad) · Ruta de Navegación (planificación) · Propulsores Warp (suma continua) · Acoplamiento Estelar (rotación mental) · Desensamblaje del Casco (planificación) · Laboratorio de Fluidos (planificación/Hanoi).

### Otros
Webhook de Clerk (crea el usuario en Sanity), Sanity Studio `/studio`, sandboxes `/test` y `/juegos` (ocultos en producción), scripts `seed-demo` y `seed-avatars`.

## 2. Hallazgos (ordenados por gravedad)

Leyenda: ✅ = reproducido (navegador o datos) · 📖 = por lectura de código.

### CRÍTICO / ALTO

| # | Hallazgo | Evidencia | Mejora |
|---|---|---|---|
| A1 | **Cualquier usuario con sesión puede crear, editar y borrar cursos y lecciones del catálogo global.** Las acciones del constructor solo comprueban `userId`, sin rol ni dueño. También pueden subir imágenes sin límite de tipo/tamaño y disparar la API de voz de Google (costo). 📖 | `builder.actions.ts` | Rol `admin/therapist` (Clerk `publicMetadata`), dueño del curso, validar tipo/tamaño de archivo, límite de uso del TTS. |
| A2 | **Guardar misión falla en silencio.** Los 14 juegos hacen `await saveMissionProgress(...)` sin mirar el resultado ni usar `try/catch` y luego `router.push("/hq")`. Si Sanity falla: el niño pierde cristales y la telemetría **sin aviso**; si la acción lanza error, queda atrapado en "Guardando progreso…". ✅ (partida real: guardado falló sin login y la app redirigió igual) | `*-game.tsx` | Reintentar, mostrar error y botón "Reintentar guardado", guardar en `localStorage` hasta confirmar. |
| A3 | **Tramposos y datos clínicos manipulables:** el servidor confía en `isCorrect` y `reward` que manda el navegador en quizzes y preguntas abiertas; `markLessonCompleted`/`markActivityCompleted` dan cristales por **cualquier id inventado**; la telemetría de misión es JSON libre del cliente. ✅ (5 ids falsos = +50 cristales) | `quiz.actions.ts`, `course.actions.ts`, `activity.actions.ts`, `mission.actions.ts` | Calcular correcto/recompensa en el servidor desde Sanity; validar que la lección/actividad exista; validar y limitar tamaño de la telemetría. |
| A4 | **Condición de carrera: recompensas duplicadas.** Se lee "¿ya completó?" y luego se escribe sin `ifRevisionId`. Tres peticiones simultáneas dieron **30 cristales en vez de 10** y el id repetido 3 veces. Igual en compra de avatares y misiones. ✅ | `course/activity/mission/store.actions.ts` | `ifRevisionId` o transacción con condición; idempotencia por clave. |
| A5 | **No se puede eliminar un paciente que tenga sesiones.** `deleteKidProfile` falla porque las sesiones lo referencian (referencia fuerte). El padre ve "Hubo un error…". ✅ | prueba en Sanity | Borrar sesiones + niño en una transacción (y definir política de borrado de datos de menores). |
| A6 | **Si el webhook de Clerk no corrió, nadie puede crear cadetes**: el perfil referencia `user-<id>` que no existe. Además no se manejan `user.updated/deleted` (cuentas borradas dejan datos de menores huérfanos). ✅ | prueba en Sanity, `webhooks/clerk` | Crear el usuario "al vuelo" (`createIfNotExists`) en `createKidProfile`; manejar eliminación; el webhook usa `req.json()` y re-serializa: usar `req.text()` para verificar la firma. |
| A7 | **Faltan los textos legales** (Política de Privacidad, Términos, Metodología, FAQ: todos los enlaces del footer son `#`) en una app que trata datos de menores y salud. ✅ | footer | Publicar Habeas Data / consentimiento de tutor / aviso de IA (ya existe la skill `revisor-legal-lanzamiento`). |
| A8 | **Cuadro clínico potencialmente engañoso:** "Panel de Seguridad" en dificultad *fácil* nunca genera rondas "inverso" (`reverseChance: 0`) y el gráfico **promedia directo con inverso = 0**, así que un niño perfecto aparece con 50 % de precisión. 📖 (mismo patrón en Corsi/Reverse) | `telemetry-engine.ts`, `useMemoryEngine.ts` | Si no hay rondas de un tipo, no promediarlo (`null`). |

### MEDIO

| # | Hallazgo | Evidencia | Mejora |
|---|---|---|---|
| M1 | **Reloj mal formateado**: 6 juegos pintan `00:{tiempo % 60}`. Con 60 s (el valor por defecto) arranca en **00:00**; con 120 s cuenta 00:59…00:00 dos veces. Afecta Asteroides, Carga, Panel de Seguridad, Nebulosa, Decodificador y Warp. ✅ | HUD de cada juego | Un único `formatTime()` compartido (mm:ss). |
| M2 | **El Rastreador Satelital depende del "hover" del mouse** (`onMouseEnter/Leave`). En tablet/celular, el público objetivo, la señal se vacía y el juego no se puede jugar. Además el desgaste de señal es **por fotograma**: en pantallas de 120 Hz el juego es el doble de difícil que a 60 Hz → métricas no comparables. ✅ (señal a 0 en 2 s sin mouse) | `satellite-tracker-game.tsx`, `useSatelliteEngine.ts` | Eventos `pointer` + controlar por `dt`. |
| M3 | **La duración configurada se ignora en "Laboratorio de Carga"** (fija en 40 s). ✅ (se pidieron 20 s, mostró 40) | `cargo-laboratory-game.tsx:58` | Usar `config.duration`. |
| M4 | **Directorio de Pacientes siempre muestra 0 sesiones y sin "último acceso"**: consulta el campo `kidReference`, que no existe (es `kidProfile`). ✅ | `pacientes/page.tsx:22` | Cambiar a `kidProfile._ref`. |
| M5 | **Re-asignar un día pisa las misiones pero no reinicia `completedMissions`**: las llaves viejas cuentan para "día completado" → puede marcarse completo con misiones sin jugar. 📖 | `mission.actions.ts` | Resetear `completedMissions`/`telemetryData` al sobrescribir (o avisar). |
| M6 | **Error de React en Campo de Asteroides** ("Cannot update a component (Router) while rendering"): el fin de partida se dispara dentro de un updater de estado. En desarrollo puede guardar dos veces. Mismo patrón en Satelital. ✅ (consola) | `useGoNoGoEngine.ts`, `useSatelliteEngine.ts` | Mover `finishGame` a un `useEffect` cuando `timeLeft === 0`. |
| M7 | **Desensamblaje del Casco: el propio texto avisa "te quedarás atascado"** y no hay botón de reiniciar ni detección de bloqueo; solo 2 plantillas fijas por nivel (se memorizan). 📖 ✅ | `useHullEngine.ts` | Botón reiniciar sector, detectar estado sin salida, generar niveles resolubles. |
| M8 | **Recompensas incoherentes**: la mayoría paga siempre el máximo aunque el niño no acierte nada; Warp Drive paga proporcional a la precisión. 📖 | `*-game.tsx` | Decidir una política (participación vs. desempeño) y aplicarla a todos. |
| M9 | **Tienda: la cookie `activeKidId` se lee sin comprobar dueño** en la lección (`getActiveKidId`), y compra/equipar no son atómicos (saldo negativo posible). 📖 | `profile/lesson page` | Usar `getOwnedActiveKidId`. |
| M10 | **Audio de lecciones**: textos largos cambian de voz (la rama de "trozos" usa otra voz que la corta), no se valida la respuesta de Google en los trozos, y **cada guardado regenera y vuelve a subir todos los audios** (costo + archivos huérfanos). 📖 | `builder.actions.ts` | Misma voz, validar, regenerar solo si cambió el guion. |
| M11 | **9 sonidos referenciados no existen** (`ambient-ship, ambient-tech, bg-tech, bg-warp, collect-bad, collect-good, rewind, ui-click, wall-crash`) → 404 y juegos "mudos" en esos efectos. ✅ (404 en consola) | `public/sounds` | Agregar los archivos o quitar la referencia. |
| M12 | **Marketing ≠ producto**: la landing describe "Rastreador Satelital" como memoria de secuencias y "Campo de Asteroides" como disparar a asteroides; en realidad son atención sostenida y un Go/No-Go de color. Solo muestra 6 de 14 juegos. ✅ | `landing/tools-section.tsx` | Alinear con `clinical-dictionary.ts`. |
| M13 | **Faltan validaciones del servidor**: alias de 20 caracteres solo en el navegador (acepta 200), `avatarStatus: "locked"` no existe en el esquema, tope de 5 misiones solo en cliente, duración sin máximo, slugs que borran tildes ("Atención" → "atenci-n"). ✅ | `profile.actions.ts`, `builder.actions.ts` | Validar con Zod en servidor. |

### BAJO / MEJORAS

- `console.log` de datos del niño en HQ y ficha (20 en total); quitar antes de producción.
- `InlineGameWrapper` importa `sanity.config` (arrastra Sanity Studio al bundle público de las lecciones): quitar el import sin uso.
- `.env.local` define `NEXT_PUBLIC_SANITY_API_WRITE_TOKEN` (token de **escritura** con prefijo público). Hoy no se usa en código, pero si alguien lo referencia queda expuesto: **borrarlo y rotar el token** por precaución.
- Sanity usa `useCdn: true` en varias consultas de progreso → datos atrasados justo después de jugar.
- La ficha solo consulta las **últimas 7 sesiones**: el informe clínico no puede mostrar evolución larga. La gráfica agrupa por "DD/MM" (sin año).
- Accesibilidad: reglas por color rojo/verde (Comunicador Inverso) para daltónicos; insignia "LABORATORIO" encima del HUD en modo práctica; relojes en `h-` fijos en móvil.
- Calidad de código: 117 `any`, 48 variables sin usar, 22 `<img>` sin optimizar, 8 hooks con dependencias incorrectas (varios provocan *closures* obsoletos: el botón de silencio no afecta a los eventos por *timeout*).
- Dos lockfiles (`npm` y `pnpm`) y aviso de Next por raíz del workspace; el archivo `middleware` está deprecado (migrar a `proxy`).
- Dev: Clerk con claves de **desarrollo** (`pk_test`) y dataset `production` compartido: separar dataset de pruebas y de producción.
- No hay pruebas automáticas (ni unitarias ni E2E) → cada arreglo de arriba puede regresar.

## 3. Lo que funciona bien (decirlo al cliente)

Protección de rutas con Clerk + comprobación de propietario en acciones del niño (ya corregida en commits recientes), tope de cristales por misión en el servidor, tienda que ignora el precio del navegador, telemetría rica y con diccionario clínico, informe imprimible, modo transparente de datos por juego, 14 juegos con 3 dificultades, bitácora emocional, ocultación de sandboxes en producción, imágenes optimizadas desde la CDN, interfaz coherente y de baja estimulación.

## 4. Orden de arreglo sugerido

1. **Antes de la demo (1–2 h):** M1 reloj, M3 duración de Carga, M4 directorio, M11 sonidos, console.log, quitar token público, enlaces legales (aunque sean borradores).
2. **Antes de datos reales:** A1 permisos del constructor, A2 error de guardado, A3/A4 recompensas en servidor y carreras, A5 borrado, A6 webhook/usuario al vuelo, A8 gráfica.
3. **Antes de vender como herramienta clínica:** M2 táctil/dt, M5, M6, M7, validaciones, pruebas automáticas, textos legales revisados por abogado, política de datos de menores.

## 5. Guía para presentar la app al cliente

### Antes de la reunión (preparación)
- Identifica **quién es**: ¿terapeuta/psicólogo, dueño de centro, padre o inversionista? Ajusta el lenguaje: al terapeuta le interesa la *validez* de la medición; al padre la *motivación* del niño; al inversionista el *modelo* y la escala.
- Prepara el entorno: cadete de demo con `scripts/seed-demo.mjs` (2 semanas de datos), sesión de **hoy** pendiente para jugar en vivo, avatares con `seed-avatars.mjs`. Prueba todo la víspera, con internet y sonido, en el mismo dispositivo que usarás.
- Ten abierto: landing, panel del adulto, una ficha con datos, un juego listo. Cierra pestañas y notificaciones.
- **No demuestres** (hoy): crear/borrar pacientes con historial, el constructor de cursos con audio largo, el Rastreador Satelital en tablet, el Casco en difícil. Evita `/test`.

### Cómo hablarle (lenguaje sencillo)
- Empieza por **su problema**, no por la tecnología: "A los niños con TDAH les cuesta sostener los ejercicios y al terapeuta le cuesta medir si mejoran entre sesión y sesión. NeuroPlay resuelve las dos cosas."
- Una frase para todo: **"El niño juega una aventura espacial; el adulto ve, en números, cómo está su atención, memoria y control de impulsos."**
- Evita jerga: di "control de impulsos" y no "inhibición Go/No-Go", "memoria de trabajo" y no "N-Back", salvo que el cliente sea clínico (entonces úsala y nombra la prueba: Go/No-Go, N-Back, Flanker, Corsi, SDMT).
- Usa **ejemplos de la vida diaria**: "Este juego entrena lo mismo que necesita para esperar su turno / no interrumpir / seguir instrucciones de varios pasos."
- **Pregunta más de lo que afirmas:** "¿Cómo miden hoy el progreso?", "¿Qué le gustaría ver en un reporte?", "¿Cuántos pacientes atiende a la semana?".

### Guion de demo (15–20 min)
1. **Gancho (1 min):** landing. El problema y la promesa en una frase.
2. **Lado del niño (5 min):** *Selector de perfil → Cuartel General → una misión corta* (Campo de Asteroides o Propulsores Warp: reglas simples, se entienden en 10 s). Deja que el cliente juegue. Muestra cristales y **Bazar** (comprar un avatar) — es la motivación.
3. **Lado del adulto (7 min):** Panel de Comando → ficha del cadete → gráfica de evolución → un reporte por juego ("¿ven que baja la impulsividad?") → **informe imprimible** (el momento de valor para el terapeuta).
4. **Asignar (2 min):** Planificador: elegir 2–3 misiones, dificultad y duración para mañana. "Usted decide, el niño solo ve su misión."
5. **Academia y Laboratorio (2 min):** cursos para padres y actividades físicas: "no es solo pantalla".
6. **Cierre (2 min):** resumen en 3 puntos (motiva al niño · mide con datos · guía a la familia) y pregunta de siguiente paso.

### Preguntas probables y cómo responder (con honestidad)
- **"¿Está validado clínicamente?"** → "Los juegos están basados en paradigmas reconocidos (Go/No-Go, N-Back, Flanker, Corsi, SDMT), pero **la plataforma aún no tiene estudios de validación propios**. Es una herramienta de **apoyo y seguimiento**, no sustituye evaluación ni diagnóstico." *(Evita "terapia" y "basado en evidencia" sin respaldo: es riesgo legal y reputacional.)*
- **"¿Qué pasa con los datos de los niños?"** → Explica que están en un servicio en la nube con acceso por cuenta del adulto; **no prometas lo que aún no existe** (política de privacidad, consentimiento y borrado están pendientes: dilo como siguiente fase).
- **"¿Sirve en tablet?"** → "La mayoría sí; estamos ajustando el Rastreador Satelital para táctil."
- **"¿Se puede personalizar?"** → Sí: dificultad, duración, cristales y qué juegos por día; cursos propios (con permisos por definir).
- **"¿Cuánto cuesta / cómo se cobra?"** → No improvises; ten una propuesta escrita.
- Si algo falla en vivo: no te disculpes en exceso. "Eso es justo lo que afinamos en pruebas", pasa al siguiente punto y anótalo.

### Después de la reunión
Envía resumen en 24 h con: lo que vieron, lo que pidió el cliente, lo que está pendiente (legal, validación, táctil) y fechas. Pide un **piloto pequeño** (2–3 niños, 2 semanas) con métricas de éxito acordadas: sesiones completadas, adherencia, satisfacción del terapeuta.
