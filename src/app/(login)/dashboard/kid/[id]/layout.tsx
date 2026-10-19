// src/app/(login)/dashboard/kid/[id]/layout.tsx
// Protege todas las vistas de un cadete (detalle, agenda, reportes, edición):
// solo su padre/terapeuta puede verlas.
import { notFound } from "next/navigation";
import { isKidOwnedByCurrentUser } from "@/lib/auth-guards";

export default async function KidLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await isKidOwnedByCurrentUser(id))) notFound();

  return <>{children}</>;
}
