import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { ambienteService } from '../services/AmbienteService'
import { auditLog } from '../middleware/audit'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await ambienteService.list(req.user!.id)) } catch (err) { next(err) }
})

router.post('/', auditLog('CREATE', 'Ambiente'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await ambienteService.create(req.user!.id, req.body)
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await ambienteService.getWithData(req.user!.id, req.params['id'] as string)) } catch (err) { next(err) }
})

router.put('/:id', auditLog('UPDATE', 'Ambiente'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await ambienteService.update(req.user!.id, req.params['id'] as string, req.body)) } catch (err) { next(err) }
})

router.delete('/:id', auditLog('DELETE', 'Ambiente'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try { res.json(await ambienteService.remove(req.user!.id, req.params['id'] as string)) } catch (err) { next(err) }
})

export default router
