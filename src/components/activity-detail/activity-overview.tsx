import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "../../lib/types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Clock,
  Users,
  BarChart,
  Play,
  Heart,
  Hammer,
  Lightbulb,
  CheckCircle2,
  Target,
} from "lucide-react";

const ActivityOverview = ({ activity }: { activity: Activity }) => {
  return (
    <div className="container mx-auto max-w-5xl px-6 lg:px-10 pt-36 pb-8 animate-in slide-in-from-bottom-5 fade-in duration-700">
      {/* A. Header Info */}
      <header>
        <Breadcrumb className="text-sm text-muted-foreground">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/actividades">Actividades</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{activity?.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl md:text-5xl font-extrabold text-black mt-2">
          {activity?.title}
        </h1>
        <p className="text-gray-600 mt-2">{activity?.description}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge className="bg-[oklch(var(--brand-cream))] text-gray-800 hover:bg-orange-100 rounded-full px-4 py-1">
            <Clock className="h-4 w-4 mr-1" />
            {activity?.duration} min
          </Badge>
          <Badge className="bg-[oklch(var(--brand-cream))] text-gray-800 hover:bg-orange-100 rounded-full px-4 py-1">
            <Users className="h-4 w-4 mr-1" />
            {activity?.ageRange}
          </Badge>
          <Badge className="bg-[oklch(var(--brand-cream))] text-gray-800 hover:bg-orange-100 rounded-full px-4 py-1">
            <BarChart className="h-4 w-4 mr-1" />
            {activity?.level}
          </Badge>
        </div>
      </header>

      {/* B. Media Player */}

      <div className="relative w-full h-72 md:h-98 lg:h-[550px] rounded-[2rem] overflow-hidden mt-8 shadow-md">
        <video
          className="w-full h-full object-cover"
          src={activity.video?.file.asset.url}
          controls
          preload="metadata"
        />
        <div className="absolute inset-0 pointer-events-none bg-black/10" />
      </div>

      {/* C. Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 mt-8">
        <Button className="w-full md:w-auto bg-[oklch(var(--brand-mustard))] text-black font-bold hover:bg-yellow-500 rounded-full text-lg h-12 px-8">
          Iniciar Actividad
        </Button>
        <Button
          variant="outline"
          className="w-full md:w-auto bg-white border shadow-sm rounded-full h-12 px-6"
        >
          <Heart className="h-5 w-5 mr-2" />
          Guardar en Favoritos
        </Button>
      </div>

      {/* D. Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
        {/* Card 1: Materiales */}
        <Card className="bg-white border-none shadow-sm p-6 rounded-3xl">
          <CardHeader className="flex flex-row items-center gap-4 p-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[oklch(var(--brand-blue-soft))]">
              <Hammer className="h-6 w-6 text-blue-800" />
            </div>
            <CardTitle>Materiales</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <ul className="space-y-2">
              {activity?.materials?.map((act, idx) => (
                <li className="flex items-center" key={idx}>
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Card 2: Objetivos */}
        <Card className="bg-white border-none shadow-sm p-6 rounded-3xl">
          <CardHeader className="flex flex-row items-center gap-4 p-0">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[oklch(var(--brand-purple-soft))]">
              <Lightbulb className="h-6 w-6 text-purple-800" />
            </div>
            <CardTitle>Objetivos</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <ul className="space-y-2">
              {activity?.objectives?.map((obj, idx) => (
                <li className="flex items-center">
                  <Target className="h-5 w-5 text-yellow-600 mr-2" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityOverview;
