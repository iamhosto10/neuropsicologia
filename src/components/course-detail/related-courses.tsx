import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Image from 'next/image';

const courses = [
  {
    title: 'Neuropsicología Infantil',
    category: 'Infantil',
    imageUrl: '/placeholder-image.jpg',
  },
  {
    title: 'Evaluación de Funciones Ejecutivas',
    category: 'Evaluación',
    imageUrl: '/placeholder-image.jpg',
  },
  {
    title: 'Rehabilitación Cognitiva en Adultos',
    category: 'Rehabilitación',
    imageUrl: '/placeholder-image.jpg',
  },
  {
    title: 'Terapia de Lenguaje',
    category: 'Terapia',
    imageUrl: '/placeholder-image.jpg',
  },
  {
    title: 'Neurociencia Afectiva',
    category: 'Neurociencia',
    imageUrl: '/placeholder-image.jpg',
  },
];

// Placeholder Course Card component to match the description
function CourseCard({ title, category, imageUrl, className }: { title: string; category: string; imageUrl: string; className?: string }) {
  return (
    <Card className={`overflow-hidden rounded-3xl shadow-sm hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <CardContent className="p-0">
        <div className="relative h-48 w-full">
          <Image src={imageUrl} alt={title} fill style={{ objectFit: 'cover' }} />
        </div>
      </CardContent>
      <CardFooter className="p-4 flex-col items-start">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <Badge variant="secondary">{category}</Badge>
      </CardFooter>
    </Card>
  );
}


export function RelatedCourses() {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6">Quizás también te interese...</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.slice(0, 5).map((course, index) => (
          <CourseCard
            key={course.title}
            title={course.title}
            category={course.category}
            imageUrl={course.imageUrl}
            // Apply special class for the 3rd item on tablet view
            className={index === 2 ? 'md:col-span-2 lg:col-span-1' : ''}
          />
        ))}
      </div>
    </div>
  );
}
