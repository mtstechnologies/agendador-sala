import { Router } from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { isAdmin, protect } from '../middleware/authMiddleware';

const router = Router();

// Rotas de administração de usuários
// Requer autenticação e privilégios de administrador

router.get('/', protect, isAdmin, getAllUsers);
router.post('/', protect, isAdmin, createUser);
router.put('/:id', protect, isAdmin, updateUser);
router.delete('/:id', protect, isAdmin, deleteUser);

export default router;
