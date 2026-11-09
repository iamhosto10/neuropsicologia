import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// "/dashboard" solo protegía la ruta exacta; las subrutas quedaban abiertas.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/hq(.*)",
  "/misiones(.*)",
  "/select-profile",
  // Sandboxes de juegos (además se ocultan en producción)
  "/test",
  "/juegos",
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  // Las rutas protegidas mandan a /sign-in de ESTA app (no al portal externo accounts.dev)
  { signInUrl: "/sign-in", signUpUrl: "/sign-up" },
);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
