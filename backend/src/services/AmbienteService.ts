import prisma from '../prisma'
import { AppError } from '../middleware/errorHandler'

export class AmbienteService {

  async list(userId: string) {
    return prisma.ambiente.findMany({
      where: { usuarioId: userId, ativo: true },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { tarefas: true, eventos: true, documentos: true } }
      },
    })
  }

  async create(userId: string, data: { nome: string; icone?: string; cor?: string }) {
    if (!data.nome?.trim()) throw new AppError('Nome é obrigatório', 400)
    return prisma.ambiente.create({
      data: { nome: data.nome.trim(), icone: data.icone, cor: data.cor, usuarioId: userId },
    })
  }

  async update(userId: string, id: string, data: { nome?: string; icone?: string; cor?: string }) {
    await this.assertOwnership(userId, id)
    return prisma.ambiente.update({
      where: { id },
      data: {
        ...(data.nome && { nome: data.nome.trim() }),
        ...(data.icone !== undefined && { icone: data.icone }),
        ...(data.cor !== undefined && { cor: data.cor }),
      },
    })
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    // Soft delete — mantém dados históricos
    return prisma.ambiente.update({ where: { id }, data: { ativo: false } })
  }

  async getWithData(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    return prisma.ambiente.findUnique({
      where: { id },
      include: {
        tarefas: { where: { usuarioId: userId }, orderBy: { createdAt: 'desc' } },
        eventos: { where: { usuarioId: userId }, orderBy: { time: 'asc' } },
        documentos: { where: { usuarioId: userId }, orderBy: { createdAt: 'desc' } },
        chatsIA: { where: { usuarioId: userId }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    })
  }

  private async assertOwnership(userId: string, id: string) {
    const amb = await prisma.ambiente.findFirst({ where: { id, usuarioId: userId } })
    if (!amb) throw new AppError('Ambiente não encontrado', 404, 'NOT_FOUND')
    return amb
  }
}

export const ambienteService = new AmbienteService()
