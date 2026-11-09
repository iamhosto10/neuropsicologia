import { redirect } from "next/navigation";
import { canEditContent } from "@/lib/auth-guards";

// Solo editores de contenido pueden crear cursos (la página es un componente cliente).
export const metadata = { title: "Nuevo Curso" };

export default async function NuevoCursoLayout({ children }: { children: React.ReactNode }) {
  if (!(await canEditContent())) redirect("/dashboard/cursos");
  return <>{children}</>;
}
