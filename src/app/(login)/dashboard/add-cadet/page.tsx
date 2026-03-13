"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Rocket, UserPlus, Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import { createKidProfile } from "@/app/actions/profile.actions";

export default function AddCadetPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createKidProfile(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Panel
      </Link>

      <Card className="rounded-[2rem] border-none shadow-lg overflow-hidden bg-white">
        {/* Cabecera colorida */}
        <div className="bg-linear-to-r from-cyan-500 to-blue-500 p-8 text-center relative overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20px 20px, white 2%, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl relative z-10">
            <Rocket className="w-10 h-10 text-cyan-500" />
          </div>
          <CardTitle className="text-3xl font-black text-white relative z-10">
            Reclutar Nuevo Cadete
          </CardTitle>
          <p className="text-cyan-100 mt-2 relative z-10">
            Crea un perfil seguro y aislado para el entrenamiento cognitivo.
          </p>
        </div>

        <CardContent className="p-8">
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label
                htmlFor="alias"
                className="text-lg font-bold text-slate-700"
              >
                Alias o Nombre del Cadete
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <Input
                  id="alias"
                  name="alias"
                  placeholder="Ej. Comandante Leo"
                  className="pl-12 h-14 rounded-xl text-lg bg-slate-50 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500 transition-all"
                  required
                  maxLength={20}
                />
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-500" /> Los datos se
                guardan de forma privada.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold transition-transform active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creando Perfil...
                </>
              ) : (
                "Iniciar Entrenamiento"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
