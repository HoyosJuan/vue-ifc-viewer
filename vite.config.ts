import vue from '@vitejs/plugin-vue'
import dts from "vite-plugin-dts"
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      formats: ['es']
    },
    rollupOptions: {
      external: ["vue", "three", "openbim-components"],
      output: {
        assetFileNames: "assets/[name][extname]",
        entryFileNames: "[name].js",
        globals: {
          "vue": "Vue",
          "three": "THREE",
          "openbim-components": "OBC"
        }
      }
    }
  },
  plugins: [vue(), dts({include: ["lib"]})],
})
