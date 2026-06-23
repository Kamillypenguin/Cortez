import prisma from '../prisma'
import { AppError } from '../middleware/errorHandler'

export class DocumentService {

  async list(userId: string, params?: { ambienteId?: string; projetoId?: string }) {
    return prisma.document.findMany({
      where: {
        usuarioId: userId,
        ...(params?.ambienteId && { ambienteId: params.ambienteId }),
        ...(params?.projetoId && { projetoId: params.projetoId }),
      },
      include: {
        acessos: true,
        projeto: { select: { id: true, nome: true, cor: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async create(userId: string, data: {
    nome: string; tipo: string; tamanho?: string; url?: string
    ambienteId?: string; projetoId?: string
  }) {
    if (!data.nome?.trim()) throw new AppError('Nome é obrigatório', 400)
    if (data.projetoId) {
      const proj = await prisma.projeto.findFirst({ where: { id: data.projetoId, usuarioId: userId } })
      if (!proj) throw new AppError('Projeto não encontrado', 404)
    }
    return prisma.document.create({
      data: {
        nome: data.nome.trim(),
        tipo: data.tipo,
        tamanho: data.tamanho,
        url: data.url,
        usuarioId: userId,
        ambienteId: data.ambienteId,
        projetoId: data.projetoId,
      },
      include: { acessos: true, projeto: { select: { id: true, nome: true, cor: true } } },
    })
  }

  async update(userId: string, id: string, data: Partial<{
    nome: string; tipo: string; tamanho: string; url: string; projetoId: string | null
  }>) {
    await this.assertOwnership(userId, id)
    return prisma.document.update({
      where: { id },
      data,
      include: { acessos: true, projeto: { select: { id: true, nome: true, cor: true } } },
    })
  }

  async share(userId: string, id: string, email: string, permissao: 'view' | 'edit' = 'view') {
    await this.assertOwnership(userId, id)
    // Usa @@unique([documentId, email]) para upsert correto
    return prisma.documentAcesso.upsert({
      where: { documentId_email: { documentId: id, email: email.toLowerCase() } },
      update: { permissao },
      create: { documentId: id, email: email.toLowerCase(), permissao },
    })
  }

  async revokeShare(userId: string, docId: string, email: string) {
    await this.assertOwnership(userId, docId)
    await prisma.documentAcesso.deleteMany({ where: { documentId: docId, email: email.toLowerCase() } })
    return { ok: true }
  }

  async remove(userId: string, id: string) {
    await this.assertOwnership(userId, id)
    await prisma.document.delete({ where: { id } })
    return { ok: true }
  }

  private async assertOwnership(userId: string, id: string) {
    const doc = await prisma.document.findFirst({ where: { id, usuarioId: userId } })
    if (!doc) throw new AppError('Documento não encontrado', 404)
    return doc
  }
}

export const documentService = new DocumentService()
