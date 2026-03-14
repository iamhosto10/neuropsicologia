import { currentUser, auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { getKidsByParentQuery } from "@/sanity/lib/queries";
import { selectKidProfile } from "@/app/actions/profile.actions";
import { Shield, Rocket, UserPlus, LogOut } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { getAvatarIcon } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SelectProfilePage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const user = await currentUser();
  const sanityUserId = `user-${user?.id}`;

  // 3. Buscamos los hijos de este padre
  const kids = await client.withConfig({ useCdn: false }).fetch(
    getKidsByParentQuery,
    {
      parentSanityId: sanityUserId,
    },
    { cache: "no-store" },
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      {/* Fondo espacial sutil */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #334155 0%, #020617 100%)",
        }}
      />

      <div className="z-10 text-center w-full max-w-4xl animate-in fade-in zoom-in duration-700">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tight">
          ¿Quién va a jugar hoy?
        </h1>

        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {/* Mapeamos los perfiles de los niños */}
          {kids.map((kid: any) => (
            <form
              key={kid._id}
              action={async () => {
                "use server";
                await selectKidProfile(kid._id);
              }}
            >
              <button className="group flex flex-col items-center gap-4 transition-transform hover:scale-110 focus:outline-none hover:cursor-pointer">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-slate-800 border-4 border-slate-700 group-hover:border-cyan-400 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center transition-all overflow-hidden relative">
                  <div className="text-6xl group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300 drop-shadow-md">
                    {getAvatarIcon(kid.activeAvatar)}
                  </div>
                  <div className="absolute bottom-0 w-full bg-slate-900/80 py-1 text-xs font-mono text-yellow-400 border-t border-slate-700">
                    ⚡ {kid.energyCrystals}
                  </div>
                </div>
                <span className="text-xl md:text-2xl font-bold text-slate-400 group-hover:text-white transition-colors">
                  {kid.alias}
                </span>
              </button>
            </form>
          ))}

          <a
            href="/dashboard/add-cadet"
            className="group flex flex-col items-center gap-4 transition-transform hover:scale-110 focus:outline-none"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-transparent border-4 border-dashed border-slate-700 group-hover:border-slate-500 flex items-center justify-center transition-all">
              <UserPlus className="w-12 h-12 text-slate-600 group-hover:text-slate-400" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-slate-600 group-hover:text-slate-400 transition-colors">
              Añadir Perfil
            </span>
          </a>
        </div>

        {/* Controles de Padre */}
        <div className="flex justify-center gap-6 border-t border-slate-800 pt-8">
          <a
            href="/dashboard"
            className="text-slate-500 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Rocket className="w-5 h-5" /> Área de Padres
          </a>
          <span className="text-slate-800">|</span>
          <SignOutButton>
            <button className="text-slate-500 hover:text-red-400 flex items-center gap-2 transition-colors">
              <LogOut className="w-5 h-5" /> Cerrar Sesión
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
