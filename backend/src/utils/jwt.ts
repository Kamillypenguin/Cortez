import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import prisma from '../prisma'
import { AppError } from '../middleware/errorHandler'

const ACCESS_SECRET = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET! + '_refresh'
const ACCESS_EXPIRES = '1h'
const REFRESH_EXPIRES_DAYS = 30

export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId, type: 'access' }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES })
}

export function verifyAccessToken(token: string): { userId: string } {
  const payload = jwt.verify(token, ACCESS_SECRET) as { userId: string; type: string }
  if (payload.type !== 'access') throw new Error('Token inválido')
  return { userId: payload.userId }
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = uuid()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS)

  await prisma.refreshToken.create({ data: { token, usuarioId: userId, expiresAt } })
  return token
}

export async function rotateRefreshToken(oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const record = await prisma.refreshToken.findUnique({ where: { token: oldToken } })

  if (!record || record.revogado || record.expiresAt < new Date()) {
    // Revogar todos os tokens do usuário se token inválido foi usado (detecção de roubo)
    if (record) {
      await prisma.refreshToken.updateMany({ where: { usuarioId: record.usuarioId }, data: { revogado: true } })
    }
    throw new AppError('Refresh token inválido ou expirado', 401, 'INVALID_REFRESH_TOKEN')
  }

  // Revogar o token usado
  await prisma.refreshToken.update({ where: { token: oldToken }, data: { revogado: true } })

  // Gerar novo par de tokens
  const accessToken = generateAccessToken(record.usuarioId)
  const refreshToken = await generateRefreshToken(record.usuarioId)
  return { accessToken, refreshToken }
}

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({ where: { usuarioId: userId }, data: { revogado: true } })
}
