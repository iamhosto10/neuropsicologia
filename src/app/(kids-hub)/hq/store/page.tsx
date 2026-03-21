// src/app/(kids-hub)/hq/store/page.tsx
import { getActiveKidId } from "@/app/actions/profile.actions";
import { client } from "@/sanity/lib/client";
import { getKidDashboardQuery } from "@/sanity/lib/queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Battery, ShoppingCart } from "lucide-react";
import StoreClientController from "./store-client-controller";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const kidId = await getActiveKidId();
  if (!kidId) redirect("/select-profile");

  const today = new Date().toISOString().split("T")[0];

  // 1. Traemos los datos del cadete
  const kidData = await client
    .withConfig({ useCdn: false })
    .fetch(
      getKidDashboardQuery,
      { kidId, todayDate: today },
      { cache: "no-store" },
    );

  if (!kidData) redirect("/select-profile");

  // 🔥 2. Traemos el catálogo dinámico desde Sanity (ordenado por precio)
  const queryStore = `*[_type == "storeAvatar"] | order(price asc) {
    title,
    "slug": slug.current,
    description,
    price,
    category,
    "imageUrl": image.asset->url,
    isDefault
  }`;

  const sanityItems = await client
    .withConfig({ useCdn: false })
    .fetch(queryStore, {}, { cache: "no-store" });

  // 3. Mapeamos los datos para que el cliente los entienda fácil
  const catalog = sanityItems.map((item: any) => ({
    id: item.slug,
    name: item.title,
    cost: item.price,
    description: item.description,
    imageUrl: item.imageUrl,
    isDefault: item.isDefault,
    category: item.category,
  }));

  const unlocked = kidData.unlockedAvatars || ["default-cadet"];
  const active = kidData.activeAvatar || "default-cadet";

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 font-sans select-none text-slate-200">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        {/* Cabecera de la Tienda */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 border-4 border-slate-800 p-6 rounded-3xl shadow-xl gap-4 relative overflow-hidden">
          {/* Decoración sutil de fondo */}
          <div className="absolute top-0 right-20 opacity-5 pointer-events-none">
            <ShoppingCart className="w-48 h-48" />
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <Link
              href="/hq"
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors group"
            >
              <ArrowLeft className="w-6 h-6 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-white flex items-center gap-3">
                <ShoppingCart className="text-yellow-400" /> Bazar Espacial
              </h1>
              <p className="text-slate-400">
                Gasta tus cristales en mejoras para tu perfil.
              </p>
            </div>
          </div>

          {/* Saldo Actual */}
          <div className="bg-slate-950 border-2 border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-inner relative z-10">
            <span className="text-slate-400 font-bold uppercase text-sm tracking-wider">
              Tus Cristales
            </span>
            <div className="flex items-center gap-2 text-3xl font-black text-yellow-400 font-mono">
              <Battery className="w-8 h-8 fill-yellow-400/20" />{" "}
              {kidData.energyCrystals}
            </div>
          </div>
        </div>

        {/* Componente de Cliente que maneja la compra */}
        <StoreClientController
          kidId={kidId}
          currentBalance={kidData.energyCrystals}
          unlockedItems={unlocked}
          activeItem={active}
          catalog={catalog}
        />
      </div>
    </div>
  );
}
