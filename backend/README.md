# Backend API – Agendador de Salas

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

- DATABASE_URL: conexão Postgres
- JWT_SECRET / JWT_EXPIRES_IN
- SMTP_*: envio de e-mails (opcional, mas recomendado)
- SLOW_REQUEST_MS: limiar (ms) p/ log de requisições lentas (padrão 800)
- API_DEFAULT_LIMIT: tamanho padrão da página quando `page/pageSize` não são informados (padrão 50)
- REQUIRE_PAGINATION: quando true, reforça a política de sempre usar `page`/`pageSize` no frontend

## Paginação

O endpoint `GET /reservations` responde sempre no formato paginado:

```json
{
  "items": [/* reservas */],
  "page": 1,
  "pageSize": 50,
  "total": 123,
  "totalPages": 3
}
```

Parâmetros suportados:
- `page` (1-based) – número da página (default: 1)
- `pageSize` – itens por página (default: `API_DEFAULT_LIMIT`)
- Filtros: `userId`, `roomId`, `date` (yyyy-MM-dd local), `status`

Recomendação produção: definir `REQUIRE_PAGINATION=true` e garantir que o frontend sempre envie `page` e `pageSize`.

## Eventos em Tempo Real (SSE)

Para que o painel administrativo veja novas reservas instantaneamente sem precisar atualizar manualmente, o backend expõe um endpoint de Server‑Sent Events (SSE):

`GET /reservations/events?token=<JWT>`

Características:
- Autenticação: passa o mesmo JWT de login via query string `token` (o cabeçalho Authorization não funciona nativamente em `EventSource`).
- Formato: canal SSE (Content-Type: `text/event-stream`), envia eventos `reservation-created`, `reservation-updated`, `reservation-cancelled`.
- Filtro de permissões: eventos de criação (`reservation-created`) são enviados apenas para conexões com role `admin`.
- Heartbeat: comentários (`: ping`) a cada ~25s mantêm a conexão viva.

Payload genérico dos eventos:
```jsonc
{
  "type": "reservation-created", // ou -updated / -cancelled
  "payload": {
    "id": "uuid",
    "status": "pending",
    "roomId": "uuid",
    "startTime": "2025-11-10T13:00:00.000Z",
    "endTime": "2025-11-10T14:00:00.000Z",
    "title": "Reunião"
  }
}
```

Exemplo de conexão manual (curl mantém a stream):
```bash
curl -N "http://localhost:4000/reservations/events?token=SEU_JWT_AQUI"
```

Boas práticas:
- Não reutilize o JWT depois de expirado (o servidor encerrará a conexão).
- Em produção, considere mover para WebSocket se precisar de mensagens bidirecionais (ex: usuário receber aprovação em tempo real e enviar ack).
- Implementar reconexão com backoff no cliente (o frontend atual fecha silenciosamente em erro).

### Fluxo
1. Admin abre página de gerenciamento de reservas (frontend cria `EventSource`).
2. Usuário cria ou atualiza uma reserva.
3. Controller aciona `broadcast(...)` e envia evento SSE.
4. Frontend recebe e invalida caches do React Query (`reservations`, `my-reservations`, `room-availability`).
5. Lista se atualiza automaticamente.

### Arquivo de implementação
- Lógica e lista de clientes: `src/utils/events.ts`.
- Registro de rota SSE: `src/index.ts` (`/reservations/events`).
- Emissão de eventos: `reservationController.ts` (create/update/cancel).

## Scripts úteis

- `npm run dev` – inicia servidor em desenvolvimento
- `npm run build && npm start` – compila e inicia produção
- `npm run migrate` – aplica migrações Prisma
- `npm run db:reset` – reseta e reaplica migrações
- `npm run seed` – popula dados básicos

## Saúde do serviço

- `GET /health` – verifica conectividade com banco (`SELECT 1`)

## Observabilidade

Middleware de timing registra requisições acima de `SLOW_REQUEST_MS` com prefixo `[slow]` no console.

---

Para detalhes de modelos e constraints, ver `prisma/schema.prisma` e diretório `prisma/migrations/`.
Backend README# Backend - Notas de Recuperação de Senha

Para habilitar o envio de emails no fluxo de “Esqueci a senha”, configure as variáveis no arquivo `.env`:

```
SMTP_HOST=smtp.seuprovedor.com
SMTP_PORT=587
SMTP_USER=sua-conta@dominio.com
SMTP_PASS=senha-ou-app-password
SMTP_FROM="Reservas <sua-conta@dominio.com>"
APP_BASE_URL=http://localhost:5173
```

- APP_BASE_URL: base da aplicação frontend para montar o link de redefinição.
- O token expira em 30 minutos.
- O endpoint não revela se o email existe para evitar enumeração de usuários.

Rotas adicionadas:
- POST /auth/forgot-password { email }
- POST /auth/reset-password { token, password }

```mermaid
sequenceDiagram
  participant U as Usuário
  participant FE as Frontend
  participant BE as Backend
  participant SMTP as Provedor de Email

  U->>FE: Acessa /forgot-password e envia email
  FE->>BE: POST /auth/forgot-password
  BE->>SMTP: Envia link com token
  SMTP-->>U: Email com link /reset-password?token=...
  U->>FE: Abre link e define nova senha
  FE->>BE: POST /auth/reset-password
  BE-->>FE: 200 OK
```# Backend — API de Agendamento de Salas

API REST construída com Node.js, Express e TypeScript, usando Prisma ORM e PostgreSQL. Atende autenticação (JWT), gestão de salas, reservas, administração e relatórios.

## Sumário
- Visão geral
- Estrutura de pastas
- Tecnologias
- Arquitetura e padrões
- Boas práticas adotadas
- Setup e execução (dev/prod)
- Banco de dados e Prisma
- Autenticação e autorização
- Rotas principais
- Variáveis de ambiente
- Qualidade e observabilidade
- Troubleshooting

---

## Visão geral
- API REST stateless, com autenticação via JWT.
- Persistência em PostgreSQL usando Prisma.
- Módulos de domínio: auth, rooms, reservations, admin e users.
- Timezone padronizado (America/Sao_Paulo) para correta interpretação de dias locais.

## 📁 Estrutura de pastas backend
```
backend/
├── prisma/
│   ├── schema.prisma          # Modelos do banco e client do Prisma
│   ├── migrations/            # Migrações versionadas do banco
│   │   └── ...
│   └── seed.ts                # (opcional) script de seed
├── src/
│   ├── index.ts               # Bootstrap do servidor Express
│   ├── config/                # Configurações (CORS, logger, etc.)
│   ├── controllers/           # Orquestra HTTP (traduz domínio <-> HTTP)
│   │   ├── adminController.ts
│   │   ├── authController.ts
│   │   ├── reservationController.ts
│   │   ├── roomController.ts
│   │   └── userController.ts
│   ├── middleware/            # Auth, validação, erros
│   ├── models/                # Tipagens/DTOs locais (se necessário)
│   ├── routes/                # Rotas Express por domínio
│   │   ├── adminRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── reservationRoutes.ts
│   │   ├── roomRoutes.ts
│   │   └── userRoutes.ts
│   ├── services/              # Regras de negócio (domínio)
│   └── utils/                 # Utilitários (datas/timezone, etc.)
├── tests/                     # Testes (unitários/integrados)
├── package.json               # Scripts e dependências
├── tsconfig.json              # Configuração TypeScript
└── .env                       # Variáveis de ambiente (não commitar)
```
Observação: nem todos os arquivos acima podem existir em todas as fases; o projeto evolui gradualmente. A estrutura privilegia coesão por domínio (controllers/routes/services) e utilitários compartilhados.

## Tecnologias
- Runtime: Node.js (LTS)
- Linguagem: TypeScript
- Framework HTTP: Express
- ORM: Prisma
- Banco de dados: PostgreSQL
- Autenticação: JWT (jsonwebtoken)
- Segurança: bcrypt/bcryptjs para hash de senha, CORS configurado
- Emails: Nodemailer (opcional)
- Validação: Zod (payloads)
- Config: dotenv

## Arquitetura e padrões
- Camadas
  - Routes: definem os endpoints e delegam para controllers
  - Controllers: validam entradas, invocam services, retornam respostas HTTP
  - Services: encapsulam regras de negócio e interações com o repositório (Prisma)
  - Prisma (Repository): mapeamento objeto-relacional para PostgreSQL
- Contratos
  - DTOs de entrada/saída validados com Zod
  - Respostas padronizadas com códigos e mensagens coerentes
- Timezone e datas
  - O backend interpreta o dia “local” (America/Sao_Paulo) para filtros de agenda
  - Utilitário `utils/time.ts` converte yyyy-MM-dd (local) para [startUtc, endUtc) ao filtrar reservas por dia
- Segurança
  - Hash de senhas com bcrypt/bcryptjs
  - JWT para autenticação
  - CORS restrito a origens conhecidas em produção
- Observabilidade
  - Logs básicos via console (pontos de melhoria em produção)

## Boas práticas adotadas
- Validação de entrada com Zod (controllers/middlewares)
- Separação clara de camadas (routes/controllers/services/utils)
- Tratamento de erros (try/catch) com respostas consistentes
- Conflito de agenda: verificação de interseção [start, end) e status pendente/aprovado
- Regra de sala inativa: não permite criar reserva se `Room.isActive` = false
- Ordenação de listagens: reservas ordenadas por `startTime`
- Uso de variáveis de ambiente em `.env` e `dotenv`
- Scripts NPM para tarefas comuns e reprodutíveis

## Setup e execução
Pré-requisitos:
- Node.js LTS
- PostgreSQL em execução local

Instalação e dev:
1. Configure o `.env` em `backend/.env` (veja seção Variáveis de ambiente)
2. Instale dependências: `npm install`
3. Aplique migrações: `npx prisma migrate dev` (ou `npm run migrate`)
4. (Opcional) Seed: `npm run seed`
5. Inicie em dev: `npm run dev` (porta padrão 4000)

Build e produção:
- `npm run build` (gera `dist/`)
- `npm start` (executa `dist/index.js`)

## Banco de dados e Prisma
- Models em `prisma/schema.prisma` (User, Room, Reservation)
- Migrações em `prisma/migrations/`
- Scripts úteis:
  - `npm run migrate` — aplica migrações
  - `npm run db:reset` — reseta banco (cuidado!)
  - `npm run seed` — popula dados básicos

Excertos do schema (resumo):
- User { id, fullName, email, matricula, password(hash), role, department, avatar_url }
- Room { id, name, capacity, resources[], bloco, department, operatingHours, isActive }
- Reservation { id, roomId, userId, title, description?, startTime, endTime, status, updatedAt }

## Diagrama de Entidades (ER)

Visualização das entidades e relacionamentos conforme `prisma/schema.prisma`.

```mermaid
erDiagram
  USER ||--o{ RESERVATION : "1:N"
  ROOM ||--o{ RESERVATION : "1:N"

  USER {
    string  id         PK
    string  fullName
    string  email      "UNIQUE"
    string  matricula  "UNIQUE"
    string  password
    string  role       "default: user"
    string  department "nullable"
    string  avatar_url "nullable"
  }

  ROOM {
    string  id          PK
    string  name
    int     capacity
    string  resources   "string[]"
    string  bloco
    string  department
    json    operatingHours "nullable"
    boolean isActive    "default: true"
  }

  RESERVATION {
    string   id         PK
    string   roomId     FK
    string   userId     FK
    string   title
    string   description "nullable"
    datetime startTime
    datetime endTime
    string   status     "default: pending"
    datetime updatedAt  "auto-update"
  }
```

Fallback ASCII (se seu viewer não renderizar Mermaid):

```
User (1) ───────< (N) Reservation (N) >─────── (1) Room

User
  - id (PK)
  - fullName
  - email (UNIQUE)
  - matricula (UNIQUE)
  - password
  - role (default: user)
  - department?
  - avatar_url?

Room
  - id (PK)
  - name
  - capacity
  - resources (string[])
  - bloco
  - department
  - operatingHours?
  - isActive (default: true)

Reservation
  - id (PK)
  - roomId (FK → Room.id)
  - userId (FK → User.id)
  - title
  - description?
  - startTime
  - endTime
  - status (default: pending)
  - updatedAt (auto)
```

Regras/observações:
- Uma Reserva pertence a um Usuário e a uma Sala (1:N para ambos os lados).
- Conflitos: o backend impede sobreposição de horários considerando [startTime, endTime).
- Reservas só são criadas em salas ativas (`Room.isActive = true`).
- `status ∈ { pending, approved, rejected, cancelled }`.
- `updatedAt` é mantido automaticamente pelo Prisma.

## Autenticação e autorização
- Login em `/auth/login` retorna JWT
- Rotas protegidas validam o token via middleware (ex.: bearer token)
- Papéis (roles): `user` e `admin`
- Fluxos admin: aprovação/rejeição de reservas, relatórios, gestão de salas

## Rotas principais (resumo)
- `/auth` — login/registro
- `/rooms` — CRUD de salas (com `isActive` para controle de uso)
- `/reservations` — criar/listar/atualizar/cancelar reservas; filtro por dia local (`?date=yyyy-MM-dd`)
- `/admin` — ações administrativas (aprovar/rejeitar reservas, relatórios)
- `/api/users` — gestão de usuários (admin)

Notas sobre reservas:
- Criação valida horários, impede fim <= início
- Impede reserva em sala inativa
- Checa conflitos por interseção de intervalos
- Status inicial: `pending`; admins podem mudar para `approved/rejected`

## Variáveis de ambiente (.env)
Exemplo:
```
DATABASE_URL="postgresql://USER:PASS@localhost:5432/agendador-sala-db"
JWT_SECRET="sua_chave_jwt_segura_aqui"
NODE_ENV=development
PORT=4000

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@dominio.com
SMTP_PASS=senha-ou-app-pass

# Admin padrão para seed
ADMIN_EMAIL=admin@escola.com
ADMIN_PASSWORD=troque-esta-senha

# Timezone (interpretação de dia local)
TZ=America/Sao_Paulo
```
Importante: não commit de credenciais reais. Use `.env.example` em repositórios públicos.

## Qualidade e observabilidade
- Lint/Typecheck: TypeScript no build
- Logs: console (sugestão: winston/pino para produção)
- Testes: pasta `tests/` para unitários/integrados (sugestão: jest/supertest)

## Troubleshooting
- “Falha ao conectar no banco”: confira `DATABASE_URL` e se o Postgres está ativo
- “Prisma Client not initialized”: rode `npx prisma generate` (normalmente feito no `migrate dev`)
- “Horários não batem com o dia”: verifique TZ no `.env` (America/Sao_Paulo) e payloads ISO no frontend
- Conflitos em reservas: revise intervalos e status

---

Qualquer dúvida ou melhoria desejada (ex.: paginar listagens, melhorar logs, adicionar testes), posso implementar e documentar! 🛠️
