import rateLimit from 'express-rate-limit'

// Rate limiter geral — 100 req/min por IP
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em 1 minuto.', code: 'RATE_LIMIT' },
})

// Rate limiter para auth — 10 tentativas/15min por IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.', code: 'AUTH_RATE_LIMIT' },
  skipSuccessfulRequests: true,
})

// Rate limiter para criação de recursos — 60 req/min
export const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Limite de criação atingido. Tente novamente em breve.', code: 'CREATE_RATE_LIMIT' },
})
