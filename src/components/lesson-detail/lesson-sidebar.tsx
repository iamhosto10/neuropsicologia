import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, FileText, Share2 } from "lucide-react";

interface LessonSidebarProps {
  materials?: string[];
}

export function LessonSidebar({ materials }: LessonSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tu Progreso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completado</span>
            <span className="font-bold text-green-600">0%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full w-0 transition-all duration-500"></div>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Marcar como completado
          </Button>
        </CardContent>
      </Card>

      {/* Materials Card */}
      {materials && materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Materiales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-md border shadow-sm">
                    <FileText className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    {material}
                  </div>
                </div>
              </div>
            ))}
             <Button variant="outline" className="w-full gap-2 mt-4">
              <Download className="w-4 h-4" />
              Descargar todo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Share Card */}
      <Card>
        <CardContent className="p-6">
          <Button variant="ghost" className="w-full gap-2 text-slate-600">
            <Share2 className="w-4 h-4" />
            Compartir lección
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
