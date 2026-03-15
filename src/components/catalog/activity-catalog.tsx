// src/components/catalog/activity-catalog.tsx
"use client";

import { useState } from "react";
import { Search, Clock, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
    <section className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto mb-12 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar actividades por nombre o categoría..."
          className="pl-12 h-14 rounded-2xl bg-white shadow-sm border-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredActivities.map((activity) => (
          <Link
            key={activity._id}
            href={`/actividades/${activity.slug}`}
            className="group"
          >
            <Card className="rounded-3xl border-none shadow-sm hover:shadow-xl transition-all overflow-hidden h-full flex flex-col bg-white hover:-translate-y-1">
              <div className="h-48 relative bg-slate-100 overflow-hidden">
                <img
                  src={activity.imageUrl || "/placeholder-image.jpg"}
                  alt={activity.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 text-slate-800 hover:bg-white border-none shadow-sm">
                  {activity.category}
                </Badge>
              </div>
              <CardContent className="p-6 flex flex-col grow">
                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                  {activity.title}
                </h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 grow">
                  {activity.description}
                </p>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-4 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-cyan-500" />{" "}
                    {activity.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-purple-500" />{" "}
                    {activity.ageRange}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <p className="text-center text-slate-500 py-12 font-bold text-lg">
          No hay actividades disponibles.
        </p>
      )}
    </section>
  );
}
