# Sistema de Gerenciamento de Reservas de Salas

Sistema completo para gerenciar reservas de salas em instituições de ensino, desenvolvido com React, TypeScript, Tailwind CSS e API REST própria (backend Node.js/Express + PostgreSQL).

## 🚀 Funcionalidades

- **Autenticação de Usuários**: Login e cadastro seguro com diferentes perfis (Usuário Comum e Administrador)
- **Gerenciamento de Salas**: Cadastro, edição e listagem de salas com capacidade e recursos
- **Sistema de Reservas**: Criação, visualização e cancelamento de reservas
- **Controle de Conflitos**: Verificação automática de disponibilidade
- **Calendário Interativo**: Visualização clara da disponibilidade das salas
- **Notificações**: Sistema de notificações por email para confirmações e cancelamentos
- **Relatórios**: Geração de relatórios de ocupação e uso das salas
- **Interface Responsiva**: Design moderno e adaptável para desktop, tablet e mobile
- **Aprovação de Reservas**: Sistema de aprovação para administradores

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Headless UI
- **Backend**: API REST Node.js/Express + PostgreSQL
- **Gerenciamento de Estado**: TanStack Query (React Query)
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router DOM
- **Ícones**: Lucide React
- **Utilitários**: date-fns, clsx, tailwind-merge

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)


## 🚀 Configuração do Ambiente de Desenvolvimento

### 1. Clone o repositório (se aplicável)
```bash
git clone <url-do-repositorio>
cd sistema-reserva-salas
```

### 2. Instale as dependências
```bash
npm install
```


### 3. Configuração do Backend/API

Certifique-se de que o backend (API REST Node.js/Express) esteja rodando localmente (por padrão em `http://localhost:4000`).

O frontend não depende mais de Supabase. Não há variáveis de ambiente obrigatórias para integração de dados.


### 4. Configuração do Banco de Dados

O banco de dados relacional (PostgreSQL) é gerenciado pelo backend. Siga as instruções do backend para rodar as migrações e garantir que a API REST esteja funcional.


### 5. Variáveis de ambiente do Frontend

Crie um arquivo `.env` dentro de `frontend/` para configurar a URL da API (opcional em dev, mas recomendado):

```
VITE_API_URL=http://localhost:4000
# Alternativa suportada pelo hook de eventos: VITE_API_BASE_URL
# (se ambas definidas, VITE_API_BASE_URL tem precedência)
```

O cliente de API (`src/lib/api.ts`) usa `VITE_API_URL` para construir as rotas. Se não definido, usa `http://localhost:4000` como padrão.

Paginação e flags úteis:

```
VITE_FEATURE_PAGINATION_ENFORCED=false
VITE_DEFAULT_PAGE_SIZE=9
VITE_DEBUG_API=false
VITE_DEBUG_RESERVATIONS=false
```
Use `VITE_FEATURE_PAGINATION_ENFORCED=true` em conjunto com `REQUIRE_PAGINATION=true` no backend para reforçar o uso de paginação no app.
Ative `VITE_DEBUG_API=true` para logar normalização camelCase de respostas e `VITE_DEBUG_RESERVATIONS=true` para rastrear fluxo otimista/cache de reservas.

### 6.1. Atualização em tempo real (SSE)

O frontend escuta eventos do backend (SSE) para atualizar as listas de reservas automaticamente sem refresh.

- Endpoint SSE do backend: `GET /reservations/events?token=<JWT>`
- O hook `useReservationEvents(enabled)` cria um `EventSource` usando o token salvo no `localStorage` e, ao receber eventos (`reservation-created`, `reservation-updated`, `reservation-cancelled`), invalida as queries relevantes do React Query (`reservations`, `my-reservations`, `room-availability`).
- Requisitos: estar autenticado (JWT no `localStorage`) e definir `VITE_API_URL` (ou `VITE_API_BASE_URL`).

Exemplo de uso (já integrado na página de administração):

```tsx
// src/pages/admin/AdminReservationsPage.tsx
import { useReservationEvents } from '../../hooks/useReservationEvents'

export function AdminReservationsPage() {
	useReservationEvents(true) // ativa SSE enquanto a página estiver montada
	// ... resto da página
}
```

Observações:
- O hook fecha a conexão em caso de erro; você pode estender com reconexão exponencial se necessário.
- Por segurança, o backend só envia o evento `reservation-created` para conexões com role `admin`.
- O token é enviado na query string por limitação do `EventSource` (não envia Authorization por header nativamente).

### 6. Executar a aplicação

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173` (ou porta próxima) e consumirá a API REST configurada em `VITE_API_URL`.

## 👤 Usuários de Teste

### Usuário administrador padrão (seguro)

O sistema já cria um usuário admin padrão automaticamente ao rodar o seed do backend, seguindo boas práticas:

- O email e a senha do admin são definidos por variáveis de ambiente no backend (`.env`):
  - `ADMIN_EMAIL` (padrão: admin@escola.com)
  - `ADMIN_PASSWORD` (padrão: admin123!troque)
- O seed só cria o admin se ele ainda não existir.
- A senha é armazenada de forma segura (bcrypt).

**Como usar:**
1. Defina as variáveis no arquivo `backend/.env` antes de rodar o seed:
	```env
	ADMIN_EMAIL=admin@escola.com
	ADMIN_PASSWORD=umaSenhaForteAqui
	```
2. Execute o seed do backend:
	```bash
	cd backend
	npx prisma db seed
	```
3. Faça login com o email e senha definidos.
4. Altere a senha após o primeiro acesso para maior segurança.

## 📁 Estrutura de pastas (frontend)

```
frontend/
├── public/
│   └── index.html
└── src/
	├── components/              # Componentes reutilizáveis
	│   ├── ui/                  # Componentes de interface básicos
	│   ├── layout/              # Header, Sidebar, Layout
	│   └── forms/               # Componentes de formulários
	├── pages/                   # Páginas da aplicação (rotas)
	├── hooks/                   # Custom hooks (ex.: useAuth, useRooms, useReservations)
	├── lib/                     # Configurações e clientes (ex.: api, toast, time)
	├── types/                   # Definições de tipos TypeScript
	└── utils/                   # Funções utilitárias
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run preview` - Visualiza a build de produção
- `npm run lint` - Executa o linter

## 📊 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Login e registro de usuários
- [x] Perfis de usuário (Comum e Administrador)
- [x] Proteção de rotas

### ✅ Gerenciamento de Salas
- [x] Listagem de salas
- [x] Cadastro de novas salas (admin)
- [x] Cadastro de novos usuarios (admin)
- [x] Edição de salas (admin)
- [ ] Definição de horários de funcionamento
- [ ] Configuração de recursos

### ✅ Sistema de Reservas
- [x] Visualização de disponibilidade
- [x] Criação de reservas
- [x] Cancelamento de reservas
- [x] Aprovação/rejeição (admin)
- [x] Verificação de conflitos
- [x] Paginação nas listagens de reservas (hooks paginados)

### ✅ Interface
- [ ] Design responsivo
- [ ] Calendário interativo
- [ ] Dashboard administrativo
- [ ] Filtros e busca

## 🚀 Deploy

### Preparação para produção:
1. Configure as variáveis de ambiente no seu provedor de hospedagem
2. Execute `npm run build`
3. Faça o deploy da pasta `dist`

### Recomendações de hospedagem:
- Frontend: Vercel, Netlify ou qualquer CDN estática
- Backend: VM/Container (Docker), Railway, Render, Fly.io, Azure App Service, etc.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema:
- Abra uma issue no repositório
- Entre em contato com a equipe de TI da instituição

---

**Desenvolvido com ❤️ para otimizar o gerenciamento de espaços educacionais**

## 🔌 Hooks de reservas (paginados)

- `useMyReservationsPaginated(userId, page, pageSize, filter)`
	- Retorna `{ items, page, pageSize, total, totalPages }`
	- Filtros: `{ status?: 'pending'|'approved'|'rejected'|'cancelled'|'all', date?: 'yyyy-MM-dd', roomId?: string }`

- `useReservationsPaginated(page, pageSize, filter)`
	- Listagem geral (admin/consultas)

Observação: endpoints agora retornam sempre objeto paginado; evite depender de arrays simples.

## 🔔 Hook de eventos em tempo real

- `useReservationEvents(enabled: boolean)`
	- Abre conexão SSE com o backend e invalida caches quando reservas são criadas/alteradas/canceladas.
	- Pré-requisitos: usuário autenticado (JWT salvo) e `VITE_API_URL`/`VITE_API_BASE_URL` configurada.