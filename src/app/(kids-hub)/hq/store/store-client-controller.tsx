// src/app/(kids-hub)/hq/store/store-client-controller.tsx
"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, Check, Lock, Sparkles, Loader2 } from "lucide-react";
import { purchaseItem, equipItem } from "@/app/actions/store.actions";

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
      if (res?.error) setErrorMsg(res.error);
    });
  };

  const handleEquip = (itemId: string) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await equipItem(kidId, itemId);
      if (res?.error) setErrorMsg(res.error);
    });
  };

  return (
    <div>
      {errorMsg && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-xl mb-6 font-bold text-center border border-red-500/50">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {catalog.map((item: any) => {
          const isUnlocked = unlockedItems.includes(item.id);
          const isActive = activeItem === item.id;
          const canAfford = currentBalance >= item.cost;

          return (
            <Card
              key={item.id}
              className={`rounded-[2rem] border-4 overflow-hidden relative transition-all ${isActive ? "border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]" : "border-slate-800 hover:border-slate-700"} bg-slate-900`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 bg-cyan-500 text-slate-950 text-xs font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 z-10">
                  <Check className="w-3 h-3" /> Equipado
                </div>
              )}

              <CardContent className="p-0 flex flex-col h-full">
                {/* Visual del Objeto */}
                <div className="h-40 bg-slate-800/50 flex flex-col items-center justify-center relative">
                  <span className="text-7xl drop-shadow-2xl filter group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </span>
                </div>

                {/* Info y Controles */}
                <div className="p-6 grow flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 grow">
                    {item.description}
                  </p>

                  {isUnlocked ? (
                    <Button
                      disabled={isActive || isPending}
                      onClick={() => handleEquip(item.id)}
                      className={`w-full h-12 rounded-xl text-lg font-bold transition-all ${isActive ? "bg-slate-800 text-slate-500" : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg"}`}
                    >
                      {isActive ? "En Uso" : "Equipar"}
                    </Button>
                  ) : (
                    <Button
                      disabled={!canAfford || isPending}
                      onClick={() => handleBuy(item.id, item.cost)}
                      className={`w-full h-12 rounded-xl text-lg font-bold flex items-center justify-center gap-2 transition-all ${canAfford ? "bg-yellow-500 hover:bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/20" : "bg-slate-800 text-slate-500"}`}
                    >
                      {isPending ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        <>
                          {canAfford ? (
                            <Sparkles className="w-5 h-5" />
                          ) : (
                            <Lock className="w-5 h-5" />
                          )}
                          Comprar por {item.cost}{" "}
                          <Battery className="w-4 h-4" />
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
