import { Router } from 'express'
import { approveReservation, rejectReservation, getReports } from '../controllers/adminController'

const router = Router()

router.put('/reservations/:id/approve', approveReservation)
router.put('/reservations/:id/reject', rejectReservation)
router.get('/reports', getReports)

export default router
