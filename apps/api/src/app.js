import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from './config/env.js'
import { authRouter } from './routes/auth.js'
import { meRouter } from './routes/me.js'
import uploadRouter from './routes/upload.js'
import mediaRouter from './routes/media.js'
import stripeRouter from './routes/payments/stripe.js'
import paypalRouter from './routes/payments/paypal.js'
import emailsRouter from './routes/emails.js'
import quotaRouter from './routes/quota.js'

const app = express()

// Helmet: keep strong defaults in prod; relax only what blocks local dev (HMR, iframes, etc.)
if (config.NODE_ENV === 'development') {
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  )
} else {
  app.use(helmet())
}

// CORS: CSV from env ALLOWED_ORIGINS, credentials enabled for httpOnly cookies
const allowed = new Set(config.ALLOWED_ORIGINS || [])
const corsOptions = {
  origin(origin, callback) {
    // allow same-origin or non-browser clients (no Origin header)
    if (!origin) return callback(null, true)
    if (allowed.has(origin)) return callback(null, true)
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

app.get('/healthz', (req, res) => res.json({ ok: true }))

app.use('/auth', authRouter)
app.use('/', meRouter)
app.use('/', uploadRouter)
app.use('/', mediaRouter)
app.use('/', stripeRouter)
app.use('/', paypalRouter)
app.use('/', emailsRouter)
app.use('/', quotaRouter)

// Global error handler (hide internals in prod)
app.use((err, req, res, _next) => {
  const status = 500
  const msg = config.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  res.status(status).json({ error: msg })
})

export default app
