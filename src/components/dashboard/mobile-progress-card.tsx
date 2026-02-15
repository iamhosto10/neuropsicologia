import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MobileProgressCard() {
  return (
    <Card className="block md:hidden mb-6 bg-gradient-to-r from-orange-100 to-amber-50 border-orange-200 shadow-sm">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--brand-mustard)] p-2 rounded-full text-white shadow-sm">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-900">¡Vas muy bien!</h3>
            <p className="text-xs text-amber-700 font-medium">80% completado</p>
          </div>
        </div>
        <Link
            href="/dashboard/progress"
            className="flex items-center justify-center h-8 w-8 rounded-full bg-white text-amber-600 shadow-sm hover:bg-amber-50 transition-colors"
        >
            <ChevronRight className="h-5 w-5" />
        </Link>
      </CardContent>
    </Card>
  );
}
