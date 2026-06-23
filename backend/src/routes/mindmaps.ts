import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { mindMapService } from '../services/MindMapService'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ambienteId } = req.query as Record<string, string>
    res.json(await mindMapService.list(req.user!.id, ambienteId))
  } catch (err) { next(err) }
})

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await mindMapService.get(req.user!.id, req.params['id'] as string))
  } catch (err) { next(err) }
})

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await mindMapService.create(req.user!.id, req.body))
  } catch (err) { next(err) }
})

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await mindMapService.update(req.user!.id, req.params['id'] as string, req.body))
  } catch (err) { next(err) }
})

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await mindMapService.remove(req.user!.id, req.params['id'] as string))
  } catch (err) { next(err) }
})

export default router
