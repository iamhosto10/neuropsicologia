// src/components/dashboard/edit-lesson-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Loader2,
  FileText,
  HelpCircle,
  Trash2,
  Image as ImageIcon,
  Music,
  AlignLeft,
  Bot,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getLessonForEditAction,
  updateLessonAction,
} from "@/app/actions/builder.actions";

export default function EditLessonModal({
  lessonId,
  courseId,
  existingModules = [],
}: {
  lessonId: string;
  courseId: string;
  existingModules?: string[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // ESTADOS DE CARGA Y DATOS
  const [isLoading, setIsLoading] = useState(false); // Carga inicial de datos
  const [isSubmitting, setIsSubmitting] = useState(false); // Guardado de cambios
  const [error, setError] = useState<string | null>(null);

  // ESTADOS DEL FORMULARIO
  const [lessonTitle, setLessonTitle] = useState("");
  const [blocks, setBlocks] = useState<any[]>([]);

  // ESTADOS DEL COMBOBOX DE MÓDULO (Esto por ahora no lo editaremos,
  // asumiremos que la lección ya pertenece a su módulo y no se mueve de ahí en este MVP.
  // Pero sí necesitamos recibir existingModules para pasarlo al backend si quisiéramos).

  // 1. Efecto para cargar los datos de la lección al abrir el modal
  useEffect(() => {
    async function loadLessonData() {
      if (isOpen && lessonId) {
        setIsLoading(true);
        setError(null);

        const result = await getLessonForEditAction(lessonId);

        if (result.success) {
          setLessonTitle(result.lessonTitle || "");
          setBlocks(result.blocks || []);
        } else {
          setError(result.error || "Error al cargar la lección.");
          setIsOpen(false); // Cerramos el modal si hay error crítico
        }
        setIsLoading(false);
      }
    }

    loadLessonData();
  }, [isOpen, lessonId]);

  // Funciones para gestionar bloques (idénticas a LessonBuilderModal)
  const addBlock = (type: string) => {
    const newId = Date.now().toString();
    const baseBlock = { id: newId, type };
    if (type === "lessonQuestion") {
      setBlocks([
        ...blocks,
        {
          ...baseBlock,
          question: "",
          options: ["", "", "", ""],
          correctOptionIndex: "0",
          reward: "10",
        },
      ]);
    } else if (type === "lessonOpenQuestion") {
      setBlocks([...blocks, { ...baseBlock, question: "", reward: "15" }]);
    } else if (type === "text") {
      setBlocks([...blocks, { ...baseBlock, text: "" }]);
    } else if (type === "image") {
      setBlocks([...blocks, { ...baseBlock }]);
    } else if (type === "lessonAudio") {
      setBlocks([...blocks, { ...baseBlock, title: "", scriptText: "" }]);
    }
  };

  const removeBlock = (id: string) =>
    setBlocks(blocks.filter((b) => b.id !== id));

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...blocks];
    if (direction === "up" && index > 0) {
      [newBlocks[index - 1], newBlocks[index]] = [
        newBlocks[index],
        newBlocks[index - 1],
      ];
    } else if (direction === "down" && index < newBlocks.length - 1) {
      [newBlocks[index + 1], newBlocks[index]] = [
        newBlocks[index],
        newBlocks[index + 1],
      ];
    }
    setBlocks(newBlocks);
  };

  const handleBlockChange = (id: string, field: string, value: any) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, [field]: value } : block,
      ),
    );
  };

  const handleOptionChange = (
    blockId: string,
    optionIndex: number,
    value: string,
  ) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === blockId) {
          const newOptions = [...block.options];
          newOptions[optionIndex] = value;
          return { ...block, options: newOptions };
        }
        return block;
      }),
    );
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append("contentBlocks", JSON.stringify(blocks));

    // 🔥 IMPORTANTE: Pasamos el lessonId al updateLessonAction
    const result = await updateLessonAction(lessonId, courseId, formData);

    if (result.success) {
      setIsOpen(false);
      router.refresh(); // Recargamos para ver los cambios en el syllabus
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* 🔥 Botón siempre visible, con sombra y borde sutil */}
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-8 w-8 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 border-slate-200 bg-white shadow-sm transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-200 max-h-[85vh] overflow-y-auto bg-slate-50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4 text-slate-500 font-medium">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-600" />
            Cargando datos de la lección...
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900">
                Editar Lección
              </DialogTitle>
              <DialogDescription>
                Modifica el título, reordena los bloques o actualiza el
                contenido interactivo.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-8 mt-4">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <Label htmlFor="lessonTitle" className="font-bold text-base">
                  Título de la Lección *
                </Label>
                <Input
                  id="lessonTitle"
                  name="lessonTitle"
                  value={lessonTitle} // Estado controlado
                  onChange={(e) => setLessonTitle(e.target.value)} // Estado controlado
                  placeholder="Ej. Técnicas de Respiración"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">
                  Contenido de la Lección
                </h3>

                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300"
                  >
                    <div className="absolute top-4 right-4 flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveBlock(index, "up")}
                        disabled={index === 0}
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => moveBlock(index, "down")}
                        disabled={index === blocks.length - 1}
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                      <div className="w-px h-4 bg-slate-200 mx-1"></div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBlock(block.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* TEXTO */}
                    {block.type === "text" && (
                      <div className="space-y-4 pr-32">
                        <div className="flex items-center gap-2 text-slate-700 font-bold mb-4">
                          <AlignLeft className="w-5 h-5" /> Párrafo de Texto
                        </div>
                        <Textarea
                          value={block.text}
                          onChange={(e) =>
                            handleBlockChange(block.id, "text", e.target.value)
                          }
                          placeholder="Escribe el contenido teórico aquí..."
                          className="min-h-25"
                          required
                        />
                      </div>
                    )}

                    {/* IMAGEN */}
                    {block.type === "image" && (
                      <div className="space-y-4 pr-32">
                        <div className="flex items-center gap-2 text-sky-600 font-bold mb-4">
                          <ImageIcon className="w-5 h-5" /> Imagen Visual
                        </div>
                        {block.imageUrl && (
                          <div className="aspect-video max-w-sm rounded-xl overflow-hidden border border-slate-100 mb-4 bg-slate-50">
                            <img
                              src={block.imageUrl}
                              alt="Imagen actual"
                              className="w-full h-full object-cover"
                            />
                            <p className="text-xs text-slate-500 p-2 text-center">
                              Imagen actual
                            </p>
                          </div>
                        )}
                        <Input
                          type="file"
                          name={`file_${block.id}`}
                          accept="image/*"
                          className="cursor-pointer file:text-sky-600"
                        />
                        <p className="text-xs text-slate-500 italic">
                          Sube un archivo nuevo para reemplazar la imagen
                          actual.
                        </p>
                      </div>
                    )}

                    {/* AUDIO GENERADO POR IA (TTS) */}
                    {block.type === "lessonAudio" && (
                      <div className="space-y-4 pr-32">
                        <div className="flex items-center gap-2 text-purple-600 font-bold mb-4">
                          <Bot className="w-5 h-5" /> Narración del Comandante
                          (Voz IA)
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Título o Instrucción Visible</Label>
                            <Input
                              value={block.title}
                              onChange={(e) =>
                                handleBlockChange(
                                  block.id,
                                  "title",
                                  e.target.value,
                                )
                              }
                              placeholder="Ej. Escucha la misión secreta"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Guion (Lo que la voz leerá)</Label>
                            <Textarea
                              value={block.scriptText}
                              onChange={(e) =>
                                handleBlockChange(
                                  block.id,
                                  "scriptText",
                                  e.target.value,
                                )
                              }
                              placeholder="Ej. Saludos Cadete..."
                              className="min-h-30 resize-y"
                              required
                            />
                            {block.audioUrl && (
                              <a
                                href={block.audioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                              >
                                🎧 Escuchar audio actual
                              </a>
                            )}
                            <p className="text-xs text-slate-500 italic mt-2">
                              Al guardar, el audio se regenerará si el guion
                              cambió.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PREGUNTA ABIERTA */}
                    {block.type === "lessonOpenQuestion" && (
                      <div className="space-y-4 pr-32">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
                          <FileText className="w-5 h-5" /> Pregunta Abierta
                        </div>
                        <Textarea
                          value={block.question}
                          onChange={(e) =>
                            handleBlockChange(
                              block.id,
                              "question",
                              e.target.value,
                            )
                          }
                          placeholder="Pregunta..."
                          required
                        />
                        <Input
                          type="number"
                          value={block.reward}
                          onChange={(e) =>
                            handleBlockChange(
                              block.id,
                              "reward",
                              e.target.value,
                            )
                          }
                          placeholder="Cristales"
                          className="w-1/3"
                        />
                      </div>
                    )}

                    {/* QUIZ */}
                    {block.type === "lessonQuestion" && (
                      <div className="space-y-4 pr-32">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4">
                          <HelpCircle className="w-5 h-5" /> Quiz Interactivo
                        </div>
                        <Input
                          value={block.question}
                          onChange={(e) =>
                            handleBlockChange(
                              block.id,
                              "question",
                              e.target.value,
                            )
                          }
                          placeholder="Pregunta..."
                          required
                        />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          {block.options.map((opt: string, optIdx: number) => (
                            <Input
                              key={optIdx}
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(
                                  block.id,
                                  optIdx,
                                  e.target.value,
                                )
                              }
                              placeholder={`Opción ${optIdx + 1}`}
                              required
                            />
                          ))}
                        </div>
                        <div className="flex gap-4 mt-4">
                          <select
                            className="flex h-10 w-full rounded-md border px-3 text-sm grow"
                            value={block.correctOptionIndex}
                            onChange={(e) =>
                              handleBlockChange(
                                block.id,
                                "correctOptionIndex",
                                e.target.value,
                              )
                            }
                          >
                            <option value="0">Opción 1 Correcta</option>{" "}
                            <option value="1">Opción 2 Correcta</option>
                            <option value="2">Opción 3 Correcta</option>{" "}
                            <option value="3">Opción 4 Correcta</option>
                          </select>
                          <Input
                            type="number"
                            value={block.reward}
                            onChange={(e) =>
                              handleBlockChange(
                                block.id,
                                "reward",
                                e.target.value,
                              )
                            }
                            placeholder="Cristales"
                            className="w-1/3"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {blocks.length === 0 && (
                  <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
                    Aún no hay contenido.
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addBlock("text")}
                  className="rounded-xl border-slate-300"
                >
                  📝 Texto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addBlock("image")}
                  className="rounded-xl border-sky-200 text-sky-700"
                >
                  🖼️ Imagen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addBlock("lessonAudio")}
                  className="rounded-xl border-purple-200 text-purple-700"
                >
                  🤖 Narración IA
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addBlock("lessonOpenQuestion")}
                  className="rounded-xl border-indigo-200 text-indigo-700"
                >
                  ✍️ Abierta
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addBlock("lessonQuestion")}
                  className="rounded-xl border-emerald-200 text-emerald-700"
                >
                  ❓ Quiz
                </Button>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-slate-50 pb-4 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || blocks.length === 0}
                  className="rounded-xl font-bold bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
