import { Router } from 'express'
import {
  getReservations,
  createReservation,
  updateReservation,
  cancelReservation
} from '../controllers/reservationController'

const router = Router()

router.get('/', getReservations)
router.post('/', createReservation)
router.put('/:id', updateReservation)
router.put('/:id/cancel', cancelReservation)

export default router
