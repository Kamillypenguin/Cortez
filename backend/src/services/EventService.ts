import prisma from '../prisma'
import { AppError } from '../middleware/errorHandler'

export class EventService {

  async list(userId: string, dayNum?: number, ambienteId?: string) {
    return prisma.event.findMany({
      where: {
        usuarioId: userId,
        ...(dayNum !== undefined && { dayNum }),
        ...(ambienteId && { ambienteId }),
      },
      orderBy: { time: 'asc' },
    })
  }

  async create(userId: string, data: {
    titulo: string; time: string; loc?: string; color?: string; dayNum: number; ambienteId?: string
  }) {
    if (!data.titulo?.trim()) throw new AppError('Título é obrigatório', 400)
    return prisma.event.create({
      data: {
        titulo: data.titulo.trim(),
        time: data.time,
        loc: data.loc,
        color: data.color ?? '#6366F1',
        dayNum: data.dayNum,
        usuarioId: userId,
        ambienteId: data.ambienteId,
      },
    })
  }

  async update(userId: string, id: string, data: {
    titulo?: string; time?: string; loc?: string; color?: string; dayNum?: number
  }) {
    await this.assertOwnership(userId, id)
    return prisma.event.update({
      where: { id },
      data: {
        ...(data.titulo !== undefined && { titulo: data.titulo.trim() }),
        ...(data.time !== undefined && { time: data.time }),
        ...(data.loc !== undefined && { loc: data.loc }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.dayNum !== undefined && { dayNum: data.dayNum }),
      },
    })
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await prisma.event.delete({ where: { id } })
    return { ok: true }
  }

  private async assertOwnership(userId: string, id: string) {
    const event = await prisma.event.findFirst({ where: { id, usuarioId: userId } })
    if (!event) throw new AppError('Evento não encontrado', 404, 'NOT_FOUND')
    return event
  }
}

export const eventService = new EventService()
