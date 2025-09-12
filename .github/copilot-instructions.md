
# Copilot Instructions for AI Agents

## Visão Geral do Projeto

Este monorepo implementa um sistema completo de reservas de salas para instituições de ensino, dividido em dois principais diretórios:
- `frontend/`: Aplicação React + TypeScript, usando Vite, Tailwind CSS e hooks customizados para consumir apenas a API REST do backend.
- `backend/`: API Node.js/Express com TypeScript, usando Prisma ORM e PostgreSQL local.

## Arquitetura e Fluxos
- **Frontend** consome exclusivamente a API REST do backend para autenticação, perfis, reservas e salas. Não há mais dependência de Supabase.
- **Backend** expõe rotas REST (`/auth`, `/rooms`, `/reservations`, `/admin`) e gerencia dados via Prisma. O schema do banco está em `backend/prisma/schema.prisma`.
- **Banco de dados**: PostgreSQL local, gerenciado pelo backend.

## Convenções e Padrões
- **Componentização**: Componentes React organizados por domínio em `src/components/` (ex: `auth/`, `rooms/`, `ui/`).
- **Hooks customizados**: Lógica de dados e autenticação em `src/hooks/` (ex: `useAuth.ts`, `useRooms.ts`).
- **Validação**: Uso de Zod para validação de formulários e dados.
- **Gerenciamento de estado**: TanStack Query para cache e sincronização de dados.
- **Rotas protegidas**: Controle de acesso por perfil (usuário/admin) via hooks e middlewares.

## Workflows Essenciais
- **Frontend**:
  - `npm run dev` para desenvolvimento local (`localhost:5173`).
  - Não há variáveis obrigatórias para integração de dados.
  - O frontend consome apenas a API REST do backend.
- **Backend**:
  - `npm run dev` para rodar API localmente (`localhost:4000` por padrão).
  - Variáveis de ambiente em `.env` (ex: `DATABASE_URL`, `JWT_SECRET`).
  - `npx prisma migrate dev` para aplicar migrações.
  - Endpoints REST documentados nas rotas em `src/routes/`.

## Integrações e Pontos de Atenção
- **API REST**: Toda a comunicação do frontend é feita via endpoints REST do backend.
- **Prisma**: Models em `backend/prisma/schema.prisma` refletem as tabelas do banco PostgreSQL local.
- **Notificações**: Envio de emails via `nodemailer` no backend.

## Exemplos de Fluxos
- Cadastro de usuário → Criação de usuário via API REST → Role padrão `user` → Admin pode promover via SQL no banco local.
- Reserva de sala → Verificação de conflito e criação via API REST → Aprovação por admin (status `pending`/`approved`).

## Arquivos-Chave
- `frontend/README.md`: Documentação detalhada de setup e estrutura.
- `backend/prisma/schema.prisma`: Modelos de dados do backend.
- `backend/src/controllers/`: Lógica de negócio das rotas REST.
- `frontend/src/hooks/`: Hooks para autenticação, reservas e salas.

## Observações
- Siga os padrões de componentização e hooks para novas features.
- Mantenha consistência entre models Prisma e o banco PostgreSQL local.
- Consulte o `README.md` do frontend para detalhes de setup.
