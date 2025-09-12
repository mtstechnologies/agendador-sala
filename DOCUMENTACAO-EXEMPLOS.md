# Exemplos de Documentação e Boas Práticas

## Hooks Customizados
```ts
/**
 * useRooms
 * Hook para buscar e manipular salas via API REST.
 *
 * Exemplo de uso:
 * const { data: rooms, isLoading } = useRooms();
 */
export function useRooms() {
  // ...implementação
}
```

## Componentes
```tsx
/**
 * <RoomCard />
 * Exibe informações de uma sala e permite ação de reserva.
 *
 * Props:
 * - room: Room (objeto da sala)
 * - onReserve?: (room: Room) => void
 *
 * Exemplo:
 * <RoomCard room={room} onReserve={handleReserve} />
 */
export function RoomCard({ room, onReserve }: RoomCardProps) {
  // ...implementação
}
```

## Estrutura de Pastas
```md
src/components/      # Componentes reutilizáveis (UI, domínio, layout)
src/pages/           # Páginas e rotas principais
src/hooks/           # Hooks customizados para dados e lógica de negócio
src/types/           # Tipos TypeScript globais
src/lib/             # Helpers e integrações externas (se necessário)
src/utils/           # Funções utilitárias puras
```

## Setup Rápido
```md
1. Instale as dependências:
   npm install
2. Inicie o backend:
   cd backend
   npm run dev
3. Inicie o frontend:
   cd frontend
   npm run dev
4. Acesse http://localhost:5173/
```

## Consumo da API REST
```md
- GET /rooms           → Lista de salas
- POST /rooms          → Criação de sala (admin)
- GET /reservations    → Reservas do usuário
- POST /auth/login     → Login de usuário
- POST /auth/register  → Cadastro de usuário
```

## Testes Automatizados
```md
- Os testes ficam em `src/__tests__/` ou ao lado dos arquivos como `MeuComponente.test.tsx`.
- Utilize [Vitest](https://vitest.dev/) ou [Jest](https://jestjs.io/) para testes unitários e de integração.
- Para componentes React, use [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/).

Exemplo de teste:
```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '../components/ui/Button'

test('renderiza botão com texto', () => {
  render(<Button>Salvar</Button>)
  expect(screen.getByText('Salvar')).toBeInTheDocument()
})
```
```

## Contexto Global
```tsx
/**
 * AuthProvider
 * Contexto global para autenticação.
 *
 * Exemplo de uso:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 *
 * Para acessar:
 * const { user, signIn, signOut } = useAuthContext();
 */
```

## Padrão de Commits
```md
- feat: Nova funcionalidade
- fix: Correção de bug
- refactor: Refatoração de código
- docs: Atualização de documentação
- style: Ajustes de formatação/estilo
- test: Adição ou ajuste de testes
- chore: Tarefas de build, configs, etc.

Exemplo:
feat(auth): adicionar fluxo de recuperação de senha
```
