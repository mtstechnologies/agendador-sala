# Sistema de Gestão de Reservas de Salas

**Documento de Especificação de Requisitos**  
Baseado no Padrão **ISO/IEC/IEEE 29148:2018**  
Data: 10/11/2025  
Versão: 1.1  
Status: Em Revisão

Changelog v1.1:
- Refatoração dos códigos de requisitos funcionais para correspondência 1:1 com endpoints (método + rota).
- Separação de requisitos funcionais puramente client-side (sem endpoint).
- Inclusão de Roadmap / Cronograma por Sprint.

---
## 1. Introdução
### 1.1 Propósito
Este documento descreve, de forma estruturada e rastreável, os requisitos funcionais e não funcionais do Sistema de Gestão de Reservas de Salas utilizado por instituições de ensino. Serve de referência para desenvolvimento, validação, testes, aceitação, operação e manutenção.

### 1.2 Escopo
Abrange funcionalidades de autenticação, reserva de salas, gestão de disponibilidade, prevenção de conflitos, comunicação (e-mails), relatórios e visualização de agenda diária. Não cobre integrações externas (ex: SSO, ERP) nem automações de manutenção predial.

### 1.3 Público-Alvo
- Coordenadores pedagógicos  
- Diretores escolares  
- Secretários acadêmicos  
- Professores (consulta/solicitação)  
- Equipe de TI (administração técnica)

### 1.4 Definições e Abreviações
| Termo | Definição |
|-------|-----------|
| Reserva | Bloco de tempo associado a uma sala. |
| Offset determinístico | Conversão de horário usando um deslocamento fixo de fuso (ex: UTC-3) para evitar discrepâncias de DST. |
| RBAC | Role-Based Access Control. |
| KPI | Indicador-chave de desempenho. |
| Pending | Reserva aguardando decisão de aprovação/rejeição. |

### 1.5 Referências
- ISO/IEC/IEEE 29148:2018 – Systems and software engineering — Life cycle processes — Requirements engineering.
- BABOK® Guide v3 – Business Analysis Body of Knowledge.
- OWASP ASVS – Application Security Verification Standard (segurança, referência parcial).

---
## 2. Requisitos Funcionais (FURPS+)
### 2.1 Endpoints (1:1 Método + Rota)
| Código | Método | Endpoint | Nome | Descrição (Resumo) | Prioridade | Dependências |
|--------|--------|----------|------|--------------------|------------|--------------|
| RF-AUTH-REGISTER | POST | /auth/register | Registrar Usuário | Cria usuário padrão role=user | Alta | - |
| RF-AUTH-LOGIN | POST | /auth/login | Login | Autentica e emite JWT | Alta | - |
| RF-AUTH-FORGOT | POST | /auth/forgot-password | Recuperar Senha | Inicia fluxo de reset | Média | RF-AUTH-REGISTER |
| RF-AUTH-RESET | POST | /auth/reset-password | Reset Senha | Define nova senha válida | Média | RF-AUTH-FORGOT |
| RF-ROOM-LIST | GET | /rooms | Listar Salas | Lista/pesquisa salas (filtros) | Alta | RF-AUTH-LOGIN |
| RF-ROOM-GET | GET | /rooms/:id | Obter Sala | Detalhe de uma sala | Média | RF-ROOM-LIST |
| RF-ROOM-CREATE | POST | /rooms | Criar Sala | Cadastro com atributos e recursos | Alta | RF-AUTH-LOGIN |
| RF-ROOM-UPDATE | PUT | /rooms/:id | Atualizar Sala | Edita / inativa sala | Alta | RF-ROOM-CREATE |
| RF-ROOM-DELETE | DELETE | /rooms/:id | Remover Sala | Exclusão lógica/futura física | Baixa | RF-ROOM-CREATE |
| RF-RES-LIST | GET | /reservations | Listar Reservas | Lista reservas (filtros: date, userId, page) | Alta | RF-AUTH-LOGIN |
| RF-RES-CREATE | POST | /reservations | Criar Reserva | Cria reserva pending com validação de conflito | Alta | RF-ROOM-LIST, RF-AUTH-LOGIN |
| RF-RES-UPDATE | PUT | /reservations/:id | Atualizar Reserva | Ajusta título/horários (revalida conflito) | Média | RF-RES-CREATE |
| RF-RES-CANCEL | PUT | /reservations/:id/cancel | Cancelar Reserva | Cancela antes do término | Média | RF-RES-CREATE |
| RF-ADMIN-RES-APPROVE | PUT | /admin/reservations/:id/approve | Aprovar Reserva | Define status=approved + email | Alta | RF-RES-CREATE |
| RF-ADMIN-RES-REJECT | PUT | /admin/reservations/:id/reject | Rejeitar Reserva | Define status=rejected + email | Alta | RF-RES-CREATE |
| RF-ADMIN-REPORTS | GET | /admin/reports | Relatórios | Dados agregados de uso | Média | RF-RES-CREATE |

Observações:
- Notificações de e-mail fazem parte dos fluxos RF-RES-CREATE, RF-ADMIN-RES-APPROVE e RF-ADMIN-RES-REJECT.
- Paginação e filtros (date, userId, page, pageSize) compõem RF-RES-LIST.

### 2.2 Funcionais Client-side (sem endpoint dedicado)
| Código | Nome | Descrição | Prioridade | Dependência |
|--------|------|-----------|------------|-------------|
| RF-FRONT-DASH-KPI | Dashboard KPIs | Exibir próximas reservas + contagens | Média | RF-RES-LIST |
| RF-FRONT-AGENDA | Agenda Visual | Grade diária posicionada por horário (UTC→Offset) | Alta | RF-RES-LIST |
| RF-FRONT-TEMA | Tema (Dark/Light/System) | Persistência e respeito a preferência SO | Baixa | - |
| RF-FRONT-AUDIT | Auditoria Básica UI | Exibir indicadores mínimos de ações | Baixa | RF-RES-CREATE |

### 2.3 Detalhamento e Critérios (Exemplos)
**RF-RES-CREATE – Criar Reserva**  
Critérios de Aceitação:
- Validar horário futuro (startTime > now).  
- endTime > startTime.  
- Conflito rejeitado com HTTP 409 (sobreposição com pending/approved).  
- Status inicial = pending.  
- Disparar e-mail (assíncrono; falha não invalida criação).  

**RF-RES-UPDATE – Atualizar Reserva**  
Critérios:
- Revalida conflitos com novos horários.  
- Mantém histórico de updatedAt.  

**RF-ADMIN-RES-APPROVE / RF-ADMIN-RES-REJECT**  
Critérios:
- Apenas admin (RBAC).  
- Envia e-mail de decisão.  
- Não permitir alteração após status final definido (approved/rejected) exceto cancelamento admin futuro (fora do escopo atual).  

**RF-RES-LIST – Listar Reservas**  
Critérios:
- Suportar filtros combinados (date + userId).  
- Paginação consistente (page,pageSize).  
- Ordenação padrão startTime asc.  

(Demais requisitos seguem padrão similar em anexo evolutivo.)

### 2.4 Contrato de API (Resumo)
Observações gerais:
- Todas as rotas protegidas exigem cabeçalho Authorization: Bearer <JWT>.
- Horários trafegam em UTC ISO 8601; exibição client usa offset determinístico.

Autenticação
- POST /auth/register
	- Body: { email, password, fullName }
	- 201 { user, token? }, 400/409 erros de validação/duplicidade
- POST /auth/login
	- Body: { email, password }
	- 200 { token, user }, 401 credenciais inválidas
- POST /auth/forgot-password
	- Body: { email }
	- 200 { message }, 404 se não encontrado
- POST /auth/reset-password
	- Body: { token, newPassword }
	- 200 { message }, 400 token inválido/expirado

Salas (rooms)
- GET /rooms
	- Query: { search?, page?, pageSize? }
	- 200 { items: Room[], pageInfo? }
- GET /rooms/:id
	- 200 Room, 404
- POST /rooms (admin)
	- Body: { name, capacity, resources?, bloco?, isActive? }
	- 201 Room, 400 validação
- PUT /rooms/:id (admin)
	- Body: campos parciais de Room
	- 200 Room, 404
- DELETE /rooms/:id (admin)
	- 204, 404

Reservas (reservations)
- GET /reservations
	- Query: { date?, userId?, page?, pageSize? }
	- 200 { items: Reservation[], pageInfo? }
- POST /reservations
	- Body: { roomId, title, description?, startTime, endTime }
	- 201 Reservation, 409 conflito, 400 validação
- PUT /reservations/:id
	- Body: { title?, description?, startTime?, endTime? }
	- 200 Reservation, 409 conflito, 404
- PUT /reservations/:id/cancel
	- 200 Reservation (status=cancelled), 400/404

Admin
- PUT /admin/reservations/:id/approve (admin)
	- 200 Reservation (status=approved), 404
- PUT /admin/reservations/:id/reject (admin)
	- 200 Reservation (status=rejected), 404
- GET /admin/reports (admin)
	- 200 { metrics: ... } (agregado)

---
## 3. Requisitos Não-Funcionais (FURPS+)
### 3.1 Performance (RNF01)
- Latência média de API < 250 ms em ambiente local.  
- Render inicial do Dashboard < 2 s.  
- Suportar 50 usuários simultâneos sem queda crítica.  

### 3.2 Usabilidade (RNF02)
- Tema escuro conforme critérios WCAG AA nas páginas principais.  
- Feedback rápido (toasts / skeletons) em ações assíncronas.  

### 3.3 Confiabilidade (RNF03)
- Falha de envio de email não bloqueia fluxo da reserva.  
- Reserva aprovada nunca é alterada automaticamente.  

### 3.4 Segurança (RNF04)
- JWT HS256 com issuer/audience validados.  
- Proteção contra acesso a rotas sem token.  
- Sanitização de entrada (camada de validação).  

### 3.5 Manutenibilidade (RNF05)
- Código client dividido em componentes, hooks genéricos e helpers de tempo.  
- Redução de duplicidades via abstrações (useApiQuery/useApiMutation).  

### 3.6 Portabilidade (RNF06)
- Stack baseada em Node/Express/Prisma/PostgreSQL e React+Vite (ambiente facilmente containerizável).  

### 3.7 Suporte/Operação (RNF07)
- Logs de eventos críticos (criação, decisão, cancelamento).  
- Configuração de SMTP e segredos via .env.  

---
## 4. Regras de Negócio (BABOK)
| Código | Regra | Descrição |
|--------|-------|-----------|
| RN01 | Conflito de Horário | Não permitir sobreposição entre [start, end) de reservas pending/approved |
| RN02 | Sala Inativa | Não aceitar novas reservas em sala inativa |
| RN03 | Cancelamento Condicional | Cancelar só antes do término e status pending/approved |
| RN04 | Intervalo Horário Diário | Grade padrão 07:00–21:00 (parametrizável futura versão) |
| RN05 | Status Permitidos | pending, approved, rejected, cancelled |
| RN06 | Notificação | Enviar email em criação e decisão (opção BCC admin) |
| RN07 | Offset Determinístico | Exibir e posicionar horários com base em offset fixo UTC-3 |

---
## 5. Modelo de Dados
### 5.1 Entidades
**User**(id, email, fullName, role, department?, createdAt, updatedAt)  
**Room**(id, name, capacity, resources[], bloco?, isActive, createdAt, updatedAt)  
**Reservation**(id, userId, roomId, title, description?, startTime(UTC ISO), endTime(UTC ISO), status, createdAt, updatedAt)  
**(Futuro) AuditLog/EmailLog**(id, type, meta, sentAt, status)

### 5.2 Relacionamentos
- User 1..N Reservation  
- Room 1..N Reservation  

### 5.3 Regras de Integridade
- FK obrigatória: reservation.userId e reservation.roomId.  
- Não excluir sala se possuir reservas (regra pode ser flexibilizada com parâmetro force).  

---
## 6. Critérios SMART
| Código | Objetivo | Métrica | Prazo |
|--------|----------|--------|-------|
| S1 | Criar reserva em < 30s (95%) | Tempo medido de UX | Fim Sprint 1 |
| S2 | Consistência de horário | 0 divergências detectadas | Sprint 2 |
| S3 | Cobertura testes helpers | ≥ 90% linhas | Sprint 3 |
| S4 | Performance Dashboard | TTFB < 2 s | Sprint 2 |
| S5 | Sucesso de emails | ≥ 98% enviados | Sprint 3 |

---
## 7. Matriz de Rastreabilidade (Trecho)
| Requisito | Histórias | Entidades/Rotas | Testes (IDs planejados) |
|-----------|----------|-----------------|------------------------|
| RF-RES-CREATE | US05 | POST /reservations | T-RES-CRI-01 |
| RF-RES-UPDATE | US05 | PUT /reservations/:id | T-RES-UPD-01 |
| RF-RES-LIST | US06/US12 | GET /reservations | T-RES-LIST-01 / T-DASH-NEXT-01 |
| RF-ADMIN-RES-APPROVE | US08 | PUT /admin/reservations/:id/approve | T-RES-DEC-01 |
| RF-ADMIN-RES-REJECT | US09 | PUT /admin/reservations/:id/reject | T-RES-DEC-02 |
| RF-ADMIN-REPORTS | US15 | GET /admin/reports | T-REPORT-01 |
| RF-FRONT-DASH-KPI | US12 | (derivado) | T-DASH-KPI-01 |
| RF-AUTH-LOGIN | US13 | POST /auth/login | T-AUTH-LOGIN-01 |
| RF-ROOM-CREATE | US01 | POST /rooms | T-ROOM-CRI-01 |
| RF-ROOM-UPDATE | US02 | PUT /rooms/:id | T-ROOM-UPD-01 |

---
## 8. Glossário
| Termo | Significado |
|-------|-------------|
| Reserva | Registro de uso de sala em intervalo definido |
| Pending | Estado inicial aguardando decisão |
| Approved | Estado de reserva aceita |
| Cancelled | Estado quando encerrada antes do uso |
| Rejected | Estado quando negada pelo admin |
| RBAC | Controle de acesso por papel |
| KPI | Métrica de acompanhamento |
| Offset | Deslocamento fixo aplicado a UTC para exibição local |

---
## 9. Critérios de Validação
- Testes automatizados para helpers de tempo e conflitos.  
- Testes de integração das rotas de reserva (CRUD + decisão).  
- Teste manual de emails em ambiente de desenvolvimento (EMAIL_DEBUG=true).  

## 10. Requisitos Futuros (Backlog de Evolução)
- Integração com calendário externo (Google / Outlook).  
- Exportação de relatórios (CSV/PDF).  
- Painel de auditoria avançado.  
- Mecanismo de notificação push/websocket.

---
## 11. Roadmap / Cronograma (Sprints)
| Sprint | Duração (semanas) | Foco | Requisitos / Itens |
|--------|------------------|------|--------------------|
| Sprint 1 | 2 | MVP Núcleo | RF-AUTH-REGISTER, RF-AUTH-LOGIN, RF-ROOM-CREATE, RF-ROOM-LIST, RF-RES-CREATE, RF-RES-LIST (básico userId/date), RF-ADMIN-RES-APPROVE, RF-ADMIN-RES-REJECT, RF-FRONT-AGENDA (mínimo), RF-FRONT-TEMA (base) |
| Sprint 2 | 2 | Consolidação & UX | RF-RES-UPDATE, RF-RES-CANCEL, RF-ROOM-UPDATE, RF-ROOM-GET, RF-ROOM-DELETE, Paginação (RF-RES-LIST completo), RF-FRONT-DASH-KPI, RF-ADMIN-REPORTS, Emails robustos |
| Sprint 3 | 2 | Qualidade & Métricas | Testes conflitos, Auditoria básica (RF-FRONT-AUDIT), Otimizações performance, Refino de acessibilidade tema, Relatórios enriquecidos |
| Sprint 4 | 2 | Evolução | Exportações, Backlog futuro inicial (notificação push), Preparação para calendário externo |

Marcos:
- M1 (Fim Sprint 1): CRUD essencial funcionando com aprovação.
- M2 (Fim Sprint 2): Dashboard e relatórios iniciais prontos.
- M3 (Fim Sprint 3): Cobertura de testes críticos ≥ 70% helpers/reservas.

Riscos de cronograma: Dependência de ajustes de conflito e envio de e-mail assíncrono pode estender Sprint 1 se não paralelizado.

## 12. Aprovações
| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Produto | (Preencher) | - | - |
| Técnico | (Preencher) | - | - |
| Negócio | (Preencher) | - | - |

---
_Atualizações futuras devem versionar este documento (v1.2, v1.3...) e manter registro de mudanças._
