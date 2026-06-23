import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only: serve /api/generate-recap from the SAME handler Vercel uses, so
// `npm run dev` exercises the full flow without needing `vercel dev`. The key is
// read server-side here from .env.local and never reaches the client bundle.
// In production, Vercel runs api/generate-recap.js directly and this is ignored.
function devApi(env) {
  return {
    name: 'coachcast-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/generate-recap', async (req, res) => {
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

        const { default: handler } = await import('./api/generate-recap.js')
        try {
          await handler(req, res)
        } catch {
          if (!res.writableEnded) res.status(500).json({ error: 'Dev API error.' })
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
