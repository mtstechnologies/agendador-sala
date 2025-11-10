import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController';
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from '../middleware/validateAuth';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

export default router;
