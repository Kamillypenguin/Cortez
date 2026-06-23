import prisma from '../prisma'
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password'
import { generateAccessToken, generateRefreshToken, revokeAllRefreshTokens } from '../utils/jwt'
import { AppError } from '../middleware/errorHandler'
import { logAction } from '../middleware/audit'

export interface RegisterDTO {
  nome: string
  email: string
  senha: string
  cargo?: string
  fotoPerfil?: string
}

export interface LoginDTO {
  email: string
  senha: string
}

export interface OAuthDTO {
  provider: 'google' | 'microsoft'
  providerId: string
  email: string
  nome: string
  fotoPerfil?: string
}

export interface AuthResult {
  user: {
    id: string; nome: string; email: string
    fotoPerfil: string | null; cargo: string | null; status: string
  }
  accessToken: string
  refreshToken: string
}

export class AuthService {

  async register(dto: RegisterDTO): Promise<AuthResult> {
    const { valid, message } = validatePasswordStrength(dto.senha)
    if (!valid) throw new AppError(message!, 400, 'WEAK_PASSWORD')

    const existing = await prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })
    if (existing) throw new AppError('E-mail já cadastrado', 409, 'EMAIL_EXISTS')

    const senhaHash = await hashPassword(dto.senha)
    const user = await prisma.user.create({
      data: {
        nome: dto.nome.trim(),
        email: dto.email.toLowerCase().trim(),
        senhaHash,
        cargo: dto.cargo,
        fotoPerfil: dto.fotoPerfil,
        provider: 'email',
      },
      select: { id: true, nome: true, email: true, fotoPerfil: true, cargo: true, status: true },
    })

    await logAction(user.id, 'CREATE', 'User', user.id, { email: user.email })

    const accessToken = generateAccessToken(user.id)
    const refreshToken = await generateRefreshToken(user.id)
    return { user, accessToken, refreshToken }
  }

  async login(dto: LoginDTO, ip?: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    })

    if (!user || !user.senhaHash) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS')
    }

    if (user.status === 'bloqueado') {
      throw new AppError('Conta bloqueada. Entre em contato com o suporte.', 403, 'ACCOUNT_BLOCKED')
    }

    const valid = await verifyPassword(dto.senha, user.senhaHash)
    if (!valid) throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS')

    await prisma.user.update({
      where: { id: user.id },
      data: { ultimoAcesso: new Date() },
    })

    await logAction(user.id, 'LOGIN', 'User', user.id, {}, ip)

    const accessToken = generateAccessToken(user.id)
    const refreshToken = await generateRefreshToken(user.id)
    return {
      user: { id: user.id, nome: user.nome, email: user.email, fotoPerfil: user.fotoPerfil, cargo: user.cargo, status: user.status },
      accessToken,
      refreshToken,
    }
  }

  async oauthLogin(dto: OAuthDTO): Promise<AuthResult> {
    let user = await prisma.user.findFirst({
      where: { OR: [{ providerId: dto.providerId, provider: dto.provider }, { email: dto.email }] },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          nome: dto.nome,
          email: dto.email.toLowerCase(),
          provider: dto.provider,
          providerId: dto.providerId,
          fotoPerfil: dto.fotoPerfil,
          senhaHash: null,
        },
      })
      await logAction(user.id, 'CREATE', 'User', user.id, { provider: dto.provider })
    } else {
      // Atualiza foto e providerId se necessário
      await prisma.user.update({
        where: { id: user.id },
        data: {
          fotoPerfil: dto.fotoPerfil ?? user.fotoPerfil,
          providerId: dto.providerId,
          ultimoAcesso: new Date(),
        },
      })
      await logAction(user.id, 'LOGIN', 'User', user.id, { provider: dto.provider })
    }

    const accessToken = generateAccessToken(user.id)
    const refreshToken = await generateRefreshToken(user.id)
    return {
      user: { id: user.id, nome: user.nome, email: user.email, fotoPerfil: user.fotoPerfil, cargo: user.cargo, status: user.status },
      accessToken,
      refreshToken,
    }
  }

  async logout(userId: string, ip?: string): Promise<void> {
    await revokeAllRefreshTokens(userId)
    await logAction(userId, 'LOGOUT', 'User', userId, {}, ip)
  }
}

export const authService = new AuthService()
