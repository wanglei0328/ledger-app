import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ledger-app/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor';
          if (id.includes('node_modules/echarts')) return 'echarts';
          if (id.includes('node_modules/dayjs')) return 'utils';
        },
      },
    },
    target: 'es2020',
    cssMinify: true,
  },
})
