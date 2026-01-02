import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const activities = [
  {
    title: 'Pintura Sensorial',
    tags: ['3-5 años', '20 min', 'Bajo'],
  },
  {
    title: 'Construcción con Bloques',
    tags: ['4-6 años', '30 min', 'Medio'],
  },
  {
    title: 'Caja de Tesoros',
    tags: ['2-4 años', '15 min', 'Bajo'],
  },
];

const PopularActivities = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity, index) => (
          <Card
            key={activity.title}
            className={`
              bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow
              animate-fade-in animate-slide-in-from-bottom
              ${index === 0 ? 'animate-delay-100' : ''}
              ${index === 1 ? 'animate-delay-200' : ''}
              ${index === 2 ? 'animate-delay-300 md:col-span-2 lg:col-span-1' : ''}
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

export default PopularActivities;
