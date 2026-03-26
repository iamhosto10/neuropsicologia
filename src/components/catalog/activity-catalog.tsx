// src/components/catalog/activity-catalog.tsx
"use client";

import { useState } from "react";
import { Search, Clock, Users, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ActivityCatalog({
  initialActivities = [],
}: {
  initialActivities?: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredActivities = initialActivities.filter(
    (act) =>
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full">
      {/* Buscador unificado (Mismo estilo que cursos) */}
      <div className="max-w-md mx-auto mb-12 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar actividades por nombre o categoría..."
          className="pl-12 h-14 rounded-2xl bg-white shadow-sm border-slate-200 text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredActivities.map((activity) => (
          <Card
            key={activity._id}
            className="group relative rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col bg-white hover:-translate-y-1 w-full h-full"
          >
            {/* El Link envuelve el interior para ser semánticamente correcto */}
            <Link
              href={`/actividades/${activity.slug}`}
              className="w-full h-full flex flex-col focus:outline-none"
            >
              <div className="h-48 relative bg-slate-100 overflow-hidden shrink-0">
                <img
                  src={activity.imageUrl || "/placeholder-image.jpg"}
                  alt={activity.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {activity.category && (
                  <Badge className="absolute top-4 left-4 bg-white/90 text-slate-800 hover:bg-white border-none shadow-sm font-bold pointer-events-none">
                    {activity.category}
                  </Badge>
                )}
              </div>

              <div className="p-6 flex flex-col grow">
                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {activity.title}
                </h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-3 grow leading-relaxed">
                  {activity.description}
                </p>

                <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-4 border-t border-slate-100 mt-auto w-full">
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-500" />{" "}
                      {activity.duration} min
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-500" />{" "}
                      {activity.ageRange}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <p className="text-xl font-bold">No se encontraron actividades.</p>
          <p>
            Intenta buscar con otra palabra o añade actividades en Sanity
            Studio.
          </p>
        </div>
      )}
    </div>
  );
}
