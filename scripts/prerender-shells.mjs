/**
 * Static hosts without a rewrite rule return their own 404 page for unknown
 * paths, so a client-side route like /shop breaks on refresh or when the link
 * is shared directly. This post-build step writes the app shell to the real
 * path of every route, letting a plain file server resolve it (the service
 * worker of static hosting, so to speak: no runtime dependency).
 */
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dist = path.join(root, 'dist')
const shellPath = path.join(dist, 'index.html')

if (!fs.existsSync(shellPath)) {
  console.error('postbuild: dist/index.html not found — run `vite build` first')
  process.exit(1)
}

const shell = fs.readFileSync(shellPath, 'utf8')

// Slugs are read from the data module so the shells never drift from the catalogue.
const source = fs.readFileSync(path.join(root, 'src/data/products.js'), 'utf8')
const slugs = [...source.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])

const routes = ['shop', ...slugs.map((slug) => `product/${slug}`)]

let written = 0
for (const route of routes) {
  const dir = path.join(dist, route)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), shell)
  written += 1
}

console.log(`postbuild: wrote ${written} route shells (${routes.length} routes)`)
