
import { Router } from 'express';
import {
  getReservations,
  createReservation,
  updateReservation,
  cancelReservation
} from '../controllers/reservationController';
import {
  validateReservationCreate,
  validateReservationUpdate
} from '../middleware/validateReservation';

const router = Router()

router.get('/', getReservations)
router.post('/', validateReservationCreate, createReservation);
router.put('/:id', validateReservationUpdate, updateReservation);
router.put('/:id/cancel', cancelReservation)

export default router
