import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { peerDependencies, dependencies } from './package.json'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const isCDN = Boolean(process.env?.IS_CDN || false)

const external = [
  ...Object.keys(peerDependencies),
  ...Object.keys(dependencies),
]

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ['es2020', 'esnext'],
    outDir: isCDN ? 'dist/cdn' : 'dist',
    lib: {
      entry: path.resolve(__dirname, 'lib/index.tsx'),
      name: '@unlock-protocol/ui',
      fileName: (format) => `index.${format}.js`,
      formats: isCDN ? ['umd'] : ['es'],
    },
    rollupOptions: {
      external: [
        ...(isCDN ? Object.keys(peerDependencies) : external),
        'react/jsx-runtime',
      ],
      shimMissingExports: true,
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'style.css'
          }
          return assetInfo.name ?? 'asset'
        },
        exports: 'named',
        ...(isCDN
          ? {}
          : {
              preserveModules: true,
              preserveModulesRoot: 'lib',
              format: 'es',
            }),
      },
    },
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      requireReturnsDefault: 'auto',
    },
  },
  plugins: [
    tsconfigPaths(),
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
        ],
      },
    }),
    svgr(),
    nodePolyfills({
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './lib'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
})
