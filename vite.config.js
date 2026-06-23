import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only: serve any /api/<name> from the SAME handler file Vercel uses, so
// `npm run dev` exercises the full flow without needing `vercel dev`. The key is
// read server-side here from .env.local and never reaches the client bundle.
// In production, Vercel runs the api/*.js files directly and this is ignored.
function devApi(env) {
  return {
    name: 'coachcast-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()

        const name = req.url.split('?')[0].replace(/^\/api\//, '').replace(/\/+$/, '')
        if (!/^[a-z0-9-]+$/.test(name)) return next() // no path traversal

        // make the env var visible to the serverless handler in dev
        if (env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

        let raw = ''
        for await (const chunk of req) raw += chunk
        try {
          req.body = raw ? JSON.parse(raw) : {}
        } catch {
          req.body = {}
        }

        // shim Vercel's res.status().json() onto the Node response
        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (obj) => {
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(obj))
          return res
        }

        try {
          const mod = await import(`./api/${name}.js`)
          await mod.default(req, res)
        } catch (e) {
          if (!res.writableEnded) {
            res.status(e?.code === 'ERR_MODULE_NOT_FOUND' ? 404 : 500).json({ error: 'Dev API error.' })
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // load all env (incl. non-VITE_ vars) for the dev middleware only
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), devApi(env)],
  }
})
