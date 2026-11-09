import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/legal-page";
import { CLINICAL_DICTIONARY } from "@/lib/clinical-dictionary";

export const metadata: Metadata = { title: "Metodología Clínica" };

export default function MetodologiaPage() {
  return (
    <LegalPage title="Metodología Clínica" updated="Noviembre de 2026" draft={false}>
      <p>
        Los juegos de NeuroPlay se inspiran en tareas neuropsicológicas conocidas (Go/No-Go, N-Back, Flanker, Corsi, SDMT, PASAT, entre otras)
        adaptadas a un formato lúdico. <strong>Son adaptaciones recreativas: no son los tests originales, no están baremadas ni validadas
        clínicamente, y sus resultados no constituyen un diagnóstico.</strong> Sirven para entrenar y para observar la evolución de un niño en el tiempo,
        siempre junto al criterio de un profesional.
      </p>
      <h2>Los juegos y lo que observan</h2>
      <ul>
        {Object.values(CLINICAL_DICTIONARY).map((g: any) => (
          <li key={g.title}>
            <strong>{g.title}</strong> — {g.domain}. {g.description}
          </li>
        ))}
      </ul>
      <h2>Qué datos se registran</h2>
      <p>Aciertos, errores, tiempos de reacción y otras métricas propias de cada juego, por sesión. El adulto las ve en la ficha del cadete.</p>
      <p>
        ¿Dudas? Revisa las <Link className="underline" href="/faq">preguntas frecuentes</Link> y la{" "}
        <Link className="underline" href="/privacidad">política de privacidad</Link>.
      </p>
    </LegalPage>
  );
}
