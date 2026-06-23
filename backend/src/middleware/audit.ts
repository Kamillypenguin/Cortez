import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import prisma from '../prisma'

export function auditLog(acao: string, entidade: string) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    next()
    // Log de forma não-bloqueante após resposta
    if (req.user?.id) {
      setImmediate(() => {
        prisma.auditLog.create({
          data: {
            usuarioId: req.user!.id,
            acao,
            entidade,
            entidadeId: req.params['id'] as string | undefined,
            dados: req.method !== 'GET' ? JSON.stringify(req.body ?? null) : null,
            ip: req.ip ?? req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
          },
        }).catch(() => {}) // Nunca bloqueia a requisição por falha de audit
      })
    }
  }
}

// Log manual: usado nos controllers
export async function logAction(
  usuarioId: string,
  acao: string,
  entidade: string,
  entidadeId?: string,
  dados?: object,
  ip?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { usuarioId, acao, entidade, entidadeId, dados: dados ? JSON.stringify(dados) : undefined, ip },
    })
  } catch {
    // Silently fail — audit nunca deve quebrar o fluxo principal
  }
}
