import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Crear cuenta" };

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </main>
  );
}
