import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts', 'tests/unit/**/*.test.tsx', 'tests/unit/**/*.test.ts'],
    css: false,
    // Cap worker concurrency — running all ~90 files fully in parallel starves
    // the Local API integration test (real Postgres connection) of CPU and
    // causes its beforeAll hook to time out under load.
    maxWorkers: 4,
    server: {
      deps: {
        inline: [/@payloadcms/, /next-intl/],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/payload-types.ts',
        'src/**/*.d.ts',
        'src/migrations/**',
        'src/seed/**',
        'src/endpoints/seed/**',
        'src/app/\\(payload\\)/**',
        'src/components/AdminLogo/**',
        'src/components/BeforeDashboard/**',
        'src/payload.config.ts',
        'src/**/config.ts',
      ],
    },
  },
})
