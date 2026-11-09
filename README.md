This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Calidad: pruebas y CI

```bash
npm run check   # tipos + lint (sin errores) + pruebas unitarias/regresión (Vitest)
npm run e2e     # pruebas de punta a punta (Playwright): rutas públicas, legales y protección de rutas
node --env-file=.env.local scripts/migrate-kid-defaults.mjs          # vista previa de la migración de perfiles
node --env-file=.env.local scripts/migrate-kid-defaults.mjs --apply  # aplica (revisar la vista previa antes)
```

- `tests/`: pruebas de regresión con un Sanity falso en memoria (recompensas, carreras, borrado en cascada, webhook, reportes, juegos).
- `e2e/`: se ejecutan en escritorio y en iPad (viewport y táctil emulados) y no necesitan una cuenta.
- `.github/workflows/ci.yml`: el job `check` corre siempre; el job `e2e` solo corre si el repositorio tiene los secretos `E2E_CLERK_PUBLISHABLE_KEY` y `E2E_CLERK_SECRET_KEY` (una instancia de Clerk **de desarrollo**).
- Editar el catálogo de cursos requiere rol `admin`/`therapist` en Clerk (`publicMetadata.role`) o el id en la variable `CONTENT_EDITOR_USER_IDS`.
