import { Router } from 'express'
import { getRooms, getRoomById, createRoom, updateRoom, deleteRoom } from '../controllers/roomController'
import { protect, isAdmin } from '../middleware/authMiddleware'

const router = Router()


router.get('/', getRooms)
router.get('/:id', getRoomById)
router.post('/', protect, isAdmin, createRoom)
router.put('/:id', protect, isAdmin, updateRoom)
router.delete('/:id', protect, isAdmin, deleteRoom)

export default router
