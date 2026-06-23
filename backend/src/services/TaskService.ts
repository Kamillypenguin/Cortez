import prisma from '../prisma'
import { AppError } from '../middleware/errorHandler'

export class TaskService {

  async list(userId: string, ambienteId?: string, projetoId?: string) {
    return prisma.task.findMany({
      where: {
        usuarioId: userId,
        ...(ambienteId && { ambienteId }),
        ...(projetoId && { projetoId }),
      },
      include: {
        projeto: { select: { id: true, nome: true, cor: true } },
        responsaveis: true,
        _count: { select: { comentarios: true } },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async create(userId: string, data: {
    titulo: string; descricao?: string; prioridade?: string
    proj?: string; projColor?: string; due: string; durMin?: number
    ambienteId?: string; projetoId?: string
  }) {
    if (!data.titulo?.trim()) throw new AppError('Título é obrigatório', 400)

    if (data.ambienteId) {
      const amb = await prisma.ambiente.findFirst({ where: { id: data.ambienteId, usuarioId: userId } })
      if (!amb) throw new AppError('Ambiente não encontrado', 404)
    }

    if (data.projetoId) {
      const proj = await prisma.projeto.findFirst({ where: { id: data.projetoId, usuarioId: userId } })
      if (!proj) throw new AppError('Projeto não encontrado', 404)
    }

    // Se tem projetoId mas não tem proj (nome display), busca o nome do projeto
    let proj = data.proj
    let projColor = data.projColor ?? '#6366F1'
    if (data.projetoId && !proj) {
      const projeto = await prisma.projeto.findUnique({ where: { id: data.projetoId } })
      if (projeto) { proj = projeto.nome; projColor = projeto.cor }
    }

    return prisma.task.create({
      data: {
        titulo: data.titulo.trim(),
        descricao: data.descricao,
        prioridade: data.prioridade ?? 'normal',
        proj: proj ?? '',
        projColor,
        due: data.due,
        durMin: data.durMin ?? 30,
        status: 'none',
        usuarioId: userId,
        ambienteId: data.ambienteId,
        projetoId: data.projetoId,
      },
      include: { projeto: { select: { id: true, nome: true, cor: true } } },
    })
  }

  async update(userId: string, id: string, data: {
    titulo?: string; descricao?: string; status?: string; prioridade?: string
    proj?: string; projColor?: string; due?: string; durMin?: number
    ambienteId?: string | null; projetoId?: string | null
  }) {
    await this.assertOwnership(userId, id)
    return prisma.task.update({
      where: { id },
      data: {
        ...(data.titulo !== undefined && { titulo: data.titulo.trim() }),
        ...(data.descricao !== undefined && { descricao: data.descricao }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.prioridade !== undefined && { prioridade: data.prioridade }),
        ...(data.proj !== undefined && { proj: data.proj.trim() }),
        ...(data.projColor !== undefined && { projColor: data.projColor }),
        ...(data.due !== undefined && { due: data.due }),
        ...(data.durMin !== undefined && { durMin: data.durMin }),
        ...(data.ambienteId !== undefined && { ambienteId: data.ambienteId }),
        ...(data.projetoId !== undefined && { projetoId: data.projetoId }),
      },
      include: { projeto: { select: { id: true, nome: true, cor: true } } },
    })
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await prisma.task.delete({ where: { id } })
    return { ok: true }
  }

  // ── Responsáveis ──────────────────────────────────────────────────────────────

  async addResponsavel(userId: string, tarefaId: string, email: string, nome?: string) {
    await this.assertOwnership(userId, tarefaId)
    return prisma.tarefaResponsavel.upsert({
      where: { tarefaId_email: { tarefaId, email } },
      update: { nome },
      create: { tarefaId, email, nome },
    })
  }

  async removeResponsavel(userId: string, tarefaId: string, email: string) {
    await this.assertOwnership(userId, tarefaId)
    await prisma.tarefaResponsavel.deleteMany({ where: { tarefaId, email } })
    return { ok: true }
  }

  private async assertOwnership(userId: string, id: string) {
    const task = await prisma.task.findFirst({ where: { id, usuarioId: userId } })
    if (!task) throw new AppError('Tarefa não encontrada', 404, 'NOT_FOUND')
    return task
  }
}

export const taskService = new TaskService()
