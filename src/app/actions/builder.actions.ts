// src/app/actions/builder.actions.ts
"use server";
import { client, writeClient } from "@/sanity/lib/client";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid"; // Opcional, pero bueno para slugs únicos

export async function createCourseAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const age = formData.get("age") as string;
    const duration = parseInt(formData.get("duration") as string, 10);
    const level = formData.get("level") as string;
    // 🔥 1. Extraemos la imagen del formData
    const imageFile = formData.get("image") as File;

    if (!title) {
      throw new Error("El título es obligatorio");
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const uniqueSlug = `${baseSlug}-${uuidv4().substring(0, 5)}`;

    let imageRef = undefined;

    // 🔥 2. Si hay imagen, la subimos a Sanity
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const asset = await writeClient.assets.upload("image", buffer, {
        filename: imageFile.name,
      });
      imageRef = {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      };
    }

    // 3. Creamos el documento inyectando la referencia de la imagen
    const newCourse = await writeClient.create({
      _type: "course",
      title: title,
      slug: {
        _type: "slug",
        current: uniqueSlug,
      },
      description: description,
      age: age,
      duration: duration || 0,
      level: level || "Básico",
      image: imageRef, // 🔥 Inyectamos la imagen
      syllabus: [],
    });

    revalidatePath("/dashboard/cursos");

    return { success: true, courseId: newCourse._id, slug: uniqueSlug };
  } catch (error: any) {
    console.error("Error al crear el curso:", error);
    return {
      success: false,
      error: error.message || "Error desconocido al crear el curso",
    };
  }
}

export async function createLessonAction(
  courseId: string,
  moduleTitle: string,
  formData: FormData,
) {
  try {
    const title = formData.get("lessonTitle") as string;
    if (!title) throw new Error("El título de la lección es obligatorio");

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const uniqueSlug = `${baseSlug}-${uuidv4().substring(0, 5)}`;

    const rawBlocks = formData.get("contentBlocks") as string;
    const blocksData = rawBlocks ? JSON.parse(rawBlocks) : [];

    const sanityContent = [];

    for (const block of blocksData) {
      const blockKey = uuidv4();

      // BLOQUE DE TEXTO
      if (block.type === "text") {
        sanityContent.push({
          _key: blockKey,
          _type: "block",
          children: [
            { _key: uuidv4(), _type: "span", marks: [], text: block.text },
          ],
          markDefs: [],
          style: "normal",
        });
      }

      // BLOQUE DE IMAGEN
      if (block.type === "image") {
        // Asumimos que el frontend ya subió la imagen y nos pasó el ID en block.assetId
        if (block.assetId) {
          sanityContent.push({
            _key: blockKey,
            _type: "image",
            asset: { _type: "reference", _ref: block.assetId },
          });
        }
      }

      // 🔥 EL NUEVO MAGNÍFICO BLOQUE DE AUDIO TTS 🔥
      if (block.type === "lessonAudio") {
        const scriptText = block.scriptText;

        if (scriptText) {
          // Usamos la función blindada que hace chunking si es necesario
          const audioBuffer = await generateRobustAudio(scriptText);

          // Subimos el Buffer (ya sea de 1 trozo o de 10 unidos) a Sanity
          const asset = await writeClient.assets.upload("file", audioBuffer, {
            filename: `narracion_${uuidv4().substring(0, 8)}.mp3`,
          });

          sanityContent.push({
            _key: blockKey,
            _type: "lessonAudio",
            title: "Escucha atentamente el mensaje del Comandante",
            scriptText: scriptText,
            audioFile: {
              _type: "file",
              asset: { _type: "reference", _ref: asset._id },
            },
          });
        }
      }

      // QUIZ
      if (block.type === "lessonQuestion") {
        sanityContent.push({
          _key: blockKey,
          _type: "lessonQuestion",
          question: block.question,
          options: block.options,
          correctOptionIndex: parseInt(block.correctOptionIndex, 10),
          reward: parseInt(block.reward, 10) || 10,
        });
      }

      // PREGUNTA ABIERTA
      if (block.type === "lessonOpenQuestion") {
        sanityContent.push({
          _key: blockKey,
          _type: "lessonOpenQuestion",
          question: block.question,
          reward: parseInt(block.reward, 10) || 15,
        });
      }
    }

    // Guardar Lección en Sanity
    const newLesson = await writeClient.create({
      _type: "lesson",
      title: title,
      slug: { _type: "slug", current: uniqueSlug },
      content: sanityContent,
    });

    // Vincular al Syllabus
    // 🔥 4. VINCULACIÓN AL SYLLABUS (VERSIÓN ROBUSTA) 🔥
    const currentCourse = await client.fetch(
      `*[_type == "course" && _id == $id][0]{ syllabus }`,
      { id: courseId },
    );

    const currentSyllabus = currentCourse?.syllabus || [];

    // Buscamos si el módulo con ese título ya existe
    const existingModuleIndex = currentSyllabus.findIndex(
      (mod: any) => mod.title === moduleTitle,
    );

    if (existingModuleIndex >= 0) {
      // ✅ EL MÓDULO EXISTE: Le inyectamos la lección solo a su array interno 'lessons'
      // Usamos la ruta exacta del array en Sanity: syllabus[index].lessons
      await writeClient
        .patch(courseId)
        .setIfMissing({ [`syllabus[${existingModuleIndex}].lessons`]: [] }) // Nos aseguramos de que el array lessons exista
        .insert("after", `syllabus[${existingModuleIndex}].lessons[-1]`, [
          // Lo añadimos al final
          { _type: "reference", _ref: newLesson._id, _key: uuidv4() },
        ])
        .commit();
    } else {
      // ✅ EL MÓDULO NO EXISTE: Creamos el módulo entero y lo inyectamos al final del syllabus
      const newModule = {
        _key: uuidv4(),
        _type: "module", // Ojo, debe coincidir con el nombre de tu objeto en el schema
        title: moduleTitle,
        lessons: [{ _type: "reference", _ref: newLesson._id, _key: uuidv4() }],
      };

      await writeClient
        .patch(courseId)
        .setIfMissing({ syllabus: [] }) // Si el curso no tiene syllabus en absoluto, lo crea vacío
        .insert("after", "syllabus[-1]", [newModule]) // Inyecta el nuevo módulo al final de la lista
        .commit();
    }

    revalidatePath(`/dashboard/cursos/leccion/${courseId}`);

    return { success: true, lessonId: newLesson._id };
  } catch (error: any) {
    console.error("Error al crear la lección:", error);
    return {
      success: false,
      error: error.message || "Error al crear la lección",
    };
  }
}

// export async function getLessonForEditAction(lessonId: string) {
//   try {
//     // 1. Buscamos la lección en Sanity. Resolvemos las referencias de imágenes/audios
//     // para poder mostrar sus URLs o nombres en el frontend.
//     const query = `*[_type == "lesson" && _id == $id][0]{
//       _id,
//       title,
//       content[]{
//         _key,
//         _type,
//         // Texto rico
//         children[]{text},
//         // Imagen
//         asset->{url},
//         // Audio
//         title,
//         scriptText,
//         audioFile{ asset->{url} },
//         // Quizzes
//         question,
//         options,
//         correctOptionIndex,
//         reward
//       }
//     }`;

//     const lesson = await client
//       .withConfig({ useCdn: false })
//       .fetch(
//         query,
//         { id: lessonId },
//         { cache: "no-store", next: { revalidate: 0 } },
//       );

//     if (!lesson) throw new Error("Lección no encontrada");

//     // 2. TRADUCCIÓN (Data Parsing): Convertimos la estructura de Sanity
//     // a la estructura plana que necesita nuestro componente de React.
//     const formattedBlocks = (lesson.content || [])
//       .map((block: any) => {
//         const base = { id: block._key, type: block._type };

//         if (block._type === "block") {
//           // Concatenamos todo el texto del bloque (Portable Text -> String plano)
//           const textContent =
//             block.children?.map((child: any) => child.text).join("") || "";
//           return { ...base, type: "text", text: textContent };
//         }
//         if (block._type === "image") {
//           return { ...base, imageUrl: block.asset?.url }; // Enviamos la URL por si quieren verla
//         }
//         if (block._type === "lessonAudio") {
//           return {
//             ...base,
//             title: block.title || "",
//             scriptText: block.scriptText || "",
//             audioUrl: block.audioFile?.asset?.url,
//           };
//         }
//         if (block._type === "lessonQuestion") {
//           return {
//             ...base,
//             question: block.question,
//             options: block.options,
//             correctOptionIndex: block.correctOptionIndex.toString(),
//             reward: block.reward.toString(),
//           };
//         }
//         if (block._type === "lessonOpenQuestion") {
//           return {
//             ...base,
//             question: block.question,
//             reward: block.reward.toString(),
//           };
//         }
//         return null;
//       })
//       .filter(Boolean); // Limpiamos nulos

//     return {
//       success: true,
//       lessonTitle: lesson.title,
//       blocks: formattedBlocks,
//     };
//   } catch (error: any) {
//     console.error("Error al obtener la lección:", error);
//     return {
//       success: false,
//       error: "Error al cargar los datos de la lección.",
//     };
//   }
// }

export async function getLessonForEditAction(lessonId: string) {
  try {
    // 🔥 CAMBIO: Añadimos 'asset' crudo y 'imageUrl' resuelta
    const query = `*[_type == "lesson" && _id == $id][0]{
      _id,
      title,
      content[]{
        _key,
        _type,
        children[]{text},
        asset,
        "imageUrl": asset->url,
        title,
        scriptText,
        audioFile{ asset->{url} },
        question,
        options,
        correctOptionIndex,
        reward
      }
    }`;

    const lesson = await client
      .withConfig({ useCdn: false })
      .fetch(
        query,
        { id: lessonId },
        { cache: "no-store", next: { revalidate: 0 } },
      );

    if (!lesson) throw new Error("Lección no encontrada");

    const formattedBlocks = (lesson.content || [])
      .map((block: any) => {
        const base = { id: block._key, type: block._type };

        if (block._type === "block") {
          const textContent =
            block.children?.map((child: any) => child.text).join("") || "";
          return { ...base, type: "text", text: textContent };
        }
        if (block._type === "image") {
          // 🔥 CAMBIO: Ahora guardamos el ID original por si no editan la foto
          return {
            ...base,
            imageUrl: block.imageUrl,
            assetId: block.asset?._ref,
          };
        }
        if (block._type === "lessonAudio") {
          return {
            ...base,
            title: block.title || "",
            scriptText: block.scriptText || "",
            audioUrl: block.audioFile?.asset?.url,
          };
        }
        if (block._type === "lessonQuestion") {
          return {
            ...base,
            question: block.question,
            options: block.options,
            correctOptionIndex: block.correctOptionIndex.toString(),
            reward: block.reward.toString(),
          };
        }
        if (block._type === "lessonOpenQuestion") {
          return {
            ...base,
            question: block.question,
            reward: block.reward.toString(),
          };
        }
        return null;
      })
      .filter(Boolean);

    return {
      success: true,
      lessonTitle: lesson.title,
      blocks: formattedBlocks,
    };
  } catch (error: any) {
    console.error("Error al obtener la lección:", error);
    return {
      success: false,
      error: "Error al cargar los datos de la lección.",
    };
  }
}

// export async function updateLessonAction(
//   lessonId: string,
//   courseId: string,
//   formData: FormData,
// ) {
//   try {
//     const title = formData.get("lessonTitle") as string;
//     if (!title) throw new Error("El título es obligatorio");

//     const rawBlocks = formData.get("contentBlocks") as string;
//     const blocksData = rawBlocks ? JSON.parse(rawBlocks) : [];

//     const sanityContent = [];

//     for (const block of blocksData) {
//       // Si el bloque ya existía, usamos su ID original (_key). Si es nuevo, creamos uno.
//       const blockKey = block.id.length > 20 ? block.id : uuidv4();

//       // TEXTO
//       if (block.type === "text") {
//         sanityContent.push({
//           _key: blockKey,
//           _type: "block",
//           children: [
//             { _key: uuidv4(), _type: "span", marks: [], text: block.text },
//           ],
//           markDefs: [],
//           style: "normal",
//         });
//       }

//       // IMAGEN
//       if (block.type === "image") {
//         const file = formData.get(`file_${block.id}`) as File;

//         // Si hay un archivo NUEVO, lo subimos
//         if (file && file.size > 0) {
//           const buffer = Buffer.from(await file.arrayBuffer());
//           const asset = await writeClient.assets.upload("image", buffer, {
//             filename: file.name,
//           });
//           sanityContent.push({
//             _key: blockKey,
//             _type: "image",
//             asset: { _type: "reference", _ref: asset._id },
//           });
//         } else {
//           // 🔥 SI NO HAY ARCHIVO NUEVO, Omitimos este bloque (o podríamos requerir que lo suban de nuevo
//           // por simplicidad en esta iteración. Para mantener la URL vieja se requiere lógica extra).
//           // Por ahora, asumiremos que si editan imagen, deben subirla de nuevo.
//         }
//       }

//       // AUDIO (TTS)
//       if (block.type === "lessonAudio") {
//         const scriptText = block.scriptText;

//         // 🔥 IMPORTANTE: Aquí deberíamos comprobar si el texto CAMBIÓ.
//         // Si no cambió, no deberíamos gastar créditos de la API de Google.
//         // Por simplicidad en este MVP, si mandan el bloque, regeneramos el audio.
//         if (scriptText) {
//           const apiKey = process.env.GOOGLE_TTS_API_KEY;
//           const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

//           const ttsResponse = await fetch(url, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               input: { text: scriptText },
//               voice: { languageCode: "es-US", name: "es-US-Standard-B" },
//               audioConfig: { audioEncoding: "MP3" },
//             }),
//           });

//           const ttsData = await ttsResponse.json();
//           if (ttsData.audioContent) {
//             const audioBuffer = Buffer.from(ttsData.audioContent, "base64");
//             const asset = await writeClient.assets.upload("file", audioBuffer, {
//               filename: `narracion_${uuidv4().substring(0, 8)}.mp3`,
//             });

//             sanityContent.push({
//               _key: blockKey,
//               _type: "lessonAudio",
//               title: block.title || "Mensaje del Comandante",
//               scriptText: scriptText, // Guardamos el guion
//               audioFile: {
//                 _type: "file",
//                 asset: { _type: "reference", _ref: asset._id },
//               },
//             });
//           }
//         }
//       }

//       // QUIZ
//       if (block.type === "lessonQuestion") {
//         sanityContent.push({
//           _key: blockKey,
//           _type: "lessonQuestion",
//           question: block.question,
//           options: block.options,
//           correctOptionIndex: parseInt(block.correctOptionIndex, 10),
//           reward: parseInt(block.reward, 10) || 10,
//         });
//       }

//       // ABIERTA
//       if (block.type === "lessonOpenQuestion") {
//         sanityContent.push({
//           _key: blockKey,
//           _type: "lessonOpenQuestion",
//           question: block.question,
//           reward: parseInt(block.reward, 10) || 15,
//         });
//       }
//     }

//     // 4. EL PATCH MÁGICO A LA LECCIÓN
//     // En lugar de crear un documento nuevo, actualizamos el existente
//     await writeClient
//       .patch(lessonId)
//       .set({
//         title: title,
//         content: sanityContent,
//       })
//       .commit();

//     // Revalidamos la ruta del curso
//     revalidatePath(`/dashboard/cursos/leccion/${courseId}`);

//     return { success: true };
//   } catch (error: any) {
//     console.error("Error al actualizar la lección:", error);
//     return {
//       success: false,
//       error: error.message || "Error al actualizar la lección",
//     };
//   }
// }

export async function updateLessonAction(
  lessonId: string,
  courseId: string,
  formData: FormData,
) {
  try {
    const title = formData.get("lessonTitle") as string;
    if (!title) throw new Error("El título es obligatorio");

    const rawBlocks = formData.get("contentBlocks") as string;
    const blocksData = rawBlocks ? JSON.parse(rawBlocks) : [];

    const sanityContent = [];

    for (const block of blocksData) {
      const blockKey = block.id.length > 20 ? block.id : uuidv4();

      // TEXTO
      if (block.type === "text") {
        sanityContent.push({
          _key: blockKey,
          _type: "block",
          children: [
            { _key: uuidv4(), _type: "span", marks: [], text: block.text },
          ],
          markDefs: [],
          style: "normal",
        });
      }

      // 🔥 IMAGEN (ACTUALIZADA PARA SUBIDA DIRECTA) 🔥
      if (block.type === "image") {
        // Si el bloque tiene un assetId (ya sea el original que no tocaron,
        // o uno nuevo recién subido por el frontend), lo guardamos.
        if (block.assetId) {
          sanityContent.push({
            _key: blockKey,
            _type: "image",
            asset: { _type: "reference", _ref: block.assetId },
          });
        }
      }

      // 🔥 AUDIO TTS (ACTUALIZADO CON MOTOR ROBUSTO CHUNKING) 🔥
      if (block.type === "lessonAudio") {
        const scriptText = block.scriptText;

        if (scriptText) {
          // Usamos nuestro motor que aguanta textos de cualquier tamaño
          const audioBuffer = await generateRobustAudio(scriptText);

          const asset = await writeClient.assets.upload("file", audioBuffer, {
            filename: `narracion_${uuidv4().substring(0, 8)}.mp3`,
          });

          sanityContent.push({
            _key: blockKey,
            _type: "lessonAudio",
            title: block.title || "Mensaje del Comandante",
            scriptText: scriptText,
            audioFile: {
              _type: "file",
              asset: { _type: "reference", _ref: asset._id },
            },
          });
        }
      }

      // QUIZ
      if (block.type === "lessonQuestion") {
        sanityContent.push({
          _key: blockKey,
          _type: "lessonQuestion",
          question: block.question,
          options: block.options,
          correctOptionIndex: parseInt(block.correctOptionIndex, 10),
          reward: parseInt(block.reward, 10) || 10,
        });
      }

      // ABIERTA
      if (block.type === "lessonOpenQuestion") {
        sanityContent.push({
          _key: blockKey,
          _type: "lessonOpenQuestion",
          question: block.question,
          reward: parseInt(block.reward, 10) || 15,
        });
      }
    }

    // EL PATCH MÁGICO A LA LECCIÓN
    await writeClient
      .patch(lessonId)
      .set({
        title: title,
        content: sanityContent,
      })
      .commit();

    revalidatePath(`/dashboard/cursos/leccion/${courseId}`);

    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar la lección:", error);
    return {
      success: false,
      error: error.message || "Error al actualizar la lección",
    };
  }
}

export async function updateCourseMetadataAction(
  courseId: string,
  formData: FormData,
) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const age = formData.get("age") as string;
    const duration = parseInt(formData.get("duration") as string, 10);
    const level = formData.get("level") as string;
    const imageFile = formData.get("image") as File;

    if (!title) throw new Error("El título es obligatorio");

    // Preparamos los datos básicos a actualizar
    let updateData: any = {
      title,
      description,
      age,
      duration: duration || 0,
      level,
    };

    // Si el usuario subió una imagen nueva, la procesamos
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const asset = await writeClient.assets.upload("image", buffer, {
        filename: imageFile.name,
      });
      updateData.image = {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      };
    }

    // Parcheamos el curso en Sanity
    await writeClient.patch(courseId).set(updateData).commit();

    // Revalidamos las rutas donde aparece el curso
    revalidatePath(`/dashboard/cursos/leccion/${courseId}`);
    revalidatePath(`/dashboard/cursos`);

    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar el curso:", error);
    return {
      success: false,
      error: error.message || "Error al actualizar el curso",
    };
  }
}

// ==========================================
// ACCIÓN 4: ELIMINAR LECCIÓN (VERSIÓN TRANSACCIÓN ATÓMICA)
// ==========================================
export async function deleteLessonAction(courseId: string, lessonId: string) {
  try {
    const currentCourse = await client
      .withConfig({ useCdn: false })
      .fetch(`*[_type == "course" && _id == $id][0]`, { id: courseId });

    if (!currentCourse || !currentCourse.syllabus) {
      throw new Error("Curso no encontrado");
    }

    const pathsToUnset: string[] = [];

    currentCourse.syllabus.forEach((module: any) => {
      if (module.lessons) {
        module.lessons.forEach((lessonRef: any) => {
          if (lessonRef._ref === lessonId) {
            pathsToUnset.push(
              `syllabus[_key=="${module._key}"].lessons[_key=="${lessonRef._key}"]`,
            );
          }
        });
      }
    });

    // 🔥 LA MAGIA ESTÁ AQUÍ: Iniciamos una Transacción
    const transaction = writeClient.transaction();

    // 1. Agregamos al carrito: Desvincular la lección del curso
    if (pathsToUnset.length > 0) {
      transaction.patch(courseId, (patch) => patch.unset(pathsToUnset));
    }

    // 2. Agregamos al carrito: Eliminar el documento de la lección
    transaction.delete(lessonId);

    // 3. ¡Ejecutamos todo al mismo tiempo exacto!
    await transaction.commit();

    // Revalidamos la pantalla
    revalidatePath(`/dashboard/cursos/leccion/${courseId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar la lección:", error);
    return {
      success: false,
      error: error.message || "No se pudo eliminar la lección",
    };
  }
}

export async function uploadAssetAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) throw new Error("No hay archivo");

    const buffer = Buffer.from(await file.arrayBuffer());

    // Subimos a Sanity
    const asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
    });

    return { success: true, assetId: asset._id, url: asset.url };
  } catch (error: any) {
    console.error("Error al subir asset:", error);
    return { success: false, error: "Fallo al subir el archivo." };
  }
}

// ==========================================
// FUNCIÓN AUXILIAR: GENERAR AUDIO ROBUSTO (CHUNKING)
// ==========================================
async function generateRobustAudio(text: string): Promise<Buffer> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) throw new Error("API Key de Google TTS no configurada");

  const MAX_CHARS = 4000;

  // Si es corto, hacemos la petición normal (rápida)
  if (text.length <= MAX_CHARS) {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    const payload = {
      input: { text },
      voice: { languageCode: "es-US", name: "es-US-Chirp3-HD-Gacrux" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!data.audioContent) throw new Error("Fallo en Google TTS");

    return Buffer.from(data.audioContent, "base64");
  }

  // 🔥 SI ES LARGO: CHUNKING 🔥
  console.log("Texto largo detectado. Iniciando chunking...");

  // 1. Dividir por puntos para no cortar palabras a la mitad
  const sentences = text.split(/(?<=[.?!])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length < MAX_CHARS) {
      currentChunk += sentence + " ";
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + " ";
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());

  // 2. Pedir audios en paralelo (Promise.all) para no demorar tanto
  const audioBuffers: Buffer[] = await Promise.all(
    chunks.map(async (chunk) => {
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
      const payload = {
        input: { text: chunk },
        voice: { languageCode: "es-US", name: "es-US-Standard-B" },
        audioConfig: { audioEncoding: "MP3" },
      };
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return Buffer.from(data.audioContent, "base64");
    }),
  );

  // 3. Unir todos los buffers de MP3 en uno solo
  return Buffer.concat(audioBuffers);
}
