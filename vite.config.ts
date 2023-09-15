import sonik from 'sonik/vite'
import { defineConfig } from 'vite'
import pages from '@sonikjs/cloudflare-pages'

export default defineConfig({
  ssr: {
    external: ['openai']
  },
  define: {
    'process.env': process.env
  },
  plugins: [
    sonik({
      devServer: {
        cf: {
          bindings: {
            OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
            BASE_URL: 'http://localhost:5173'
          }
        }
      }
    }),
    pages()
  ]
})
