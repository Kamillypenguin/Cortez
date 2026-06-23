import prisma from '../prisma'
import { AppError } from '../middleware/errorHandler'

export class UserService {

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, nome: true, email: true, fotoPerfil: true,
        cargo: true, status: true, dataCriacao: true, ultimoAcesso: true,
        _count: {
          select: { tarefas: true, eventos: true, documentos: true, ambientes: true, chatsIA: true }
        }
      },
    })
    if (!user) throw new AppError('Usuário não encontrado', 404)
    return user
  }

  async updateProfile(userId: string, data: { nome?: string; cargo?: string; fotoPerfil?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.nome && { nome: data.nome.trim() }),
        ...(data.cargo !== undefined && { cargo: data.cargo }),
        ...(data.fotoPerfil !== undefined && { fotoPerfil: data.fotoPerfil }),
      },
      select: { id: true, nome: true, email: true, fotoPerfil: true, cargo: true, status: true },
    })
  }

  async getDashboard(userId: string) {
    const [profile, tarefasHoje, eventos, stats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, nome: true, email: true, fotoPerfil: true, cargo: true },
      }),
      prisma.task.findMany({
        where: { usuarioId: userId, due: { contains: 'Hoje' } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.event.findMany({
        where: { usuarioId: userId },
        orderBy: { time: 'asc' },
      }),
      prisma.task.groupBy({
        by: ['status'],
        where: { usuarioId: userId },
        _count: true,
      }),
    ])

    const done = stats.find(s => s.status === 'done')?._count ?? 0
    const partial = stats.find(s => s.status === 'partial')?._count ?? 0
    const total = stats.reduce((acc, s) => acc + s._count, 0)

    return {
      usuario: profile,
      tarefasHoje,
      eventos,
      estatisticas: { total, done, partial, pending: total - done - partial },
    }
  }
}

export const userService = new UserService()
