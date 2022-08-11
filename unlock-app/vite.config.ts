import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import GlobalPolyfills from '@esbuild-plugins/node-globals-polyfill'
import commonjs from 'vite-plugin-commonjs'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    commonjs(),
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-styled-components',
            {
              ssr: false,
              pure: true,
              displayName: true,
              fileName: false,
            },
          ],
        ],
      },
    }),
  ],
  define: {
    Buffer: Buffer,
    process: process,
  },
  resolve: {
    conditions: ['browser', 'module'],
    alias: {
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      http: 'rollup-plugin-node-polyfills/polyfills/http',
      https: 'rollup-plugin-node-polyfills/polyfills/http',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        // @ts-expect-error - type mismatch
        GlobalPolyfills({
          buffer: true,
          process: true,
        }),
      ],
    },
    include: [
      '@unlock-protocol/networks',
      'ethers',
      '@unlock-protocol/unlock-assets',
    ],
  },
  build: {
    target: ['esnext'],
    ssr: false,
    commonjsOptions: {
      include: [
        /@unlock-protocol\/networks/,
        /@unlock-protocol\/unlock-assets/,
        /node_modules/,
        /ethers/,
      ],
    },
  },
})
