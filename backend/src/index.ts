// Captura global de erros não tratados
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  //process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  // Não finalizar o processo em dev para facilitar a depuração
  // process.exit(1);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import roomRoutes from './routes/roomRoutes'
import authRoutes from './routes/authRoutes'
import reservationRoutes from './routes/reservationRoutes'
import adminRoutes from './routes/adminRoutes'
import userRoutes from './routes/userRoutes'
import { prisma } from './config/prisma'
import { addClient, removeClient, broadcast, decodeTokenMaybe } from './utils/events'

// Configurações iniciais
dotenv.config();
const app = express();
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://seu-dominio.com']
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Middleware simples de timing para detectar requisições lentas
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durMs = Number(process.hrtime.bigint() - start) / 1e6;
    const threshold = Number(process.env.SLOW_REQUEST_MS || 250);
    if (durMs > threshold) {
      console.warn('[slow]', req.method, req.originalUrl, `${durMs.toFixed(1)}ms`);
    }
  });
  next();
});


// Rotas básicas de teste
app.get('/', (req, res) => {
  res.json({ message: 'API rodando!' });
});

app.use('/auth', authRoutes)
app.use('/rooms', roomRoutes)
app.use('/reservations', reservationRoutes)
// Endpoint SSE para eventos de reservas (uso principal: painel admin em tempo real)
app.get('/reservations/events', (req, res) => {
  const token = String(req.query.token || '')
  const decoded = decodeTokenMaybe(token)
  if (!decoded) {
    return res.status(401).end()
  }
  // Configurar cabeçalhos SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()
  const clientId = decoded.id + ':' + Date.now()
  addClient(clientId, res, decoded.role)
  // Mensagem inicial
  res.write('event: hello\n')
  res.write('data: {"type":"connected"}\n\n')
  // Heartbeat para manter conexão
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n') } catch { /* ignore */ }
  }, 25000)
  req.on('close', () => {
    clearInterval(heartbeat)
    removeClient(clientId)
  })
})
app.use('/admin', adminRoutes)
app.use('/api/users', userRoutes)
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' })
  } catch (e) {
    res.status(500).json({ status: 'error', message: 'DB indisponível', detail: (e as Error).message })
  }
})

// Middleware final para capturar erros não tratados nas rotas async (fallback)
// (Para robustez extra, ainda que cada controller já tenha try/catch)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro não tratado:', err)
  if (err?.code === 'P1001') {
    return res.status(503).json({ error: 'Banco de dados inacessível. Verifique se o PostgreSQL está ativo.' })
  }
  res.status(500).json({ error: 'Erro interno inesperado' })
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
