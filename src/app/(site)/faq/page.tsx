import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Preguntas Frecuentes" };

const FAQ = [
  ["¿NeuroPlay diagnostica o trata el TDAH o el TEA?", "No. Es una herramienta de apoyo y seguimiento. No sustituye la evaluación ni el tratamiento de un profesional de la salud."],
  ["¿Para qué edades es?", "Está pensada para niños bajo supervisión de un adulto. La edad recomendada de cada actividad aparece en su ficha."],
  ["¿Quién puede ver el progreso del niño?", "Solo la cuenta del adulto que creó el perfil."],
  ["¿Cómo funcionan los cristales?", "Son la recompensa del juego: se ganan al completar misiones, lecciones y actividades y se gastan en avatares."],
  ["¿Puedo eliminar los datos de mi hijo?", "Sí. En Panel → Pacientes puedes eliminar el perfil; se borra también su historial de sesiones."],
  ["¿Funciona en tablet o celular?", "Sí, la mayoría de los juegos funcionan con el dedo; algunos admiten teclado en computador."],
  ["¿Cómo contacto a soporte?", "[REVISAR: correo o canal de soporte]."],
] as const;

export default function FaqPage() {
  return (
    <LegalPage title="Preguntas Frecuentes" updated="Noviembre de 2026" draft={false}>
      {FAQ.map(([q, a]) => (
        <div key={q}>
          <h2>{q}</h2>
          <p>{a}</p>
        </div>
      ))}
    </LegalPage>
  );
}
