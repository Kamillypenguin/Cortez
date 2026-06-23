import { Router, Request, Response, NextFunction } from 'express'
import { authService } from '../services/AuthService'
import { authLimiter } from '../middleware/rateLimiter'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { rotateRefreshToken } from '../utils/jwt'

const router = Router()

// POST /auth/register
router.post('/register', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nome, email, senha, cargo } = req.body
    if (!nome || !email || !senha) {
      res.status(400).json({ error: 'nome, email e senha são obrigatórios' }); return
    }
    const result = await authService.register({ nome, email, senha, cargo })
    res.status(201).json(result)
  } catch (err) { next(err) }
})

// POST /auth/login
router.post('/login', authLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, senha } = req.body
    if (!email || !senha) {
      res.status(400).json({ error: 'email e senha são obrigatórios' }); return
    }
    const result = await authService.login({ email, senha }, req.ip)
    res.json(result)
  } catch (err) { next(err) }
})

// POST /auth/refresh — trocar refresh token por novo par
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) { res.status(400).json({ error: 'refreshToken é obrigatório' }); return }
    const tokens = await rotateRefreshToken(refreshToken)
    res.json(tokens)
  } catch (err) { next(err) }
})

// POST /auth/logout
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.user!.id, req.ip)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// GET /auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user })
})

// ── OAuth Google ──────────────────────────────────────────────────────────────
// Para ativar: configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env
router.get('/google', (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) { res.status(501).json({ error: 'Login Google não configurado' }); return }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3001/auth/google/callback',
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
  })
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

router.get('/google/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query
    if (!code) { res.status(400).json({ error: 'Código de autorização não fornecido' }); return }

    // Troca code por tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3001/auth/google/callback',
        grant_type: 'authorization_code',
      }),
    })
    const tokenData = await tokenRes.json() as { access_token: string }

    // Busca perfil
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile = await profileRes.json() as { sub: string; email: string; name: string; picture: string }

    const result = await authService.oauthLogin({
      provider: 'google',
      providerId: profile.sub,
      email: profile.email,
      nome: profile.name,
      fotoPerfil: profile.picture,
    })

    // Redireciona para o frontend com tokens
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
    res.redirect(`${frontendUrl}/oauth-callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`)
  } catch (err) { next(err) }
})

// ── OAuth Microsoft ───────────────────────────────────────────────────────────
router.get('/microsoft', (_req: Request, res: Response) => {
  const clientId = process.env.MICROSOFT_CLIENT_ID
  if (!clientId) { res.status(501).json({ error: 'Login Microsoft não configurado' }); return }
  const tenant = process.env.MICROSOFT_TENANT ?? 'common'
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: process.env.MICROSOFT_CALLBACK_URL ?? 'http://localhost:3001/auth/microsoft/callback',
    response_type: 'code',
    scope: 'openid email profile User.Read',
  })
  res.redirect(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params}`)
})

router.get('/microsoft/callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query
    if (!code) { res.status(400).json({ error: 'Código não fornecido' }); return }
    const tenant = process.env.MICROSOFT_TENANT ?? 'common'

    const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        redirect_uri: process.env.MICROSOFT_CALLBACK_URL ?? 'http://localhost:3001/auth/microsoft/callback',
        grant_type: 'authorization_code',
      }),
    })
    const tokenData = await tokenRes.json() as { access_token: string }

    const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile = await profileRes.json() as { id: string; mail: string; displayName: string }

    const result = await authService.oauthLogin({
      provider: 'microsoft',
      providerId: profile.id,
      email: profile.mail,
      nome: profile.displayName,
    })

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
    res.redirect(`${frontendUrl}/oauth-callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`)
  } catch (err) { next(err) }
})

export default router
