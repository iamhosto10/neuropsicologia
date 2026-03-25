import type { Metadata } from "next";
import ClientPage from "./clientpage";

export const metadata: Metadata = {
  title: "Test de Juegos Cognitivos | Sandbox",
  description:
    "Página de prueba para visualizar juegos cognitivos en diferentes niveles de dificultad: atención, memoria, control inhibitorio y más.",
  robots: {
    index: false,
    follow: false,
  },
};
const Page = () => {
  return (
    <div className="flex flex-col gap-1 max-w-4xl px-11 pt-17 mx-auto bg-background">
      {/* Contenedor relativo para controlar el tamaño */}
      <h1 className="text-4xl font-bold text-primary mb-4">
        Página para testear los juegos en distintas dificultades
      </h1>
      <ClientPage />
    </div>
  );
};

export default Page;
