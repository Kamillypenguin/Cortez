import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { auditLog } from '../middleware/audit'
import { projetoService } from '../services/ProjetoService'

const router = Router()
router.use(authMiddleware)

// ── Projetos ──────────────────────────────────────────────────────────────────

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ambienteId = req.query['ambienteId'] as string | undefined
    res.json(await projetoService.list(req.user!.id, ambienteId))
  } catch (err) { next(err) }
})

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await projetoService.get(req.user!.id, req.params['id'] as string))
  } catch (err) { next(err) }
})

router.post('/', auditLog('CREATE', 'Projeto'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await projetoService.create(req.user!.id, req.body))
  } catch (err) { next(err) }
})

router.put('/:id', auditLog('UPDATE', 'Projeto'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await projetoService.update(req.user!.id, req.params['id'] as string, req.body))
  } catch (err) { next(err) }
})

router.delete('/:id', auditLog('DELETE', 'Projeto'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await projetoService.remove(req.user!.id, req.params['id'] as string))
  } catch (err) { next(err) }
})

// ── Membros do time ───────────────────────────────────────────────────────────

router.get('/:id/membros', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await projetoService.listMembros(req.user!.id, req.params['id'] as string))
  } catch (err) { next(err) }
})

router.post('/:id/membros', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await projetoService.addMembro(req.user!.id, req.params['id'] as string, req.body))
  } catch (err) { next(err) }
})

router.delete('/:id/membros/:email', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await projetoService.removeMembro(req.user!.id, req.params['id'] as string, req.params['email'] as string))
  } catch (err) { next(err) }
})

// ── Atividades ────────────────────────────────────────────────────────────────

router.get('/:id/atividades', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await projetoService.listAtividades(req.user!.id, req.params['id'] as string))
  } catch (err) { next(err) }
})

export default router
