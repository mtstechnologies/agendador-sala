// Captura global de erros não tratados
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  //process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import roomRoutes from './routes/roomRoutes'
import authRoutes from './routes/authRoutes'
import reservationRoutes from './routes/reservationRoutes'
import adminRoutes from './routes/adminRoutes'

// Configurações iniciais
dotenv.config();
const app = express();
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://seu-dominio.com']
  : ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());



// Rotas básicas de teste
app.get('/', (req, res) => {
  res.json({ message: 'API rodando!' });
});

app.use('/auth', authRoutes)
app.use('/rooms', roomRoutes)
app.use('/reservations', reservationRoutes)
app.use('/admin', adminRoutes)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
