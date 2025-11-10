# Histórias de Usuário – Sistema de Gestão de Reservas de Salas
Data: 10/11/2025  
Versão: 1.1  
Status: Em Revisão

Changelog v1.1:
- Alinhamento das histórias aos novos códigos de requisitos (RF-*) 1:1 com endpoints.
- Correção de endpoints de decisão de reservas para rotas admin.

---
## 1. Épicos
### 1.1 Gerenciamento de Dados Base
- Cadastro, edição e inativação de salas.
### 1.2 Ciclo de Vida de Reservas
- Solicitação, aprovação/rejeição, cancelamento e visualização em agenda.
### 1.3 Autenticação & RBAC
- Login, logout, controle de perfis (admin/usuário).
### 1.4 Relatórios & KPIs
- Métricas de uso, próximas reservas e estatísticas mensais.
### 1.5 Comunicação
- Emails de criação e decisão de reservas.
### 1.6 UX & Tema
- Modo claro/escuro/sistema e feedback responsivo.

---
## 2. Histórias Detalhadas

### US01 – Cadastro de Salas
**Como** administrador  
**Quero** cadastrar uma sala com nome, capacidade, recursos e bloco (opcional)  
**Para** disponibilizá-la para reservas
**Critérios de Aceitação:**
- ✅ Não permitir salvar sem nome e capacidade.
- ✅ Persistir recursos como lista de strings.
- ✅ Exibir sala imediatamente na listagem após criação.
**Tarefas Técnicas:**
- [ ] Backend: POST /rooms (validação + modelo Prisma)  
- [ ] Frontend: Formulário + hook `useCreateRoom`  
- [ ] Teste: T-ROOM-CRI-01 (campos obrigatórios)

Requisitos Relacionados: RF-ROOM-CREATE, RF-ROOM-LIST

### US02 – Edição/Inativação de Sala
**Como** administrador  
**Quero** editar atributos e inativar sala  
**Para** controlar sua disponibilidade
**Critérios de Aceitação:**
- ✅ Inativar bloqueia novas reservas (conflitos não criados).  
- ✅ Editar atualiza caches em lista e detalhes.  
**Tarefas:**
- [ ] Backend: PUT /rooms/:id  
- [ ] Frontend: Ação no card/lista + `useUpdateRoom`  
- [ ] Teste: T-ROOM-UPD-01

Requisitos Relacionados: RF-ROOM-UPDATE

### US03 – Busca/Listagem de Salas
**Como** usuário  
**Quero** localizar salas por nome ou recurso  
**Para** agilizar reservas
**Critérios:**
- ✅ Busca case-insensitive.  
- ✅ Mostra indicador de sala inativa.  
**Tarefas:**
- [ ] Backend: GET /rooms?search=  
- [ ] Frontend: Campo de busca + filtro local inicial  
- [ ] Teste: T-ROOM-LIST-01

Requisitos Relacionados: RF-ROOM-LIST

### US04 – Agenda Visual do Dia
**Como** usuário  
**Quero** ver reservas por sala em grade horária  
**Para** identificar janelas livres
**Critérios:**
- ✅ Horários exibidos com offset determinístico (UTC-3).  
- ✅ Não exibir reservas canceladas/rejeitadas como ativas.  
**Tarefas:**
- [ ] Backend: GET /reservations?date=YYYY-MM-DD  
- [ ] Frontend: Componente de agenda + posicionamento pelo helper de hora  
- [ ] Teste: T-SCHED-01

Requisitos Relacionados: RF-RES-LIST, RF-FRONT-AGENDA

### US05 – Solicitar Reserva
**Como** usuário  
**Quero** solicitar reserva informando sala, data, hora de início e fim  
**Para** garantir uso organizado
**Critérios:**
- ✅ Não permitir fim ≤ início.  
- ✅ Não permitir criar no passado.  
- ✅ Status inicial pending.  
**Tarefas:**
- [ ] Backend: POST /reservations + validações  
- [ ] Frontend: Form + `useCreateReservation`  
- [ ] Teste: T-RES-CRI-01

Requisitos Relacionados: RF-RES-CREATE

### US06 – Minhas Reservas
**Como** usuário  
**Quero** ver minha lista de reservas com status e horários  
**Para** acompanhar a situação
**Critérios:**
- ✅ Paginação (page/pageSize).  
- ✅ Filtro por status/data.  
**Tarefas:**
- [ ] Backend: GET /reservations?userId=  
- [ ] Frontend: Página + `useMyReservationsPaginated`  
- [ ] Teste: T-RES-LIST-01

Requisitos Relacionados: RF-RES-LIST

### US07 – Prevenir Conflito
**Como** sistema  
**Quero** impedir sobreposição de intervalos de reservas não finalizadas  
**Para** evitar uso concorrente
**Critérios:**
- ✅ Erro 409 com mensagem clara.  
- ✅ Considerar apenas pending/approved.  
**Tarefas:**
- [ ] Backend: Lógica no create/update  
- [ ] Teste: T-RES-CON-01

Requisitos Relacionados: RF-RES-CREATE, RF-RES-UPDATE

### US08 – Aprovar Reserva
**Como** administrador  
**Quero** aprovar reserva pendente  
**Para** confirmar ocupação
**Critérios:**
- ✅ Apenas admin.  
- ✅ Email de confirmação.  
**Tarefas:**
- [ ] Backend: PUT /admin/reservations/:id/approve  
- [ ] Teste: T-RES-DEC-01

Requisitos Relacionados: RF-ADMIN-RES-APPROVE

### US09 – Rejeitar Reserva
**Como** administrador  
**Quero** rejeitar reserva pendente  
**Para** liberar o horário
**Critérios:**
- ✅ Apenas admin.  
- ✅ Email de rejeição.  
**Tarefas:**
- [ ] Backend: PUT /admin/reservations/:id/reject  
- [ ] Teste: T-RES-DEC-02

Requisitos Relacionados: RF-ADMIN-RES-REJECT

### US10 – Email de Criação
**Como** sistema  
**Quero** enviar email de reserva criada (pendente)  
**Para** notificar solicitante
**Critérios:**
- ✅ Contém sala, título e período formatado.  
- ✅ Falha não bloqueia criação.  
**Tarefas:**
- [ ] Backend: Util de email + template  
- [ ] Teste: T-EMAIL-CRI-01

Requisitos Relacionados: RF-RES-CREATE

### US11 – Email de Decisão
**Como** sistema  
**Quero** enviar email ao decidir reserva (approved/rejected)  
**Para** informar resultado
**Critérios:**
- ✅ BCC admin opcional.  
- ✅ Período consistente com offset.  
**Tarefas:**
- [ ] Backend: Util + decisão  
- [ ] Teste: T-EMAIL-DEC-01

Requisitos Relacionados: RF-ADMIN-RES-APPROVE, RF-ADMIN-RES-REJECT

### US12 – Próximas Reservas no Dashboard
**Como** usuário  
**Quero** visualizar as próximas 3 reservas futuras (pending/approved)  
**Para** planejar minhas atividades
**Critérios:**
- ✅ Ordenar por startTime asc.  
- ✅ Exibir intervalo de horas consistente.  
**Tarefas:**
- [ ] Backend: GET /reservations?userId= (sem filtro futuro dedicado)  
- [ ] Frontend: Filtrar e exibir  
- [ ] Teste: T-DASH-NEXT-01

Requisitos Relacionados: RF-RES-LIST, RF-FRONT-DASH-KPI

### US13 – Login e Logout
**Como** usuário  
**Quero** autenticar via email/senha e sair da sessão  
**Para** acessar funcionalidades restritas
**Critérios:**
- ✅ JWT com expiração.  
- ✅ Mensagem clara em sessão expirada.  
**Tarefas:**
- [ ] Backend: /auth/login /auth/register  
- [ ] Frontend: AuthContext + forms  
- [ ] Teste: T-AUTH-01

Requisitos Relacionados: RF-AUTH-LOGIN, RF-AUTH-REGISTER

### US14 – RBAC Admin
**Como** administrador  
**Quero** acessar rotas restritas de gestão  
**Para** operar o sistema
**Critérios:**
- ✅ Rotas verificam role=admin.  
- ✅ Redirecionamento seguro para dashboard.  
**Tarefas:**
- [ ] Backend: Middleware isAdmin  
- [ ] Frontend: ProtectedRoute adminOnly  
- [ ] Teste: T-RBAC-01

Requisitos Relacionados: RF-ADMIN-RES-APPROVE, RF-ADMIN-RES-REJECT, RF-ADMIN-REPORTS, RF-AUTH-LOGIN

### US15 – Relatórios de Uso
**Como** gestor  
**Quero** visualizar estatísticas mensais de reserva  
**Para** avaliar utilização de salas
**Critérios:**
- ✅ Top salas approved.  
- ✅ Distribuição por status.  
**Tarefas:**
- [ ] Backend: GET /admin/reports  
- [ ] Frontend: ReportsPage  
- [ ] Teste: T-REPORT-01

Requisitos Relacionados: RF-ADMIN-REPORTS

### US16 – Tema Escuro/Claro/Sistema
**Como** usuário  
**Quero** alternar entre tema claro/escuro ou seguir o sistema  
**Para** melhorar conforto visual
**Critérios:**
- ✅ Persistência em localStorage.  
- ✅ Aplicação antes do primeiro paint (minimizar flicker).  
**Tarefas:**
- [ ] Frontend: ThemeProvider + toggle  
- [ ] Teste: T-THEME-01

Requisitos Relacionados: RF-FRONT-TEMA

---
## 3. Backlog Prioritizado
### Sprint 1 (MVP)
US13, US01, US02, US05, US07, US06, US08, US09, US10, US11, US04 (mínimo), base do Theme (US16 parcial)
### Sprint 2 (Geração Básica)
US03, US12, US15, Consolidação tema (US16 completo), otimizações de cache/paginação
### Sprint 3 (Refinamento)
Auditoria (extensão RF15), exportação simples, testes avançados, melhorias de performance

---
## 4. Definição de Pronto (DoD)
Para uma história ser considerada **Pronta**:
- Código integrado (branch merge clean)  
- Lint e build sem erros  
- Testes relevantes PASS  
- Critérios de aceitação validados manual ou automatizado  
- Sem dados sensíveis em logs  
- Documentação de rota ou comportamento atualizada  
- UI verificada em ambos temas quando aplicável

---
## 5. Template para Novas Histórias
**Como** [tipo de usuário]  
**Quero** [objetivo]  
**Para** [benefício]

**Critérios de Aceitação:**
- ✅ [Critério 1]
- ✅ [Critério 2]
- ✅ [Critério 3]

**Tarefas Técnicas:**
- [ ] Backend: [rota/validações]
- [ ] Frontend: [componentes/hooks]
- [ ] Testes: [unidade/integrado]
- [ ] Documentação: [atualização]

**Métricas (Opcional):**
- Tempo de resposta esperado, limites de carga, cobertura de teste.

---
## 6. Rastreabilidade (Exemplo Simplificado)
| História | Requisitos Relacionados | Testes |
|----------|-------------------------|--------|
| US01 | RF-ROOM-CREATE, RF-ROOM-LIST | T-ROOM-CRI-01 |
| US02 | RF-ROOM-UPDATE | T-ROOM-UPD-01 |
| US03 | RF-ROOM-LIST | T-ROOM-LIST-01 |
| US04 | RF-RES-LIST, RF-FRONT-AGENDA | T-SCHED-01 |
| US05 | RF-RES-CREATE | T-RES-CRI-01 |
| US06 | RF-RES-LIST | T-RES-LIST-01 |
| US07 | RF-RES-CREATE, RF-RES-UPDATE | T-RES-CON-01 |
| US08 | RF-ADMIN-RES-APPROVE | T-RES-DEC-01 |
| US09 | RF-ADMIN-RES-REJECT | T-RES-DEC-02 |
| US10 | RF-RES-CREATE | T-EMAIL-CRI-01 |
| US11 | RF-ADMIN-RES-APPROVE, RF-ADMIN-RES-REJECT | T-EMAIL-DEC-01 |
| US12 | RF-RES-LIST, RF-FRONT-DASH-KPI | T-DASH-NEXT-01 |
| US13 | RF-AUTH-LOGIN, RF-AUTH-REGISTER | T-AUTH-01 |
| US14 | RF-ADMIN-RES-APPROVE, RF-ADMIN-RES-REJECT, RF-ADMIN-REPORTS, RF-AUTH-LOGIN | T-RBAC-01 |
| US15 | RF-ADMIN-REPORTS | T-REPORT-01 |
| US16 | RF-FRONT-TEMA | T-THEME-01 |

---
## 7. Riscos & Mitigações
| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Falha SMTP | Emails não entregues | Log e retry futuro (fila) |
| Conflitos não detectados | Uso simultâneo | Testes robustos + regra única de lógica |
| Timezone do SO | Horário divergente | Offset determinístico fixo |
| Crescimento de dados | Degradação listagens | Paginação e índices DB |

---
## 8. Próximas Extensões
- Integração calendário externo (Google/Outlook).  
- Exportação CSV/PDF de relatórios.  
- WebSocket para atualizações em tempo real.  
- Painel de auditoria avançado.

---
_Manter este documento sincronizado com incrementos do backlog e revisões de arquitetura._
