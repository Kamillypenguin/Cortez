import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

// Rotas
import authRouter     from './routes/auth'
import userRouter     from './routes/user'
import ambientesRouter from './routes/ambientes'
import tasksRouter    from './routes/tasks'
import eventsRouter   from './routes/events'
import documentsRouter from './routes/documents'
import chatiaRouter      from './routes/chatia'
import projetosRouter   from './routes/projetos'
import comentariosRouter from './routes/comentarios'
import mindmapsRouter   from './routes/mindmaps'
import riscosRouter     from './routes/riscos'

// Middlewares
import { generalLimiter } from './middleware/rateLimiter'
import { errorHandler }   from './middleware/errorHandler'

const app = express()
const PORT = process.env.PORT || 3001

// ── Segurança ─────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true)
    } else {
      const allowed = (process.env.ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim())
      if (allowed.includes(origin)) callback(null, true)
      else callback(new Error('CORS bloqueado: ' + origin))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiter global
app.use(generalLimiter)

// Confiança em proxy reverso (nginx, etc.)
app.set('trust proxy', 1)

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0.0' })
})

// ── Rotas ─────────────────────────────────────────────────────────────────────
app.use('/auth',             authRouter)
app.use('/api/user',         userRouter)
app.use('/api/ambientes',    ambientesRouter)
app.use('/api/tasks',        tasksRouter)
app.use('/api/events',       eventsRouter)
app.use('/api/documents',    documentsRouter)
app.use('/api/chatia',       chatiaRouter)
app.use('/api/projetos',    projetosRouter)
app.use('/api/comentarios', comentariosRouter)
app.use('/api/mindmaps',   mindmapsRouter)
app.use('/api/riscos',     riscosRouter)

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada', code: 'NOT_FOUND' })
})

// Handler global de erros
app.use(errorHandler)

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 OrganizerAgend API v2.0 — http://localhost:${PORT}`)
  console.log(`   Auth:       /auth/login | /auth/register | /auth/refresh`)
  console.log(`   OAuth:      /auth/google | /auth/microsoft`)
  console.log(`   Usuário:    /api/user/profile | /api/user/dashboard`)
  console.log(`   Ambientes:  /api/ambientes`)
  console.log(`   Tarefas:    /api/tasks`)
  console.log(`   Eventos:    /api/events`)
  console.log(`   Documentos: /api/documents`)
  console.log(`   Chat IA:    /api/chatia`)
  console.log(`   Projetos:   /api/projetos`)
  console.log(`   Comentários:/api/comentarios\n`)
})

export default app
