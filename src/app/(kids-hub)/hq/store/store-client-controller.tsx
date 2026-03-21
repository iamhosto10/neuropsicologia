// src/app/(kids-hub)/hq/store/store-client-controller.tsx
"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, Check, Lock, Sparkles, Loader2, User } from "lucide-react";
import { purchaseItem, equipItem } from "@/app/actions/store.actions";
import { Badge } from "@/components/ui/badge";

export default function StoreClientController({
  kidId,
  currentBalance,
  unlockedItems,
  activeItem,
  catalog,
}: any) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBuy = (itemId: string, cost: number) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await purchaseItem(kidId, itemId, cost);
      if (res?.error) {
        setErrorMsg(res.error);
        // Opcional: Aquí podrías reproducir 'error-buzz.mp3'
      } else {
        // Opcional: Aquí podrías reproducir 'combo-powerup.mp3' o 'access-granted.mp3'
      }
    });
  };

  const handleEquip = (itemId: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await equipItem(kidId, itemId);
      if (res?.error) setErrorMsg(res.error);
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "suit":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "helmet":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "pet":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div>
      {errorMsg && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6 font-bold text-center border border-red-500/50 animate-in fade-in zoom-in slide-in-from-top-4">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
        {catalog.map((item: any) => {
          // El item está desbloqueado si su ID está en el array o si es el objeto por defecto
          const isUnlocked = unlockedItems.includes(item.id) || item.isDefault;
          const isActive = activeItem === item.id;
          const canAfford = currentBalance >= item.cost;

          return (
            <Card
              key={item.id}
              className={`rounded-[2rem] border-4 overflow-hidden relative transition-all duration-300 group ${
                isActive
                  ? "border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-[1.02]"
                  : isUnlocked
                    ? "border-slate-700 hover:border-slate-600 bg-slate-800/80"
                    : "border-slate-800/50 bg-slate-900/50 hover:border-slate-700"
              }`}
            >
              {/* Etiqueta de Equipado */}
              {isActive && (
                <div className="absolute top-4 right-4 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1.5 rounded-full flex items-center gap-1 z-20 shadow-lg">
                  <Check className="w-3 h-3" /> Equipado
                </div>
              )}

              {/* Candado visual gigante si está bloqueado */}
              {!isUnlocked && (
                <div className="absolute top-4 right-4 z-20 bg-slate-950/80 p-2 rounded-full border border-slate-800 backdrop-blur-sm">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
              )}

              <CardContent className="p-0 flex flex-col h-full">
                {/* Visual del Objeto (La Imagen) */}
                <div
                  className={`h-48 flex items-center justify-center relative overflow-hidden ${!isUnlocked ? "bg-slate-900" : "bg-slate-800/50"}`}
                >
                  {/* Destello de fondo si está desbloqueado */}
                  {isUnlocked && (
                    <div className="absolute inset-0 bg-radial-[at_50%_50%] from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  )}

                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className={`h-36 object-contain z-10 transition-all duration-500 ${
                        !isUnlocked
                          ? "grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-70 blur-[1px] group-hover:blur-none"
                          : "drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover:scale-110"
                      }`}
                    />
                  ) : (
                    <User
                      className={`w-24 h-24 ${!isUnlocked ? "text-slate-800" : "text-slate-600"} z-10`}
                    />
                  )}
                </div>

                {/* Info y Controles */}
                <div className="p-6 grow flex flex-col relative z-10 bg-slate-900/90 border-t border-slate-800">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <h3
                      className={`text-xl font-bold ${!isUnlocked ? "text-slate-400" : "text-white"}`}
                    >
                      {item.name}
                    </h3>
                    {item.category && (
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold tracking-wider ${getCategoryColor(item.category)}`}
                      >
                        {item.category === "suit"
                          ? "Traje"
                          : item.category === "helmet"
                            ? "Casco"
                            : item.category === "pet"
                              ? "Mascota"
                              : "Objeto"}
                      </Badge>
                    )}
                  </div>

                  <p className="text-slate-500 text-sm mb-6 grow line-clamp-2">
                    {item.description}
                  </p>

                  {/* Lógica de los Botones */}
                  {isUnlocked ? (
                    <Button
                      disabled={isActive || isPending}
                      onClick={() => handleEquip(item.id)}
                      className={`w-full h-12 rounded-xl text-lg font-bold transition-all ${
                        isActive
                          ? "bg-slate-800/50 text-slate-600 border border-slate-700/50"
                          : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]"
                      }`}
                    >
                      {isActive ? "En Uso" : "Equipar Objeto"}
                    </Button>
                  ) : (
                    <Button
                      disabled={!canAfford || isPending}
                      onClick={() => handleBuy(item.id, item.cost)}
                      className={`w-full h-12 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${
                        canAfford
                          ? "bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-[0_0_20px_-5px_rgba(234,179,8,0.5)] hover:scale-[1.02]"
                          : "bg-slate-900 text-slate-600 border border-slate-800"
                      }`}
                    >
                      {isPending ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        <>
                          {canAfford ? (
                            <Sparkles className="w-5 h-5" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                          Comprar{" "}
                          <Battery className="w-4 h-4 ml-1 fill-current opacity-80" />{" "}
                          {item.cost}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
