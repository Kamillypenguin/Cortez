import prisma from '../prisma'
import { AppError } from '../middleware/errorHandler'

class ProjetoService {
  async list(userId: string, ambienteId?: string) {
    return prisma.projeto.findMany({
      where: { usuarioId: userId, ...(ambienteId ? { ambienteId } : {}) },
      include: {
        _count: { select: { tarefas: true, membros: true } },
        membros: { where: { status: 'ativo' }, select: { email: true, nome: true, fotoPerfil: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async get(userId: string, id: string) {
    const p = await prisma.projeto.findFirst({
      where: { id, usuarioId: userId },
      include: {
        tarefas: { orderBy: { createdAt: 'desc' } },
        documentos: { orderBy: { createdAt: 'desc' } },
        membros: { orderBy: { createdAt: 'asc' } },
        atividades: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    })
    if (!p) throw new AppError('Projeto não encontrado', 404, 'NOT_FOUND')
    return p
  }

  async create(userId: string, data: {
    nome: string; descricao?: string; cor?: string; icone?: string; ambienteId?: string
  }) {
    if (!data.nome?.trim()) throw new AppError('Nome do projeto é obrigatório', 400)
    if (data.ambienteId) {
      const amb = await prisma.ambiente.findFirst({ where: { id: data.ambienteId, usuarioId: userId } })
      if (!amb) throw new AppError('Ambiente não encontrado', 404)
    }
    return prisma.projeto.create({ data: { ...data, usuarioId: userId } })
  }

  async update(userId: string, id: string, data: Partial<{
    nome: string; descricao: string; cor: string; icone: string; status: string; ambienteId: string
  }>) {
    await this.assertOwnership(userId, id)
    return prisma.projeto.update({ where: { id }, data })
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await prisma.projeto.delete({ where: { id } })
    return { ok: true }
  }

  // ── Membros ──────────────────────────────────────────────────────────────────

  async addMembro(userId: string, projetoId: string, data: {
    email: string; nome?: string; papel?: string
  }) {
    await this.assertOwnership(userId, projetoId)
    return prisma.membroTime.upsert({
      where: { projetoId_email: { projetoId, email: data.email } },
      update: { nome: data.nome, papel: data.papel ?? 'membro', status: 'ativo' },
      create: { projetoId, email: data.email, nome: data.nome, papel: data.papel ?? 'membro', status: 'ativo' },
    })
  }

  async removeMembro(userId: string, projetoId: string, email: string) {
    await this.assertOwnership(userId, projetoId)
    await prisma.membroTime.deleteMany({ where: { projetoId, email } })
    return { ok: true }
  }

  async listMembros(userId: string, projetoId: string) {
    await this.assertOwnership(userId, projetoId)
    return prisma.membroTime.findMany({ where: { projetoId }, orderBy: { createdAt: 'asc' } })
  }

  // ── Atividades ────────────────────────────────────────────────────────────────

  async listAtividades(userId: string, projetoId: string) {
    await this.assertOwnership(userId, projetoId)
    return prisma.atividadeTime.findMany({
      where: { projetoId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async registrarAtividade(data: {
    projetoId: string; usuarioId: string; nomeUsuario: string
    tipo: string; entidade: string; entidadeId?: string; descricao: string; alvo?: string
  }) {
    return prisma.atividadeTime.create({ data })
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  private async assertOwnership(userId: string, id: string) {
    const p = await prisma.projeto.findFirst({ where: { id, usuarioId: userId } })
    if (!p) throw new AppError('Projeto não encontrado', 404, 'NOT_FOUND')
    return p
  }
}

export const projetoService = new ProjetoService()
