import { Router } from 'express'
import { approveReservation, rejectReservation, getReports } from '../controllers/adminController'
import { protect, isAdmin } from '../middleware/authMiddleware'

const router = Router()

router.put('/reservations/:id/approve', protect, isAdmin, approveReservation)
router.put('/reservations/:id/reject', protect, isAdmin, rejectReservation)
router.get('/reports', protect, isAdmin, getReports)

export default router
