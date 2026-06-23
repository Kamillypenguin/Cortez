import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { documentService } from '../services/DocumentService'
import { auditLog } from '../middleware/audit'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { ambienteId, projetoId } = req.query as Record<string, string>
    res.json(await documentService.list(req.user!.id, { ambienteId, projetoId }))
  } catch (err) { next(err) }
})

router.post('/', auditLog('CREATE', 'Document'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await documentService.create(req.user!.id, req.body))
  } catch (err) { next(err) }
})

router.put('/:id', auditLog('UPDATE', 'Document'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await documentService.update(req.user!.id, req.params['id'] as string, req.body))
  } catch (err) { next(err) }
})

router.post('/:id/share', auditLog('SHARE', 'Document'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, permissao } = req.body
    res.json(await documentService.share(req.user!.id, req.params['id'] as string, email, permissao))
  } catch (err) { next(err) }
})

router.delete('/:id/share/:email', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await documentService.revokeShare(req.user!.id, req.params['id'] as string, req.params['email'] as string))
  } catch (err) { next(err) }
})

router.delete('/:id', auditLog('DELETE', 'Document'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await documentService.remove(req.user!.id, req.params['id'] as string))
  } catch (err) { next(err) }
})

export default router
