// src/app/(login)/dashboard/kid/[id]/edit/page.tsx
import { client } from "@/sanity/lib/client";
import { updateKidProfile } from "@/app/actions/profile.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Rocket, Save } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import SubmitButton from "@/components/dashboard/submit-button";

export default async function EditCadetPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  // Traemos el alias actual del cadete
  const kid = await client.fetch(
    `*[_type == "kidProfile" && _id == $id][0]{ alias }`,
    { id },
  );

  if (!kid) {
    redirect("/dashboard/pacientes");
  }

  // Envolvemos la Server Action para pasarle el ID del niño
  const updateAction = async (formData: FormData) => {
    "use server";
    await updateKidProfile(id, formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <Link href="/dashboard/pacientes">
          <Button
            variant="ghost"
            className="pl-0 text-slate-500 hover:text-slate-900 mb-4 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Directorio
          </Button>
        </Link>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Rocket className="w-8 h-8 text-cyan-500" />
          Editar Cadete
        </h1>
        <p className="text-slate-500 mt-2">
          Actualiza la información de vuelo de este cadete.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <form action={updateAction} className="space-y-6">
          <div className="space-y-3">
            <label
              htmlFor="alias"
              className="text-sm font-bold text-slate-700 uppercase tracking-wide"
            >
              Alias o Nombre Espacial
            </label>
            <Input
              id="alias"
              name="alias"
              defaultValue={kid.alias}
              placeholder="Ej. Comandante Leo"
              required
              className="h-14 text-lg bg-slate-50 border-slate-200 focus-visible:ring-cyan-500 rounded-xl"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex gap-4 justify-end">
            <Link href="/dashboard/pacientes">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 rounded-xl font-bold"
              >
                Cancelar
              </Button>
            </Link>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
