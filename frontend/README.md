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


### 5. Executar a aplicação

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173` e consumirá a API REST do backend em `http://localhost:4000`.

## 👤 Usuários de Teste


### Criando o primeiro usuário administrador:
1. Registre-se normalmente na aplicação.
2. No banco de dados local, promova o usuário para admin via SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@escola.com';
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes de interface básicos
│   ├── layout/         # Componentes de layout
│   └── forms/          # Componentes de formulários
├── pages/              # Páginas da aplicação
├── hooks/              # Custom hooks
├── lib/                # Configurações e utilitários
├── types/              # Definições de tipos TypeScript
└── utils/              # Funções utilitárias
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
- [x] Edição de salas (admin)
- [x] Definição de horários de funcionamento
- [x] Configuração de recursos

### ✅ Sistema de Reservas
- [x] Visualização de disponibilidade
- [x] Criação de reservas
- [x] Cancelamento de reservas
- [x] Aprovação/rejeição (admin)
- [x] Verificação de conflitos

### ✅ Interface
- [x] Design responsivo
- [x] Calendário interativo
- [x] Dashboard administrativo
- [x] Filtros e busca

## 🚀 Deploy

### Preparação para produção:
1. Configure as variáveis de ambiente no seu provedor de hospedagem
2. Execute `npm run build`
3. Faça o deploy da pasta `dist`

### Recomendações de hospedagem:
- **Frontend**: Vercel, Netlify, ou GitHub Pages
- **Backend**: Supabase (já configurado)

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