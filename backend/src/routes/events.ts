import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { eventService } from '../services/EventService'
import { auditLog } from '../middleware/audit'

const router = Router()
router.use(authMiddleware)

// GET /events?day=26&ambienteId=xxx
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const day = req.query['day'] ? parseInt(req.query['day'] as string) : undefined
    const ambienteId = req.query['ambienteId'] as string | undefined
    res.json(await eventService.list(req.user!.id, day, ambienteId))
  } catch (err) { next(err) }
})

router.post('/', auditLog('CREATE', 'Event'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await eventService.create(req.user!.id, req.body))
  } catch (err) { next(err) }
})

router.put('/:id', auditLog('UPDATE', 'Event'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await eventService.update(req.user!.id, req.params['id'] as string, req.body))
  } catch (err) { next(err) }
})

router.delete('/:id', auditLog('DELETE', 'Event'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await eventService.remove(req.user!.id, req.params['id'] as string))
  } catch (err) { next(err) }
})

export default router
