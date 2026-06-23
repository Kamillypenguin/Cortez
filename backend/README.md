# OrganizerAgend — Backend API

## Stack
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **ORM:** Prisma
- **Banco:** PostgreSQL (local)
- **Auth:** JWT + bcrypt

## Setup rápido

### 1. Configure o banco
Edite `backend/.env` com suas credenciais:
```
DATABASE_URL="postgresql://SEU_USER:SUA_SENHA@localhost:5432/organizeragend"
JWT_SECRET="sua_chave_secreta"
PORT=3001
```

### 2. Crie o banco no PostgreSQL
```sql
CREATE DATABASE organizeragend;
```

### 3. Execute as migrações
```bash
cd backend
npm run db:migrate   # cria as tabelas
npm run db:generate  # gera o Prisma Client
```

### 4. (Opcional) Popule com dados de demonstração
```bash
npm run db:seed
# Usuário: kamil@organizeragend.com / Senha: demo123
```

### 5. Inicie o servidor
```bash
npm run dev   # desenvolvimento (hot reload)
npm start     # produção
```

## Endpoints

| Método | Rota            | Descrição              | Auth |
|--------|-----------------|------------------------|------|
| POST   | /auth/register  | Criar conta            | —    |
| POST   | /auth/login     | Login                  | —    |
| GET    | /auth/me        | Dados do usuário       | JWT  |
| GET    | /tasks          | Listar tarefas         | JWT  |
| POST   | /tasks          | Criar tarefa           | JWT  |
| PUT    | /tasks/:id      | Editar tarefa          | JWT  |
| DELETE | /tasks/:id      | Excluir tarefa         | JWT  |
| GET    | /events?day=26  | Listar eventos do dia  | JWT  |
| POST   | /events         | Criar evento           | JWT  |
| PUT    | /events/:id     | Editar evento          | JWT  |
| DELETE | /events/:id     | Excluir evento         | JWT  |
