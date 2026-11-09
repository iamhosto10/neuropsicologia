import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Iniciar sesión" };

// Inicio de sesión DENTRO de la app (en vez del portal externo *.accounts.dev): evita el salto
// entre dominios, que en desarrollo y en navegadores embebidos entraba en bucles de redirección.
export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </main>
  );
}
