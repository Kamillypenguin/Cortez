import prisma from '../prisma'
import { AppError } from '../middleware/errorHandler'

export class ChatIAService {

  async listChats(userId: string, ambienteId?: string) {
    return prisma.chatIA.findMany({
      where: { usuarioId: userId, ...(ambienteId && { ambienteId }) },
      include: { _count: { select: { mensagens: true } } },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async createChat(userId: string, data: { titulo?: string; ambienteId?: string }) {
    return prisma.chatIA.create({
      data: { titulo: data.titulo ?? 'Nova conversa', usuarioId: userId, ambienteId: data.ambienteId },
    })
  }

  async getMessages(userId: string, chatId: string) {
    await this.assertChatOwnership(userId, chatId)
    return prisma.mensagemIA.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async addMessage(userId: string, chatId: string, mensagem: string, resposta?: string) {
    await this.assertChatOwnership(userId, chatId)
    const msg = await prisma.mensagemIA.create({
      data: { chatId, usuarioId: userId, mensagem, resposta },
    })
    // Atualiza updatedAt do chat
    await prisma.chatIA.update({ where: { id: chatId }, data: { updatedAt: new Date() } })
    return msg
  }

  async deleteChat(userId: string, chatId: string) {
    await this.assertChatOwnership(userId, chatId)
    await prisma.chatIA.delete({ where: { id: chatId } })
    return { ok: true }
  }

  private async assertChatOwnership(userId: string, chatId: string) {
    const chat = await prisma.chatIA.findFirst({ where: { id: chatId, usuarioId: userId } })
    if (!chat) throw new AppError('Chat não encontrado', 404)
    return chat
  }
}

export const chatIAService = new ChatIAService()
