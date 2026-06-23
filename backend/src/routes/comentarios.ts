import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { comentarioService } from '../services/ComentarioService'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tarefaId, documentId } = req.query as Record<string, string>
    res.json(await comentarioService.list(req.user!.id, { tarefaId, documentId }))
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await comentarioService.create(req.user!.id, req.body))
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await comentarioService.update(req.user!.id, req.params['id'] as string, req.body.texto))
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await comentarioService.remove(req.user!.id, req.params['id'] as string))
  } catch (err) { next(err) }
})

export default router
