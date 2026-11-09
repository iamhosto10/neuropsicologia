import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Términos de Servicio" };

export default function TerminosPage() {
  return (
    <LegalPage title="Términos de Servicio" updated="Noviembre de 2026">
      <h2>1. Qué es NeuroPlay</h2>
      <p>
        NeuroPlay es una plataforma de entrenamiento cognitivo en formato de juegos, con seguimiento de desempeño para adultos.
        <strong> Es una herramienta de apoyo y seguimiento: no diagnostica, no trata ni reemplaza la evaluación o el criterio de un profesional de la salud.</strong>
      </p>
      <h2>2. Cuenta y responsabilidad del adulto</h2>
      <ul>
        <li>Debes ser mayor de edad y padre, madre, tutor o profesional autorizado para registrar al menor.</li>
        <li>Eres responsable de la confidencialidad de tu cuenta y de la veracidad de los datos.</li>
        <li>Los menores deben usar la plataforma bajo supervisión de un adulto.</li>
      </ul>
      <h2>3. Uso permitido</h2>
      <p>No está permitido manipular el sistema de recompensas, acceder a datos de otras cuentas, copiar el contenido con fines comerciales ni alterar el servicio.</p>
      <h2>4. Contenido y propiedad intelectual</h2>
      <p>Los juegos, cursos, textos, audios y marca son de NeuroPlay o de sus licenciantes. [REVISAR: titularidad de los audios generados con IA y de los informes].</p>
      <h2>5. Inteligencia artificial</h2>
      <p>Algunos audios de las lecciones se generan con síntesis de voz por IA. [REVISAR: aviso de transparencia de IA].</p>
      <h2>6. Planes, pagos y cancelación</h2>
      <p>[REVISAR: precios, periodos de prueba, reembolsos y cancelación, si aplican].</p>
      <h2>7. Limitación de responsabilidad</h2>
      <p>El servicio se presta «tal cual». [REVISAR: alcance y límites de responsabilidad conforme a la ley colombiana].</p>
      <h2>8. Ley aplicable</h2>
      <p>Estos términos se rigen por las leyes de la República de Colombia. [REVISAR: jurisdicción].</p>
    </LegalPage>
  );
}
