import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { taskService } from '../services/TaskService'
import { auditLog } from '../middleware/audit'

const router = Router()
router.use(authMiddleware)

// GET /tasks?ambienteId=xxx&projetoId=yyy
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ambienteId, projetoId } = req.query as Record<string, string>
    res.json(await taskService.list(req.user!.id, ambienteId, projetoId))
  } catch (err) { next(err) }
})

router.post('/', auditLog('CREATE', 'Task'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.create(req.user!.id, req.body)
    res.status(201).json(task)
  } catch (err) { next(err) }
})

router.put('/:id', auditLog('UPDATE', 'Task'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await taskService.update(req.user!.id, req.params['id'] as string, req.body))
  } catch (err) { next(err) }
})

router.delete('/:id', auditLog('DELETE', 'Task'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await taskService.remove(req.user!.id, req.params['id'] as string))
  } catch (err) { next(err) }
})

// ── Responsáveis ──────────────────────────────────────────────────────────────

router.post('/:id/responsaveis', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, nome } = req.body
    res.status(201).json(await taskService.addResponsavel(req.user!.id, req.params['id'] as string, email, nome))
  } catch (err) { next(err) }
})

router.delete('/:id/responsaveis/:email', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await taskService.removeResponsavel(req.user!.id, req.params['id'] as string, req.params['email'] as string))
  } catch (err) { next(err) }
})

export default router
