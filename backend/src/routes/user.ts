import { Router, Response, NextFunction } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { userService } from '../services/UserService'

const router = Router()
router.use(authMiddleware)

// GET /api/user/profile
router.get('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getProfile(req.user!.id)
    res.json(data)
  } catch (err) { next(err) }
})

// PUT /api/user/profile
router.put('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { nome, cargo, fotoPerfil } = req.body
    const data = await userService.updateProfile(req.user!.id, { nome, cargo, fotoPerfil })
    res.json(data)
  } catch (err) { next(err) }
})

// GET /api/user/dashboard — carrega tudo de uma vez para o dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getDashboard(req.user!.id)
    res.json(data)
  } catch (err) { next(err) }
})

export default router
