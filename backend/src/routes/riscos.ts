import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { riscoService } from '../services/RiscoService'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projetoId } = req.query as Record<string, string>
    if (!projetoId) { res.status(400).json({ error: 'projetoId é obrigatório' }); return }
    res.json(await riscoService.list(req.user!.id, projetoId))
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await riscoService.create(req.user!.id, req.body))
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await riscoService.update(req.user!.id, req.params['id'] as string, req.body))
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await riscoService.remove(req.user!.id, req.params['id'] as string))
  } catch (err) { next(err) }
})

export default router
