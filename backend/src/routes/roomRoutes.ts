import { Router } from 'express'
import { getRooms, getRoomById } from '../controllers/roomController'

const router = Router()

router.get('/', getRooms)
router.get('/:id', getRoomById)

export default router
