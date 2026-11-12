import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { codeInspectorPlugin } from 'code-inspector-plugin'

export default defineConfig({
  plugins: [
    vue(),
    codeInspectorPlugin({
      bundler: 'vite',
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        members: 'members.html',
        publications: 'publications.html',
        profye: 'prof-ye.html',
      },
    },
  },
})
