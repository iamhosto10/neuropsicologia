import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Política de Privacidad" };

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de Tratamiento de Datos Personales" updated="Noviembre de 2026">
      <p>
        NeuroPlay ([REVISAR: razón social y NIT], en adelante «NeuroPlay») es responsable del tratamiento de los datos personales
        recolectados en esta plataforma, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 (Colombia). Contacto:{" "}
        [REVISAR: correo y dirección de contacto para consultas y reclamos].
      </p>
      <h2>1. Datos que tratamos</h2>
      <ul>
        <li><strong>Del adulto (padre, madre, tutor o terapeuta):</strong> nombre, correo electrónico y datos de la cuenta.</li>
        <li><strong>Del menor (cadete):</strong> alias que el adulto elige, cristales y avatares, misiones asignadas y completadas, y métricas de desempeño en los juegos (aciertos, errores, tiempos de reacción), respuestas a preguntas de las lecciones y reflexiones de actividades.</li>
      </ul>
      <p>No pedimos el nombre completo, documento de identidad, fotografías ni ubicación del menor. Recomendamos usar un alias.</p>
      <h2>2. Datos de menores</h2>
      <p>
        Los datos del menor solo se tratan con autorización de su padre, madre o representante legal, quien los registra al crear el
        perfil, y en atención al interés superior del niño. El adulto declara tener la facultad de dar esa autorización. Las métricas pueden
        constituir información relacionada con la salud; por eso son de acceso restringido a la cuenta del adulto que creó el perfil.
      </p>
      <h2>3. Finalidades</h2>
      <ul>
        <li>Prestar el servicio: asignar misiones, registrar el progreso y mostrar reportes al adulto.</li>
        <li>Seguridad, soporte y mejora del servicio.</li>
        <li>[REVISAR: cualquier otra finalidad (analítica, comunicaciones), con su base de autorización].</li>
      </ul>
      <p>NeuroPlay no vende datos personales ni los usa para publicidad dirigida a menores.</p>
      <h2>4. Proveedores y transferencia</h2>
      <p>
        Usamos proveedores tecnológicos que pueden tratar datos fuera de Colombia: autenticación (Clerk), base de datos y contenidos (Sanity),
        alojamiento (Vercel) y síntesis de voz (Google Cloud). [REVISAR: confirmar países, contratos y cláusulas de transferencia].
      </p>
      <h2>5. Derechos del titular</h2>
      <p>
        Puedes conocer, actualizar, rectificar y suprimir los datos, revocar la autorización y presentar consultas o reclamos escribiendo a
        [REVISAR: correo]. Desde el panel puedes eliminar el perfil de un cadete, lo que borra también su historial de sesiones.
      </p>
      <h2>6. Conservación y seguridad</h2>
      <p>
        Conservamos los datos mientras exista la cuenta o el perfil. Al eliminar un perfil se borran sus sesiones; al eliminar la cuenta se
        borran sus cadetes. Aplicamos controles de acceso por cuenta. [REVISAR: plazos de copias de seguridad y medidas adicionales].
      </p>
      <h2>7. Cambios</h2>
      <p>Publicaremos aquí cualquier modificación de esta política.</p>
    </LegalPage>
  );
}
