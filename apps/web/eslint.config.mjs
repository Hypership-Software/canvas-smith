import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

// Next.js 16 removed the `next lint` command; linting now runs through the
// ESLint CLI (`eslint .`). This flat config layers Next's Core Web Vitals and
// TypeScript rule sets on top of ESLint's defaults.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override the default ignores from eslint-config-next.
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
