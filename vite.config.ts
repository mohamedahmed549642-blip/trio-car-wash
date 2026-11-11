import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

function injectServiceWorkerAssets(): Plugin {
  return {
    name: 'inject-sw-assets',
    closeBundle() {
      const distDir = path.resolve('dist')
      const assetsDir = path.resolve(distDir, 'assets')
      const swPath = path.resolve(distDir, 'sw.js')

      if (fs.existsSync(assetsDir) && fs.existsSync(swPath)) {
        const files = fs.readdirSync(assetsDir)
        const assetPaths = files
          .filter((f) => f.endsWith('.js') || f.endsWith('.css') || f.endsWith('.svg'))
          .map((f) => `'/assets/${f}'`)

        let swContent = fs.readFileSync(swPath, 'utf-8')
        swContent = swContent.replace(
          '/* __VITE_ASSETS__ */',
          assetPaths.join(',\n  ')
        )
        fs.writeFileSync(swPath, swContent, 'utf-8')
        console.log(`[PWA] Injected ${assetPaths.length} build assets into dist/sw.js`)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    injectServiceWorkerAssets(),
  ],
})
