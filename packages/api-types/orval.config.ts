import { defineConfig } from 'orval'

export default defineConfig({
  statusBackendSchema: {
    input: {
      target: './openapi/status.openapi.json',
    },
    output: {
      target: './src/generated/backend/status.zod.ts',
      client: 'zod',
      mode: 'single',
    },
  },
  statusFrontendHooks: {
    input: {
      target: './openapi/status.openapi.json',
    },
    output: {
      target: '../../apps/frontend/src/features/status/api/generated/status.ts',
      schemas: '../../apps/frontend/src/features/status/api/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      mode: 'split',
      override: {
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
})
