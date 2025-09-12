# 🧪 Guia de Testes - Sistema de Reservas

## 🚀 Como Testar a Aplicação

### 1. **Configuração Inicial**

#### Passo 1: Configurar Supabase
1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Preencha:
   - **Nome**: "Sistema Reserva Salas"
   - **Organização**: Selecione ou crie uma
   - **Região**: South America (São Paulo)
   - **Senha**: Crie uma senha forte
4. Aguarde a criação (2-3 minutos)

#### Passo 2: Obter Credenciais
1. No dashboard do Supabase, vá para **Settings > API**
2. Copie:
   - **Project URL** 
   - **Project API Key (anon/public)**
3. Substitua no arquivo `.env`:
   ```env
   VITE_SUPABASE_URL=sua_project_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
   ```

#### Passo 3: Configurar Banco de Dados
1. No Supabase, vá para **SQL Editor**
2. Copie e execute o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
3. Clique em **Run** para executar

### 2. **Executar a Aplicação**

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse: `http://localhost:5173`

### 3. **Cenários de Teste**

#### 🔐 **Teste 1: Autenticação**

**Criar Usuário Comum:**
1. Clique em "Não tem uma conta? Cadastre-se"
2. Preencha:
   - Nome: "João Silva"
   - Email: "joao@escola.com"
   - Departamento: "Matemática"
   - Senha: "123456"
3. ✅ **Resultado esperado**: Login automático e redirecionamento para dashboard

**Criar Usuário Administrador:**
1. Registre-se normalmente
2. No Supabase Dashboard > **Authentication > Users**
3. Copie o **User ID**
4. No **SQL Editor**, execute:
   ```sql
   UPDATE user_profiles 
   SET role = 'admin' 
   WHERE id = 'SEU_USER_ID_AQUI';
   ```
5. Faça logout e login novamente
6. ✅ **Resultado esperado**: Menu administrativo aparece na sidebar

#### 🏢 **Teste 2: Visualização de Salas**

1. Acesse **"Salas"** no menu
2. ✅ **Resultado esperado**: 
   - Lista de 8 salas pré-cadastradas
   - Informações de capacidade e recursos
   - Botão "Reservar" em cada sala

**Teste de Busca:**
1. Digite "Laboratório" na busca
2. ✅ **Resultado esperado**: Filtrar apenas laboratórios

#### 📅 **Teste 3: Criar Reserva**

1. Na página de salas, clique **"Reservar"** em qualquer sala
2. Preencha:
   - Título: "Aula de Matemática"
   - Descrição: "Aula sobre equações"
   - Data: Amanhã
   - Início: "14:00"
   - Fim: "16:00"
3. Clique **"Reservar"**
4. ✅ **Resultado esperado**: 
   - Reserva criada com status "Pendente"
   - Redirecionamento para lista de reservas

#### 📋 **Teste 4: Gerenciar Reservas (Usuário)**

1. Acesse **"Minhas Reservas"**
2. ✅ **Resultado esperado**: Ver sua reserva criada
3. Teste os filtros: "Pendentes", "Todas", etc.
4. Clique **"Cancelar"** em uma reserva
5. ✅ **Resultado esperado**: Status muda para "Cancelada"

#### 👨‍💼 **Teste 5: Painel Administrativo**

**Como administrador:**

1. Acesse **"Gerenciar Reservas"**
2. ✅ **Resultado esperado**: Ver todas as reservas do sistema
3. Clique **"Aprovar"** em uma reserva pendente
4. ✅ **Resultado esperado**: Status muda para "Aprovada"

**Teste de Relatórios:**
1. Acesse **"Relatórios"**
2. ✅ **Resultado esperado**:
   - Estatísticas gerais
   - Salas mais utilizadas
   - Usuários mais ativos
   - Distribuição por status

#### 🔄 **Teste 6: Conflitos de Reserva**

1. Crie uma reserva para hoje, 10:00-12:00
2. Tente criar outra reserva para a mesma sala, 11:00-13:00
3. ✅ **Resultado esperado**: Sistema deve permitir (conflitos são gerenciados por aprovação)

### 4. **Testes de Interface**

#### 📱 **Responsividade**
1. Teste em diferentes tamanhos de tela
2. ✅ **Resultado esperado**: Layout se adapta corretamente

#### 🎨 **Componentes UI**
1. Teste todos os botões e formulários
2. Verifique estados de loading
3. ✅ **Resultado esperado**: Feedback visual adequado

### 5. **Dados de Teste Pré-configurados**

O sistema já vem com:
- **8 salas** de diferentes tipos
- **Horários de funcionamento** configurados
- **Recursos** variados (projetor, computadores, etc.)
- **Políticas de segurança** ativas

### 6. **Troubleshooting**

#### ❌ **Erro: "Missing Supabase environment variables"**
- **Solução**: Verifique se o arquivo `.env` está configurado corretamente

#### ❌ **Erro: "relation does not exist"**
- **Solução**: Execute o script SQL no Supabase SQL Editor

#### ❌ **Não consigo ver o menu admin**
- **Solução**: Verifique se o role foi atualizado no banco e faça logout/login

#### ❌ **Reservas não aparecem**
- **Solução**: Verifique as políticas RLS no Supabase

### 7. **Próximos Passos**

Após os testes básicos, você pode:
1. **Personalizar salas** - Adicionar/editar salas via interface admin
2. **Testar notificações** - Configurar SMTP para emails
3. **Importar usuários** - Integrar com LDAP/Active Directory
4. **Customizar relatórios** - Adicionar métricas específicas

---

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Confira os logs do Supabase Dashboard
3. Consulte a documentação no README.md

**O sistema está pronto para uso em produção!** 🚀