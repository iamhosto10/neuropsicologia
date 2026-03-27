// src/components/dashboard/lesson-builder-modal.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   PlusCircle,
//   Loader2,
//   FileText,
//   HelpCircle,
//   Trash2,
//   Image as ImageIcon,
//   Music,
//   AlignLeft,
//   Bot,
//   ArrowUp,
//   ArrowDown,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { createLessonAction } from "@/app/actions/builder.actions";

// // 🔥 Añadimos existingModules a las props
// export default function LessonBuilderModal({
//   courseId,
//   existingModules = [],
// }: {
//   courseId: string;
//   existingModules?: string[];
// }) {
//   const router = useRouter();
//   const [isOpen, setIsOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [blocks, setBlocks] = useState<any[]>([]);

//   const addBlock = (type: string) => {
//     const newId = Date.now().toString();
//     const baseBlock = { id: newId, type };

//     if (type === "lessonQuestion") {
//       setBlocks([
//         ...blocks,
//         {
//           ...baseBlock,
//           question: "",
//           options: ["", "", "", ""],
//           correctOptionIndex: "0",
//           reward: "10",
//         },
//       ]);
//     } else if (type === "lessonOpenQuestion") {
//       setBlocks([...blocks, { ...baseBlock, question: "", reward: "15" }]);
//     } else if (type === "text") {
//       setBlocks([...blocks, { ...baseBlock, text: "" }]);
//     } else if (type === "image") {
//       setBlocks([...blocks, { ...baseBlock }]);
//     } else if (type === "lessonAudio") {
//       setBlocks([...blocks, { ...baseBlock, title: "", scriptText: "" }]);
//     }
//   };

//   const removeBlock = (id: string) =>
//     setBlocks(blocks.filter((b) => b.id !== id));

//   const moveBlock = (index: number, direction: "up" | "down") => {
//     const newBlocks = [...blocks];
//     if (direction === "up" && index > 0) {
//       [newBlocks[index - 1], newBlocks[index]] = [
//         newBlocks[index],
//         newBlocks[index - 1],
//       ];
//     } else if (direction === "down" && index < newBlocks.length - 1) {
//       [newBlocks[index + 1], newBlocks[index]] = [
//         newBlocks[index],
//         newBlocks[index + 1],
//       ];
//     }
//     setBlocks(newBlocks);
//   };

//   const handleBlockChange = (id: string, field: string, value: any) => {
//     setBlocks(
//       blocks.map((block) =>
//         block.id === id ? { ...block, [field]: value } : block,
//       ),
//     );
//   };

//   const handleOptionChange = (
//     blockId: string,
//     optionIndex: number,
//     value: string,
//   ) => {
//     setBlocks(
//       blocks.map((block) => {
//         if (block.id === blockId) {
//           const newOptions = [...block.options];
//           newOptions[optionIndex] = value;
//           return { ...block, options: newOptions };
//         }
//         return block;
//       }),
//     );
//   };

//   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     setIsSubmitting(true);
//     setError(null);

//     const formData = new FormData(event.currentTarget);
//     formData.append("contentBlocks", JSON.stringify(blocks));

//     // 🔥 Extraemos el nombre del módulo directamente del formulario
//     const moduleTitle = formData.get("moduleTitle") as string;

//     const result = await createLessonAction(courseId, moduleTitle, formData);

//     if (result.success) {
//       setIsOpen(false);
//       setBlocks([]);
//       router.refresh();
//     } else {
//       setError(result.error);
//     }
//     setIsSubmitting(false);
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <DialogTrigger asChild>
//         <Button className="w-full h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-600/20">
//           <PlusCircle className="w-5 h-5 mr-2" /> Añadir Lección
//         </Button>
//       </DialogTrigger>

//       <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto bg-slate-50">
//         <DialogHeader>
//           <DialogTitle className="text-2xl font-black text-slate-900">
//             Crear Nueva Lección
//           </DialogTitle>
//           <DialogDescription>
//             Construye el contenido interactivo y multimedia.
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-8 mt-4">
//           {error && (
//             <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium">
//               {error}
//             </div>
//           )}

//           {/* 🔥 SECCIÓN DE MÓDULO Y TÍTULO DIVIDIDA */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//               <Label htmlFor="moduleTitle" className="font-bold text-base">
//                 Nombre del Módulo *
//               </Label>
//               <Input
//                 id="moduleTitle"
//                 name="moduleTitle"
//                 list="existing-modules" // Conecta con el datalist
//                 placeholder="Ej. Módulo 1: Introducción"
//                 required
//                 autoComplete="off"
//                 className="h-12"
//               />
//               <datalist id="existing-modules">
//                 {existingModules.map((mod, i) => (
//                   <option key={i} value={mod} />
//                 ))}
//               </datalist>
//               <p className="text-xs text-slate-500">
//                 Escribe uno nuevo o selecciona de la lista.
//               </p>
//             </div>

//             <div className="space-y-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//               <Label htmlFor="lessonTitle" className="font-bold text-base">
//                 Título de la Lección *
//               </Label>
//               <Input
//                 id="lessonTitle"
//                 name="lessonTitle"
//                 placeholder="Ej. Técnicas de Respiración"
//                 required
//                 className="h-12"
//               />
//             </div>
//           </div>

//           <div className="space-y-4">
//             <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">
//               Contenido de la Lección
//             </h3>

//             {blocks.map((block, index) => (
//               <div
//                 key={block.id}
//                 className="relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300"
//               >
//                 <div className="absolute top-4 right-4 flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => moveBlock(index, "up")}
//                     disabled={index === 0}
//                     className="h-8 w-8 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
//                   >
//                     <ArrowUp className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => moveBlock(index, "down")}
//                     disabled={index === blocks.length - 1}
//                     className="h-8 w-8 text-slate-400 hover:text-indigo-600 disabled:opacity-30"
//                   >
//                     <ArrowDown className="w-4 h-4" />
//                   </Button>
//                   <div className="w-px h-4 bg-slate-200 mx-1"></div>
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="icon"
//                     onClick={() => removeBlock(block.id)}
//                     className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>

//                 {/* TEXTO */}
//                 {block.type === "text" && (
//                   <div className="space-y-4 pr-32">
//                     <div className="flex items-center gap-2 text-slate-700 font-bold mb-4">
//                       <AlignLeft className="w-5 h-5" /> Párrafo de Texto
//                     </div>
//                     <Textarea
//                       value={block.text}
//                       onChange={(e) =>
//                         handleBlockChange(block.id, "text", e.target.value)
//                       }
//                       placeholder="Escribe el contenido teórico aquí..."
//                       className="min-h-[100px]"
//                       required
//                     />
//                   </div>
//                 )}

//                 {/* IMAGEN */}
//                 {block.type === "image" && (
//                   <div className="space-y-4 pr-32">
//                     <div className="flex items-center gap-2 text-sky-600 font-bold mb-4">
//                       <ImageIcon className="w-5 h-5" /> Imagen Visual
//                     </div>
//                     <Input
//                       type="file"
//                       name={`file_${block.id}`}
//                       accept="image/*"
//                       required
//                       className="cursor-pointer file:text-sky-600"
//                     />
//                   </div>
//                 )}

//                 {/* AUDIO GENERADO POR IA (TTS) */}
//                 {block.type === "lessonAudio" && (
//                   <div className="space-y-4 pr-32">
//                     <div className="flex items-center gap-2 text-purple-600 font-bold mb-4">
//                       <Bot className="w-5 h-5" /> Narración del Comandante (Voz
//                       IA)
//                     </div>
//                     <div className="space-y-4">
//                       <div className="space-y-2">
//                         <Label>Título o Instrucción Visible</Label>
//                         <Input
//                           value={block.title}
//                           onChange={(e) =>
//                             handleBlockChange(block.id, "title", e.target.value)
//                           }
//                           placeholder="Ej. Escucha la misión secreta"
//                           required
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label>Guion (Lo que la voz leerá)</Label>
//                         <Textarea
//                           value={block.scriptText}
//                           onChange={(e) =>
//                             handleBlockChange(
//                               block.id,
//                               "scriptText",
//                               e.target.value,
//                             )
//                           }
//                           placeholder="Ej. Saludos Cadete..."
//                           className="min-h-[120px] resize-y"
//                           required
//                         />
//                         <p className="text-xs text-slate-500 italic">
//                           Este texto será convertido a audio automáticamente.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* PREGUNTA ABIERTA */}
//                 {block.type === "lessonOpenQuestion" && (
//                   <div className="space-y-4 pr-32">
//                     <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
//                       <FileText className="w-5 h-5" /> Pregunta Abierta
//                     </div>
//                     <Textarea
//                       value={block.question}
//                       onChange={(e) =>
//                         handleBlockChange(block.id, "question", e.target.value)
//                       }
//                       placeholder="Pregunta..."
//                       required
//                     />
//                     <Input
//                       type="number"
//                       value={block.reward}
//                       onChange={(e) =>
//                         handleBlockChange(block.id, "reward", e.target.value)
//                       }
//                       placeholder="Cristales"
//                       className="w-1/3"
//                     />
//                   </div>
//                 )}

//                 {/* QUIZ */}
//                 {block.type === "lessonQuestion" && (
//                   <div className="space-y-4 pr-32">
//                     <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4">
//                       <HelpCircle className="w-5 h-5" /> Quiz Interactivo
//                     </div>
//                     <Input
//                       value={block.question}
//                       onChange={(e) =>
//                         handleBlockChange(block.id, "question", e.target.value)
//                       }
//                       placeholder="Pregunta..."
//                       required
//                     />
//                     <div className="grid grid-cols-2 gap-4 mt-4">
//                       {block.options.map((opt: string, optIdx: number) => (
//                         <Input
//                           key={optIdx}
//                           value={opt}
//                           onChange={(e) =>
//                             handleOptionChange(block.id, optIdx, e.target.value)
//                           }
//                           placeholder={`Opción ${optIdx + 1}`}
//                           required
//                         />
//                       ))}
//                     </div>
//                     <div className="flex gap-4 mt-4">
//                       <select
//                         className="flex h-10 w-full rounded-md border px-3 text-sm grow"
//                         value={block.correctOptionIndex}
//                         onChange={(e) =>
//                           handleBlockChange(
//                             block.id,
//                             "correctOptionIndex",
//                             e.target.value,
//                           )
//                         }
//                       >
//                         <option value="0">Opción 1 Correcta</option>{" "}
//                         <option value="1">Opción 2 Correcta</option>
//                         <option value="2">Opción 3 Correcta</option>{" "}
//                         <option value="3">Opción 4 Correcta</option>
//                       </select>
//                       <Input
//                         type="number"
//                         value={block.reward}
//                         onChange={(e) =>
//                           handleBlockChange(block.id, "reward", e.target.value)
//                         }
//                         placeholder="Cristales"
//                         className="w-1/3"
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}

//             {blocks.length === 0 && (
//               <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
//                 Aún no hay contenido.
//               </div>
//             )}
//           </div>

//           <div className="flex flex-wrap gap-3">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => addBlock("text")}
//               className="rounded-xl border-slate-300"
//             >
//               📝 Texto
//             </Button>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => addBlock("image")}
//               className="rounded-xl border-sky-200 text-sky-700"
//             >
//               🖼️ Imagen
//             </Button>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => addBlock("lessonAudio")}
//               className="rounded-xl border-purple-200 text-purple-700"
//             >
//               🤖 Narración IA
//             </Button>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => addBlock("lessonOpenQuestion")}
//               className="rounded-xl border-indigo-200 text-indigo-700"
//             >
//               ✍️ Abierta
//             </Button>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => addBlock("lessonQuestion")}
//               className="rounded-xl border-emerald-200 text-emerald-700"
//             >
//               ❓ Quiz
//             </Button>
//           </div>

//           <div className="pt-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-slate-50 pb-4 z-10">
//             <Button
//               type="button"
//               variant="ghost"
//               onClick={() => setIsOpen(false)}
//               className="rounded-xl"
//             >
//               Cancelar
//             </Button>
//             <Button
//               type="submit"
//               disabled={isSubmitting || blocks.length === 0}
//               className="rounded-xl font-bold bg-cyan-600 hover:bg-cyan-700 text-white"
//             >
//               {isSubmitting ? (
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               ) : (
//                 "Guardar Lección"
//               )}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// src/components/dashboard/lesson-builder-modal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
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
import { createLessonAction } from "@/app/actions/builder.actions";

export default function LessonBuilderModal({
  courseId,
  existingModules = [],
}: {
  courseId: string;
  existingModules?: string[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);

  // 🔥 NUEVOS ESTADOS PARA EL AUTOCOMPLETE DEL MÓDULO
  const [moduleSearch, setModuleSearch] = useState("");
  const [showModuleSuggestions, setShowModuleSuggestions] = useState(false);

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

    // El nombre lo toma directamente del input que ahora está controlado por el estado moduleSearch
    const moduleTitle = formData.get("moduleTitle") as string;

    const result = await createLessonAction(courseId, moduleTitle, formData);

    if (result.success) {
      setIsOpen(false);
      setBlocks([]);
      setModuleSearch(""); // Limpiamos la búsqueda también
      router.refresh();
    } else {
      setError(result.error);
    }
    setIsSubmitting(false);
  }

  // Filtrar módulos para mostrar en el dropdown
  const filteredModules = existingModules.filter((mod) =>
    mod.toLowerCase().includes(moduleSearch.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-12 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-600/20">
          <PlusCircle className="w-5 h-5 mr-2" /> Añadir Lección
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-200 max-h-[85vh] overflow-y-auto bg-slate-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900">
            Crear Nueva Lección
          </DialogTitle>
          <DialogDescription>
            Construye el contenido interactivo y multimedia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 mt-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 🔥 EL NUEVO COMBOBOX MEJORADO PARA EL MÓDULO 🔥 */}
            <div className="space-y-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <Label htmlFor="moduleTitle" className="font-bold text-base">
                Nombre del Módulo *
              </Label>
              <div className="relative">
                <Input
                  id="moduleTitle"
                  name="moduleTitle"
                  placeholder="Ej. Módulo 1: Introducción"
                  required
                  autoComplete="off"
                  className="h-12 w-full"
                  value={moduleSearch}
                  onChange={(e) => {
                    setModuleSearch(e.target.value);
                    setShowModuleSuggestions(true);
                  }}
                  onFocus={() => setShowModuleSuggestions(true)}
                  // Un pequeño retraso en el onBlur para permitir que el click en la lista registre primero
                  onBlur={() =>
                    setTimeout(() => setShowModuleSuggestions(false), 200)
                  }
                />

                {/* LA LISTA DESPLEGABLE FLOTANTE */}
                {showModuleSuggestions && filteredModules.length > 0 && (
                  <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-auto py-1 animate-in fade-in slide-in-from-top-2">
                    {filteredModules.map((mod, i) => (
                      <li
                        key={i}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-slate-700 font-medium transition-colors border-b border-slate-50 last:border-0"
                        onClick={() => {
                          setModuleSearch(mod);
                          setShowModuleSuggestions(false);
                        }}
                      >
                        {mod}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Escribe un nombre nuevo o selecciona uno existente.
              </p>
            </div>

            <div className="space-y-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <Label htmlFor="lessonTitle" className="font-bold text-base">
                Título de la Lección *
              </Label>
              <Input
                id="lessonTitle"
                name="lessonTitle"
                placeholder="Ej. Técnicas de Respiración"
                required
                className="h-12"
              />
            </div>
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
                    <Input
                      type="file"
                      name={`file_${block.id}`}
                      accept="image/*"
                      required
                      className="cursor-pointer file:text-sky-600"
                    />
                  </div>
                )}

                {/* AUDIO GENERADO POR IA (TTS) */}
                {block.type === "lessonAudio" && (
                  <div className="space-y-4 pr-32">
                    <div className="flex items-center gap-2 text-purple-600 font-bold mb-4">
                      <Bot className="w-5 h-5" /> Narración del Comandante (Voz
                      IA)
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Título o Instrucción Visible</Label>
                        <Input
                          value={block.title}
                          onChange={(e) =>
                            handleBlockChange(block.id, "title", e.target.value)
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
                        <p className="text-xs text-slate-500 italic">
                          Este texto será convertido a audio automáticamente.
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
                        handleBlockChange(block.id, "question", e.target.value)
                      }
                      placeholder="Pregunta..."
                      required
                    />
                    <Input
                      type="number"
                      value={block.reward}
                      onChange={(e) =>
                        handleBlockChange(block.id, "reward", e.target.value)
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
                        handleBlockChange(block.id, "question", e.target.value)
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
                            handleOptionChange(block.id, optIdx, e.target.value)
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
                          handleBlockChange(block.id, "reward", e.target.value)
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
                "Guardar Lección"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
