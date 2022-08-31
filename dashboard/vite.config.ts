import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  optimizeDeps: {
    include: [
      '@unlock-protocol/networks',
      '@unlock-protocol/unlock-assets',
      'ethers',
    ],
  },
  build: {
    ssr: false,
    target: ['esnext'],
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
