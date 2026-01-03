import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const activities = [
  {
    title: "Pintura Sensorial",
    tags: ["3-5 años", "20 min", "Bajo"],
  },
  {
    title: "Construcción con Bloques",
    tags: ["4-6 años", "30 min", "Medio"],
  },
  {
    title: "Caja de Tesoros",
    tags: ["2-4 años", "15 min", "Bajo"],
  },
];

const RelatedActivities = () => {
  return (
    <div className="container mx-auto max-w-5xl px-6 lg:px-10 py-4">
      <h2 className="text-3xl md:text-4xl font-bold text-left mb-8">
        Actividades Relacionadas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity, index) => (
          <Card
            key={activity.title}
            className={`
              bg-white rounded-3xl shadow-sm hover:shadow-md 
              animate-fade-in animate-slide-in-from-bottom pt-0 transition-all
              animate-delay-${1 + index + 100}
            `}
          >
            <div className="h-48 w-full bg-gray-200 rounded-t-3xl" />
            <CardHeader>
              <CardTitle>{activity.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row gap-2">
                {activity.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full bg-[oklch(var(--mint-green))] text-green-800"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatedActivities;
