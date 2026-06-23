import prisma from '../prisma'
import { AppError } from '../middleware/errorHandler'

export class RiscoService {

  async list(userId: string, projetoId: string) {
    await this.assertProjetoAccess(userId, projetoId)
    return prisma.risco.findMany({
      where: { projetoId },
      orderBy: [
        { severidade: 'asc' }, // critico < atencao < baixo (alphabetical works here)
        { createdAt: 'desc' },
      ],
    })
  }

  async create(userId: string, data: {
    titulo: string; descricao?: string; severidade?: string
    impacto?: string; projetoId: string
  }) {
    if (!data.titulo?.trim()) throw new AppError('Título é obrigatório', 400)
    await this.assertProjetoAccess(userId, data.projetoId)
    return prisma.risco.create({
      data: {
        titulo: data.titulo.trim(),
        descricao: data.descricao,
        severidade: data.severidade ?? 'atencao',
        impacto: data.impacto,
        status: 'aberto',
        projetoId: data.projetoId,
        usuarioId: userId,
      },
    })
  }

  async update(userId: string, id: string, data: {
    titulo?: string; descricao?: string; severidade?: string
    impacto?: string; status?: string
  }) {
    await this.assertOwnership(userId, id)
    return prisma.risco.update({
      where: { id },
      data: {
        ...(data.titulo     !== undefined && { titulo: data.titulo.trim() }),
        ...(data.descricao  !== undefined && { descricao: data.descricao }),
        ...(data.severidade !== undefined && { severidade: data.severidade }),
        ...(data.impacto    !== undefined && { impacto: data.impacto }),
        ...(data.status     !== undefined && { status: data.status }),
      },
    })
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await prisma.risco.delete({ where: { id } })
    return { ok: true }
  }

  private async assertProjetoAccess(userId: string, projetoId: string) {
    const proj = await prisma.projeto.findFirst({ where: { id: projetoId, usuarioId: userId } })
    if (!proj) throw new AppError('Projeto não encontrado', 404)
    return proj
  }

  private async assertOwnership(userId: string, id: string) {
    const r = await prisma.risco.findFirst({ where: { id, usuarioId: userId } })
    if (!r) throw new AppError('Risco não encontrado', 404)
    return r
  }
}

export const riscoService = new RiscoService()
