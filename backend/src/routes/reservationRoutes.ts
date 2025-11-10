
import { Router } from 'express';
import {
  getReservations,
  createReservation,
  updateReservation,
  cancelReservation
} from '../controllers/reservationController';
import { protect } from '../middleware/authMiddleware'
import {
  validateReservationCreate,
  validateReservationUpdate
} from '../middleware/validateReservation';

const router = Router()

router.get('/', protect, getReservations)
router.post('/', protect, validateReservationCreate, createReservation);
router.put('/:id', protect, validateReservationUpdate, updateReservation);
router.put('/:id/cancel', protect, cancelReservation)

export default router
