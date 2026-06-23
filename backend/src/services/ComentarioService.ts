import prisma from '../prisma'
import { AppError } from '../middleware/errorHandler'

class ComentarioService {
  async list(userId: string, filtro: { tarefaId?: string; documentId?: string }) {
    if (!filtro.tarefaId && !filtro.documentId) throw new AppError('Informe tarefaId ou documentId', 400)
    return prisma.comentario.findMany({
      where: { usuarioId: userId, ...filtro },
      include: { usuario: { select: { id: true, nome: true, fotoPerfil: true } } },
      orderBy: { createdAt: 'asc' },
    })
  }

  async create(userId: string, data: { texto: string; tarefaId?: string; documentId?: string }) {
    if (!data.texto?.trim()) throw new AppError('Texto é obrigatório', 400)
    if (!data.tarefaId && !data.documentId) throw new AppError('Informe tarefaId ou documentId', 400)
    return prisma.comentario.create({
      data: { ...data, usuarioId: userId },
      include: { usuario: { select: { id: true, nome: true, fotoPerfil: true } } },
    })
  }

  async update(userId: string, id: string, texto: string) {
    const c = await prisma.comentario.findFirst({ where: { id, usuarioId: userId } })
    if (!c) throw new AppError('Comentário não encontrado', 404, 'NOT_FOUND')
    return prisma.comentario.update({ where: { id }, data: { texto } })
  }

  async remove(userId: string, id: string) {
    const c = await prisma.comentario.findFirst({ where: { id, usuarioId: userId } })
    if (!c) throw new AppError('Comentário não encontrado', 404, 'NOT_FOUND')
    await prisma.comentario.delete({ where: { id } })
    return { ok: true }
  }
}

export const comentarioService = new ComentarioService()
