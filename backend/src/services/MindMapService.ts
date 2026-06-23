import prisma from '../prisma'
import { AppError } from '../middleware/errorHandler'

export class MindMapService {

  async list(userId: string, ambienteId?: string) {
    return prisma.mindMap.findMany({
      where: {
        usuarioId: userId,
        ...(ambienteId && { ambienteId }),
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async get(userId: string, id: string) {
    const map = await prisma.mindMap.findFirst({ where: { id, usuarioId: userId } })
    if (!map) throw new AppError('Mapa mental não encontrado', 404)
    return map
  }

  async create(userId: string, data: { titulo: string; estrutura?: string; ambienteId?: string }) {
    if (!data.titulo?.trim()) throw new AppError('Título é obrigatório', 400)
    return prisma.mindMap.create({
      data: {
        titulo: data.titulo.trim(),
        estrutura: data.estrutura ?? '{}',
        usuarioId: userId,
        ambienteId: data.ambienteId,
      },
    })
  }

  async update(userId: string, id: string, data: { titulo?: string; estrutura?: string }) {
    await this.assertOwnership(userId, id)
    return prisma.mindMap.update({
      where: { id },
      data: {
        ...(data.titulo !== undefined && { titulo: data.titulo.trim() }),
        ...(data.estrutura !== undefined && { estrutura: data.estrutura }),
      },
    })
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await prisma.mindMap.delete({ where: { id } })
    return { ok: true }
  }

  private async assertOwnership(userId: string, id: string) {
    const map = await prisma.mindMap.findFirst({ where: { id, usuarioId: userId } })
    if (!map) throw new AppError('Mapa mental não encontrado', 404)
    return map
  }
}

export const mindMapService = new MindMapService()
