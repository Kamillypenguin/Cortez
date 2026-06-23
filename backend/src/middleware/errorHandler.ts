import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    })
    return
  }

  // Erros do Prisma
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as unknown as { code: string; meta?: { target?: string[] } }
    if (prismaErr.code === 'P2002') {
      const field = prismaErr.meta?.target?.[0] ?? 'campo'
      res.status(409).json({ error: `${field} já está em uso`, code: 'DUPLICATE' })
      return
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({ error: 'Registro não encontrado', code: 'NOT_FOUND' })
      return
    }
  }

  console.error('[ERROR]', err)
  res.status(500).json({ error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' })
}
