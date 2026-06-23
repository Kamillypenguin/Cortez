import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'
import prisma from '../prisma'

export interface AuthRequest extends Request {
  user?: {
    id: string
    nome: string
    email: string
    fotoPerfil: string | null
    cargo: string | null
    status: string
  }
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido', code: 'NO_TOKEN' })
    return
  }

  try {
    const token = authHeader.split(' ')[1]
    const { userId } = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, email: true, fotoPerfil: true, cargo: true, status: true },
    })

    if (!user) {
      res.status(401).json({ error: 'Usuário não encontrado', code: 'USER_NOT_FOUND' })
      return
    }

    if (user.status === 'bloqueado') {
      res.status(403).json({ error: 'Conta bloqueada. Contate o suporte.', code: 'ACCOUNT_BLOCKED' })
      return
    }

    // Atualiza último acesso de forma não-bloqueante
    prisma.user.update({
      where: { id: userId },
      data: { ultimoAcesso: new Date() },
    }).catch(() => {})

    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token inválido ou expirado', code: 'INVALID_TOKEN' })
  }
}

// Versão opcional: não bloqueia, apenas injeta o usuário se token presente
export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      const { userId } = verifyAccessToken(token)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, nome: true, email: true, fotoPerfil: true, cargo: true, status: true },
      })
      if (user) req.user = user
    } catch {}
  }
  next()
}
