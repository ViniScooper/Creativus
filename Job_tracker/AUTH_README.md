# 🚀 Sistema de Autenticação - Job Tracker

## ✨ O que foi implementado

### Backend (API)
- ✅ Sistema de autenticação com JWT
- ✅ Registro e login de usuários
- ✅ Dois perfis: Aluno e Professor
- ✅ Rotas protegidas por autenticação
- ✅ CRUD completo de projetos
- ✅ Sistema de entregas
- ✅ Sistema de feedback
- ✅ Permissões baseadas em perfil

### Frontend
- ✅ Tela de Login/Registro moderna com glassmorphism
- ✅ Context API para gerenciamento de autenticação
- ✅ Rotas protegidas
- ✅ Sidebar com informações do usuário
- ✅ Logout funcional
- ✅ Redirecionamento automático

## 🔧 Como usar

### 1. Iniciar o Backend

```bash
cd c:\Users\vini\Music\ETE\api_users

# Gerar o cliente Prisma (se ainda não foi feito)
npx prisma generate

# Popular o banco de dados com dados de teste
node seed.js

# Iniciar o servidor
node server.js
```

O servidor vai rodar em `http://localhost:3000`

### 2. Iniciar o Frontend

```bash
cd c:\Users\vini\Music\ETE\Job_tracker

# Iniciar o dev server
npm run dev
```

O frontend vai rodar em `http://localhost:5174` (ou 5173)

## 👤 Credenciais de Teste

### Aluno
- **Email:** aluno@teste.com
- **Senha:** 123456

### Professor
- **Email:** professor@teste.com
- **Senha:** 123456

## 🎯 Fluxo do Usuário

### Para Alunos:
1. Fazer login com credenciais de aluno
2. Ver dashboard com seus projetos
3. Criar novos projetos
4. Fazer upload de entregas
5. Receber e visualizar feedback dos professores
6. Acompanhar o progresso dos projetos

### Para Professores:
1. Fazer login com credenciais de professor
2. Ver todos os projetos de todos os alunos
3. Visualizar entregas dos alunos
4. Dar feedback nos projetos
5. Acompanhar o progresso geral

## 🔐 Endpoints da API

### Autenticação
- `POST /auth/register` - Registrar novo usuário
- `POST /auth/login` - Fazer login
- `GET /auth/me` - Obter dados do usuário autenticado

### Projetos
- `GET /projects` - Listar projetos (filtrado por perfil)
- `GET /projects/:id` - Obter projeto específico
- `POST /projects` - Criar projeto (apenas alunos)
- `PUT /projects/:id` - Atualizar projeto

### Entregas
- `POST /deliveries` - Criar entrega

### Feedback
- `POST /feedback` - Adicionar feedback (apenas professores)

## 📋 Próximos Passos

Para completar a integração, você ainda pode:
- [ ] Conectar a página Dashboard para buscar projetos da API
- [ ] Implementar upload real de arquivos
- [ ] Adicionar paginação nas listagens
- [ ] Implementar filtros e busca com a API
- [ ] Adicionar notificações de feedback
- [ ] Implementar edição de perfil

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js + Express
- Prisma ORM
- MongoDB
- JWT para autenticação
- bcryptjs para hash de senhas

### Frontend
- React
- React Router
- Context API
- Lucide React (ícones)

## 🎨 Recursos Visuais

- Design moderno com gradientes e glassmorphism
- Animações suaves
- Tema escuro
- Interface responsiva
- Feedback visual para todas as ações
