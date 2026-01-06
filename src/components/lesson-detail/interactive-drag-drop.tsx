import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const InteractiveDragDrop = () => {
  return (
    <Card className="overflow-hidden rounded-2xl border-gray-100 shadow-sm">
      <CardHeader className="bg-yellow-50 p-4 rounded-t-2xl">
        <h3 className="text-lg font-bold text-yellow-900">
          Crea una cara feliz
        </h3>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center gap-6">
        <div className="w-48 h-48 rounded-full border-4 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-center p-4">
          Zona de soltar
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Badge
            variant="outline"
            className="bg-white shadow-md border px-4 py-2 rounded-full cursor-grab hover:scale-105 active:cursor-grabbing transition-transform"
          >
            Ojos Brillantes
          </Badge>
          <Badge
            variant="outline"
            className="bg-white shadow-md border px-4 py-2 rounded-full cursor-grab hover:scale-105 active:cursor-grabbing transition-transform"
          >
            Gran Sonrisa
          </Badge>
          <Badge
            variant="outline"
            className="bg-white shadow-md border px-4 py-2 rounded-full cursor-grab hover:scale-105 active:cursor-grabbing transition-transform"
          >
            Nariz
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
