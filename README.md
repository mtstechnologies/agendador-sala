# Agendador de Salas – Monorepo

Sistema completo de reservas de salas para instituições de ensino, organizado como monorepo com frontend (React + TypeScript) e backend (Node.js/Express + Prisma + PostgreSQL).

## 📦 Estrutura do projeto

```
agendador-sala/
├─ frontend/                 # Aplicação React + TS (Vite + Tailwind + TanStack Query)
│  ├─ src/
│  │  ├─ components/         # UI, layout, cards, formulários
│  │  ├─ hooks/              # useAuth, useRooms, useReservations, useReservationEvents, etc.
│  │  ├─ pages/              # Dashboard, Admin, Reservas, Salas
│  │  └─ lib/                # api client (normalização camelCase), toast, etc.
│  └─ README.md              # Guia detalhado do frontend
├─ backend/                  # API REST Express + Prisma + PostgreSQL
│  ├─ src/
│  │  ├─ controllers/        # auth, rooms, reservations, admin
│  │  ├─ routes/             # rotas Express por domínio
│  │  ├─ utils/              # time, mailer, events (SSE)
│  │  └─ index.ts            # bootstrap do servidor / health / SSE
│  ├─ prisma/                # schema.prisma + migrations
│  └─ README.md              # Guia detalhado do backend (rotas, env, SSE)
├─ DOCUMENTO-DE-ESPECIFICAÇÃO-DE-REQUISITOS.md
├─ Histórias-de-Usuário.md
├─ DOCUMENTO-DE-DESIGN-DE-BANCO-DE-DADOS.md
└─ .github/
   └─ copilot-instructions.md
```

## 🧰 Tecnologias principais

- Frontend: React 18 + TypeScript + Vite, Tailwind CSS, TanStack Query, React Router, Zod
- Backend: Node.js + Express + TypeScript, Prisma ORM, PostgreSQL, JWT (jsonwebtoken), Nodemailer
- Observabilidade: logs de requisições lentas; flags de debug no frontend
- Tempo real: Server‑Sent Events (SSE) para atualizar o painel administrativo automaticamente

## 🔗 Contrato e comunicação entre apps

- O frontend consome exclusivamente a API REST do backend.
- Base URL da API no frontend via `.env`:
  - `VITE_API_URL=http://localhost:4000` (ou `VITE_API_BASE_URL`)
- Respostas do backend de reservas são sempre paginadas:
  ```json
  { "items": [], "page": 1, "pageSize": 50, "total": 0, "totalPages": 1 }
  ```
- Atualização em tempo real (admin): `GET /reservations/events?token=<JWT>` (SSE). O frontend escuta com o hook `useReservationEvents` e invalida caches automaticamente.

Mais detalhes em `backend/README.md` (seção Paginação e SSE) e no cliente de API do frontend (`frontend/src/lib/api.ts`).

## 🚀 Como rodar localmente

Pré‑requisitos: Node.js LTS, PostgreSQL em execução local.

1) Backend
- Copie `backend/.env.example` para `backend/.env` e ajuste `DATABASE_URL`, `JWT_SECRET` etc.
- Aplique migrações:
  - `cd backend`
  - `npm install`
  - `npx prisma migrate dev`
- Inicie em desenvolvimento:
  - `npm run dev` (porta padrão 4000)

2) Frontend
- `cd frontend`
- `npm install`
- Opcional `.env` do frontend (recomendado em dev):
  - `VITE_API_URL=http://localhost:4000`
  - Flags úteis: `VITE_DEBUG_API`, `VITE_DEBUG_RESERVATIONS`, `VITE_FEATURE_PAGINATION_ENFORCED`
- Inicie:
  - `npm run dev` (porta padrão 5173)

## 🌐 Deploy (ex.: Netlify + API hospedada)

- Frontend (Netlify):
  - Configure a variável de ambiente `VITE_API_URL` (ou `VITE_API_BASE_URL`) apontando para a URL pública do backend.
  - Build command: `npm run build`
  - Publish directory: `frontend/dist`
  - Se usar monorepo, configure o diretório base para `frontend/`.
- Backend (Render, Railway, Fly.io, VM ou container):
  - Defina `DATABASE_URL`, `JWT_SECRET`, `SMTP_*` (se quiser e‑mails), `API_DEFAULT_LIMIT`, `REQUIRE_PAGINATION`.
  - Garanta CORS liberando a origem do Netlify/produção.
- SSE em produção: verifique suporte do proxy/reverse proxy para `text/event-stream` (desativar buffering); o frontend usa token JWT na query string.

## 📚 Documentação complementar

- Documento de Especificação de Requisitos: [DOCUMENTO-DE-ESPECIFICAÇÃO-DE-REQUISITOS.md](./DOCUMENTO-DE-ESPECIFICAÇÃO-DE-REQUISITOS.md)
- Histórias de Usuário: [Histórias-de-Usuário.md](./Histórias-de-Usuário.md)
- Documento de Design de Banco de Dados: [DOCUMENTO-DE-DESIGN-DE-BANCO-DE-DADOS.md](./DOCUMENTO-DE-DESIGN-DE-BANCO-DE-DADOS.md)
- Guia do Backend (rotas, paginação, SSE, env): [backend/README.md](./backend/README.md)
- Guia do Frontend (hooks, env, uso de SSE): [frontend/README.md](./frontend/README.md)

## 🧪 Testes (sugestão)

- Backend: adicionar testes de contrato para garantir o shape paginado e filtros (Jest + Supertest).
- Frontend: testes de hooks e componentes críticos (Vitest + React Testing Library).

## 🔒 Segurança e papéis

- Autenticação via JWT (Bearer); roles: `user` e `admin`.
- Ações administrativas (aprovar/rejeitar reservas) exigem role `admin`.

## 🗺️ Roadmap (resumo)

- Otimizações de UX: reconexão SSE com backoff; feedbacks de erro refinados.
- Observabilidade: métricas simples para eventos e conexões SSE.
- Performance: code‑splitting e lazy loading adicional no frontend.

## 📜 Licença

Projeto sob licença MIT. Consulte `LICENSE` se presente.

---

Dúvidas ou sugestões? Abra uma issue ou contribua com um PR. 💡