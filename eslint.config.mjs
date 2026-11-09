import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Reglas que quedan como ADVERTENCIA (deuda técnica conocida, no errores de compilación):
  //  - no-explicit-any: ~130 usos en páginas del panel; se tipan por etapas.
  //  - set-state-in-effect / immutability / exhaustive-deps: patrón de temporizadores de los
  //    motores de juego (probado en vivo); refactorizarlos a ciegas arriesga la partida.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
