import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { chatIAService } from '../services/ChatIAService'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ambienteId = req.query['ambienteId'] as string | undefined
    res.json(await chatIAService.listChats(req.user!.id, ambienteId))
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await chatIAService.createChat(req.user!.id, req.body))
  } catch (err) { next(err) }
})

router.get('/:chatId/messages', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await chatIAService.getMessages(req.user!.id, req.params['chatId'] as string))
  } catch (err) { next(err) }
})

router.post('/:chatId/messages', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { mensagem, resposta } = req.body
    res.status(201).json(await chatIAService.addMessage(req.user!.id, req.params['chatId'] as string, mensagem, resposta))
  } catch (err) { next(err) }
})

router.delete('/:chatId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await chatIAService.deleteChat(req.user!.id, req.params['chatId'] as string))
  } catch (err) { next(err) }
})

export default router
