# Tasks Backend API

Backend API desenvolvido com NestJS, TypeORM e PostgreSQL para o Tasks Dashboard, seguindo os princípios da Arquitetura Hexagonal (Ports & Adapters).

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![NestJS](https://img.shields.io/badge/NestJS-9.0-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.7-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)

## 📋 Sobre o Projeto

API RESTful robusta e escalável para gerenciamento completo de usuários, squads (equipes) e tarefas, com foco em segurança, validação de dados e arquitetura limpa.

### ✨ Principais Funcionalidades

- 🏗️ **Arquitetura Hexagonal** - Separação clara de responsabilidades
- 🔍 **Busca Avançada** - Pesquisa com LIKE em múltiplos campos
- 📄 **Paginação** - Sistema completo de paginação configurável
- ✅ **Validação Robusta** - class-validator em todos os inputs
- 🔒 **Segurança** - Helmet, CORS, SQL Injection prevention
- 🗃️ **Relacionamentos** - Tasks vinculadas a Users e Squads
- 📊 **Metadados** - Informações de paginação em todas as respostas
- 🐳 **Docker** - PostgreSQL containerizado
- 🔄 **Auto-sync** - TypeORM sincronização automática (dev)

## 🛠️ Stack Tecnológico

### Core
- **NestJS 9.4.3** - Framework progressivo Node.js
- **TypeScript 4.7.4** - Superset JavaScript tipado
- **Node.js 18+** - Runtime JavaScript

### Database
- **TypeORM 0.3.28** - ORM para TypeScript/JavaScript
- **PostgreSQL 15** - Banco de dados relacional
- **pg 8.16.3** - Driver PostgreSQL

### Validação e Transformação
- **class-validator 0.14.3** - Validação baseada em decorators
- **class-transformer 0.5.1** - Transformação de objetos

### Segurança
- **Helmet 8.1.0** - Headers HTTP seguros
- **CORS** - Controle de origem cruzada

### DevOps
- **Docker Compose** - Orquestração de containers
- **PostgreSQL Alpine** - Imagem leve do PostgreSQL

## 📁 Estrutura do Projeto (Arquitetura Hexagonal)

```
tasks-backend/
├── docker-compose.yml         # Configuração PostgreSQL
├── .env                       # Variáveis de ambiente (gitignored)
├── .env.example              # Template de variáveis
├── src/
│   ├── main.ts               # Entry point com configurações
│   ├── app.module.ts         # Módulo raiz
│   │
│   ├── common/               # Recursos compartilhados
│   │   ├── dto/
│   │   │   └── pagination-query.dto.ts    # DTO de paginação
│   │   └── interfaces/
│   │       └── paginated-result.interface.ts
│   │
│   ├── users/                # Módulo de Usuários
│   │   ├── domain/           # 🔵 DOMAIN LAYER
│   │   │   └── user.entity.ts
│   │   ├── application/      # 🟢 APPLICATION LAYER
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   └── users.service.ts
│   │   ├── infrastructure/   # 🟡 INFRASTRUCTURE LAYER
│   │   │   └── users.controller.ts
│   │   └── users.module.ts
│   │
│   ├── squads/               # Módulo de Squads
│   │   ├── domain/
│   │   │   └── squad.entity.ts
│   │   ├── application/
│   │   │   ├── dto/
│   │   │   │   ├── create-squad.dto.ts
│   │   │   │   └── update-squad.dto.ts
│   │   │   └── squads.service.ts
│   │   ├── infrastructure/
│   │   │   └── squads.controller.ts
│   │   └── squads.module.ts
│   │
│   └── tasks/                # Módulo de Tarefas
│       ├── domain/
│       │   └── task.entity.ts
│       ├── application/
│       │   ├── dto/
│       │   │   ├── create-task.dto.ts
│       │   │   └── update-task.dto.ts
│       │   └── tasks.service.ts
│       ├── infrastructure/
│       │   └── tasks.controller.ts
│       └── tasks.module.ts
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18 ou superior
- Docker e Docker Compose
- npm ou yarn

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <repository-url>
cd tasks-backend
```

2. **Instale as dependências**
```bash
npm install --legacy-peer-deps
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=tasks_user
DATABASE_PASSWORD=tasks_pass_2024
DATABASE_NAME=tasks

# Application
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5175
```

4. **Inicie o PostgreSQL com Docker**
```bash
docker-compose up -d
```

5. **Execute a aplicação**
```bash
# Modo desenvolvimento (watch mode)
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3000`

## 📡 Documentação da API

### Base URL
```
http://localhost:3000/api
```

### Formato de Resposta Paginada

Todas as rotas de listagem retornam:
```typescript
{
  data: T[],           // Array de resultados
  meta: {
    total: number,     // Total de registros
    page: number,      // Página atual
    limit: number,     // Itens por página
    totalPages: number // Total de páginas
  }
}
```

---

## 👥 Módulo de Usuários

### Entidade User

```typescript
{
  id: string,          // UUID
  name: string,        // Nome completo
  email: string,       // Email único
  createdAt: Date,     // Data de criação
  updatedAt: Date      // Data de atualização
}
```

### Endpoints

#### 📋 Listar Usuários
```http
GET /api/users
```

**Query Parameters:**
- `search` (opcional) - Busca por nome ou email
- `page` (opcional) - Número da página (default: 1)
- `limit` (opcional) - Itens por página (default: 5)

**Exemplo:**
```bash
curl "http://localhost:3000/api/users?search=john&page=1&limit=10"
```

**Resposta (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-12-10T10:00:00.000Z",
      "updatedAt": "2024-12-10T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### 🔍 Buscar Usuário por ID
```http
GET /api/users/:id
```

**Resposta (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-12-10T10:00:00.000Z",
  "updatedAt": "2024-12-10T10:00:00.000Z"
}
```

**Erro (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "User with ID {id} not found"
}
```

#### ➕ Criar Usuário
```http
POST /api/users
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Validações:**
- `name`: obrigatório, string, máximo 255 caracteres
- `email`: obrigatório, formato de email válido, único, máximo 255 caracteres

**Resposta (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-12-10T10:00:00.000Z",
  "updatedAt": "2024-12-10T10:00:00.000Z"
}
```

**Erro (409 Conflict):**
```json
{
  "statusCode": 409,
  "message": "Email already exists"
}
```

#### ✏️ Atualizar Usuário
```http
PATCH /api/users/:id
```

**Body (todos os campos opcionais):**
```json
{
  "name": "John Doe Updated",
  "email": "john.new@example.com"
}
```

**Resposta (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe Updated",
  "email": "john.new@example.com",
  "createdAt": "2024-12-10T10:00:00.000Z",
  "updatedAt": "2024-12-10T11:00:00.000Z"
}
```

#### 🗑️ Deletar Usuário
```http
DELETE /api/users/:id
```

**Resposta (204 No Content)**

---

## 🏢 Módulo de Squads

### Entidade Squad

```typescript
{
  id: string,          // UUID
  name: string,        // Nome da squad
  description: string, // Descrição (HTML)
  createdAt: Date,
  updatedAt: Date
}
```

### Endpoints

#### 📋 Listar Squads
```http
GET /api/squads?search=alpha&page=1&limit=5
```

**Busca em:** nome, descrição

#### 🔍 Buscar Squad por ID
```http
GET /api/squads/:id
```

#### ➕ Criar Squad
```http
POST /api/squads
```

**Body:**
```json
{
  "name": "Team Alpha",
  "description": "<p>Frontend development team</p>"
}
```

**Validações:**
- `name`: obrigatório, string, máximo 255 caracteres
- `description`: opcional, string (suporta HTML)

#### ✏️ Atualizar Squad
```http
PATCH /api/squads/:id
```

#### 🗑️ Deletar Squad
```http
DELETE /api/squads/:id
```

---

## ✅ Módulo de Tarefas

### Entidade Task

```typescript
{
  id: string,
  title: string,
  description: string,      // HTML
  status: TaskStatus,       // 'todo' | 'doing' | 'done'
  priority: TaskPriority,   // 'low' | 'medium' | 'high'
  dueDate: Date,           // Nullable
  userId: string,          // FK para User (nullable)
  squadId: string,         // FK para Squad (nullable)
  user: User,              // Relação eager loaded
  squad: Squad,            // Relação eager loaded
  createdAt: Date,
  updatedAt: Date
}
```

### Enums

**TaskStatus:**
- `todo` - A fazer
- `doing` - Em progresso
- `done` - Concluído

**TaskPriority:**
- `low` - Baixa
- `medium` - Média
- `high` - Alta

### Endpoints

#### 📋 Listar Tarefas
```http
GET /api/tasks?search=login&page=1&limit=5
```

**Busca em:** título, descrição

**Resposta inclui relações:**
```json
{
  "data": [
    {
      "id": "...",
      "title": "Implement login",
      "description": "<p>Create authentication screen</p>",
      "status": "doing",
      "priority": "high",
      "dueDate": "2024-12-31",
      "userId": "...",
      "squadId": "...",
      "user": {
        "id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "squad": {
        "id": "...",
        "name": "Team Alpha",
        "description": "..."
      },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "meta": { ... }
}
```

#### 🔍 Buscar Tarefa por ID
```http
GET /api/tasks/:id
```

**Inclui relações com user e squad**

#### ➕ Criar Tarefa
```http
POST /api/tasks
```

**Body:**
```json
{
  "title": "Implement login feature",
  "description": "<p>Create login page with authentication</p>",
  "status": "todo",
  "priority": "high",
  "dueDate": "2024-12-31",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "squadId": "660e8400-e29b-41d4-a716-446655440000"
}
```

**Validações:**
- `title`: obrigatório, string, máximo 255 caracteres
- `description`: opcional, string (HTML)
- `status`: opcional, enum TaskStatus (default: 'todo')
- `priority`: opcional, enum TaskPriority (default: 'medium')
- `dueDate`: opcional, formato ISO date
- `userId`: opcional, UUID válido
- `squadId`: opcional, UUID válido

#### ✏️ Atualizar Tarefa
```http
PATCH /api/tasks/:id
```

**Body (todos os campos opcionais):**
```json
{
  "title": "Updated title",
  "status": "done",
  "priority": "low"
}
```

#### 🗑️ Deletar Tarefa
```http
DELETE /api/tasks/:id
```

---

## 🔒 Segurança

### Headers HTTP (Helmet)
- Content Security Policy
- X-DNS-Prefetch-Control
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

### CORS
Configurado para aceitar requisições apenas da origem especificada em `CORS_ORIGIN`

### Validação de Entrada
- Whitelist de propriedades (`whitelist: true`)
- Rejeição de propriedades não permitidas (`forbidNonWhitelisted: true`)
- Transformação automática de tipos (`transform: true`)

### SQL Injection
- TypeORM usa queries parametrizadas
- Proteção automática contra SQL Injection

### Validações Específicas

**Usuários:**
- Email único no banco
- Formato de email válido
- Comprimento máximo de campos

**Tarefas:**
- Validação de enums (status, priority)
- Validação de UUIDs para relações
- Validação de formato de data

## 🏗️ Arquitetura Hexagonal Detalhada

### Domain Layer (Núcleo)
**Responsabilidade:** Entidades de negócio e regras de domínio

**Arquivos:**
- `*.entity.ts` - Entidades TypeORM com decorators
- Enums de domínio (TaskStatus, TaskPriority)

**Características:**
- Independente de frameworks
- Regras de negócio puras
- Sem dependências externas

### Application Layer (Casos de Uso)
**Responsabilidade:** Lógica de aplicação e orquestração

**Arquivos:**
- `*.service.ts` - Serviços com lógica de negócio
- `dto/*.dto.ts` - Data Transfer Objects
- Interfaces de repositórios (implícitas via TypeORM)

**Características:**
- Casos de uso da aplicação
- Validações de negócio
- Orquestração de entidades

### Infrastructure Layer (Adaptadores)
**Responsabilidade:** Comunicação com o mundo externo

**Arquivos:**
- `*.controller.ts` - Controllers REST
- Implementação de repositórios (TypeORM)

**Características:**
- Adaptadores de entrada (Controllers)
- Adaptadores de saída (Repositories)
- Frameworks e bibliotecas

## 🐳 Docker e PostgreSQL

### Docker Compose

O arquivo `docker-compose.yml` usa variáveis de ambiente:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: tasks-postgres
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    ports:
      - '${DATABASE_PORT}:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DATABASE_USER} -d ${DATABASE_NAME}']
      interval: 10s
      timeout: 5s
      retries: 5
```

### Comandos Docker

```bash
# Iniciar PostgreSQL
docker-compose up -d

# Ver logs
docker-compose logs -f postgres

# Parar PostgreSQL
docker-compose down

# Remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Reiniciar
docker-compose restart

# Status
docker-compose ps
```

### Acesso ao PostgreSQL

```bash
# Via Docker
docker exec -it tasks-postgres psql -U tasks_user -d tasks

# Via psql local
psql -h localhost -p 5432 -U tasks_user -d tasks
```

## 📦 Scripts NPM

```bash
# Desenvolvimento
npm run start:dev      # Watch mode com hot reload
npm run start:debug    # Debug mode

# Produção
npm run build          # Compilar TypeScript
npm run start:prod     # Executar build

# Testes
npm run test           # Testes unitários
npm run test:watch     # Testes em watch mode
npm run test:cov       # Coverage
npm run test:e2e       # Testes end-to-end

# Qualidade de Código
npm run lint           # ESLint
npm run format         # Prettier
```

## 🔄 TypeORM Sync

**Desenvolvimento:**
- `synchronize: true` - Auto-sync do schema
- Mudanças nas entities refletem automaticamente no DB

**Produção:**
- `synchronize: false` - Desabilitado
- Use migrations para mudanças de schema

## 📝 Licença

MIT

## 👨‍💻 Autor

**Lobo Rio**
- GitHub: [@Lobo-rio](https://github.com/Lobo-rio)

---

⭐ **Dica:** Para desenvolvimento full-stack, execute este backend junto com o [Tasks Dashboard](https://github.com/Lobo-rio/tasks-dashboard)
