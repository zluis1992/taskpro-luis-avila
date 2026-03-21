# TaskPro — Plan de Trabajo

## Stack
- **Backend:** .NET 8, C#, Entity Framework 8, ASP.NET Core, AutoMapper, FluentValidation, Serilog
- **Frontend:** Next.js (React), DevExtreme React, SCSS
- **BD Relacional:** SQL Server (usuarios, proyectos, tareas)
- **BD No Relacional:** MongoDB (comentarios de tareas)
- **Auth:** JWT Bearer interno (sin IDP externo)
- **Contenedores:** Docker + docker-compose
- **CI/CD:** Azure DevOps Pipelines → Azure Container Registry → Azure App Service
- **Principios:** KISS · SOLID · Clean Architecture

---

## Estructura de carpetas objetivo

```
taskpro/
├── backend/
│   ├── 00.Persistence/
│   │   ├── Infrastructure/      ← EF8, AppDbContext, Migrations, Mapper, Validators
│   │   └── Repository/          ← Repos por entidad
│   ├── 01.Logic/
│   │   ├── Domain/              ← Entidades, Interfaces, Excepciones
│   │   └── BusinessLogic/       ← Adapters, Factories, Ports
│   ├── 02.Service/
│   │   └── API/                 ← Controllers, JWT, Swagger, Program.cs
│   ├── 03.Test/
│   │   └── TaskPro.Tests/
│   ├── taskpro.sln
│   └── Dockerfile
├── frontend/
│   ├── src/app/
│   │   ├── core/                ← interceptors, guards, services, models
│   │   ├── modules/             ← project/, task/, user/, comment/
│   │   ├── pages/               ← dashboard/, login/, projects/, tasks/
│   │   └── shared/              ← layouts, componentes, pipes
│   ├── Dockerfile
│   └── next.config.js
├── docker-compose.yml
├── docker-compose.override.yml
└── README.md
```

---

## Fase 1 — Backend

### 1.1 Solución y proyectos
- [x] Crear solución `taskpro.sln`
- [x] Crear proyecto `Domain.csproj`
- [x] Crear proyecto `BusinessLogic.csproj`
- [x] Crear proyecto `Infrastructure.csproj`
- [x] Crear proyecto `Repository.csproj`
- [x] Crear proyecto `API.csproj`
- [x] Crear proyecto `TaskPro.Tests.csproj`
- [x] Configurar referencias entre proyectos

### 1.2 Domain
- [x] Entidad `User` (Id, Name, Email, PasswordHash, Role, CreatedAt)
- [x] Entidad `Project` (Id, Name, Description, OwnerId, CreatedAt)
- [x] Entidad `ProjectMember` (ProjectId, UserId)
- [x] Entidad `TaskItem` (Id, Title, Description, Status, Priority, ProjectId, AssignedUserId, DueDate, CreatedAt)
- [x] Entidad `Comment` — solo modelo de dominio, persiste en MongoDB (Id, TaskId, AuthorId, Content, CreatedAt)
- [x] Enums: `TaskStatus`, `TaskPriority`, `UserRole`
- [x] Interfaces de repositorio: `IUserRepository`, `IProjectRepository`, `ITaskRepository`, `ICommentRepository`
- [x] Excepciones custom: `NotFoundException`, `UnauthorizedException`, `ValidationException`

### 1.3 Infrastructure
- [x] `AppDbContext` con DbSets: Users, Projects, ProjectMembers, Tasks
- [x] Configuraciones Fluent API por entidad
- [x] Migración inicial
- [x] Perfiles AutoMapper (Entity ↔ DTO)
- [x] Validadores FluentValidation por request
- [x] `MongoDbContext` para Comments (conexión, colección)

### 1.4 Repository
- [x] `GenericRepository<T>` base
- [x] `UserRepository`
- [x] `ProjectRepository`
- [x] `TaskRepository`
- [x] `CommentRepository` (MongoDB.Driver)

### 1.5 BusinessLogic
- [x] Ports/Interfaces de servicios: `IAuthService`, `IProjectService`, `ITaskService`, `ICommentService`, `IUserService`
- [x] Adapters: lógica de negocio por entidad

### 1.6 API
- [x] `Program.cs`: DI, JWT, Swagger, CORS, Serilog, EF, MongoDB
- [x] `appsettings.json` / `appsettings.Development.json` / `appsettings.Production.json`
- [x] Middleware de manejo global de errores
- [x] `AuthController` — POST /auth/login, POST /auth/register
- [x] `UsersController` — CRUD /users
- [x] `ProjectsController` — CRUD /projects, GET /projects/{id}/members, POST /projects/{id}/members
- [x] `TasksController` — CRUD /projects/{projectId}/tasks
- [x] `CommentsController` — CRUD /tasks/{taskId}/comments
- [x] Swagger con autenticación JWT

### 1.7 Tests
- [x] Tests unitarios de servicios clave (AuthService, ProjectService, TaskService)

---

## Fase 2 — Docker

### 2.1 Dockerfiles
- [x] `backend/Dockerfile` — multi-stage (sdk build → aspnet runtime)
- [x] `frontend/Dockerfile` — multi-stage (node build → nginx o next start)

### 2.2 docker-compose
- [x] Servicio `sqlserver` — SQL Server 2022, volumen persistente, healthcheck
- [x] Servicio `mongodb` — MongoDB 7, volumen persistente, healthcheck
- [x] Servicio `backend` — depende de sqlserver + mongodb, variables de entorno
- [x] Servicio `frontend` — depende de backend
- [x] `docker-compose.override.yml` — puertos locales, hot reload dev

---

## Fase 3 — Frontend

### 3.1 Setup
- [x] Crear proyecto Next.js con TypeScript
- [x] Instalar DevExtreme React + tema base
- [x] Configurar SCSS global + variables
- [x] Configurar estructura de carpetas (core/, modules/, pages/, shared/)
- [x] Configurar variables de entorno (NEXT_PUBLIC_API_URL)

### 3.2 Core
- [x] `core/models/` — interfaces TS: User, Project, Task, Comment, Auth
- [x] `core/services/auth.service.ts` — login, logout, token storage
- [x] `core/services/api.service.ts` — cliente HTTP base con interceptor JWT
- [x] `core/services/` — ProjectService, TaskService, CommentService, UserService
- [x] `core/guards/` — AuthGuard (rutas protegidas)
- [x] `core/interceptors/` — HttpRequest interceptor (Bearer token)

### 3.3 Shared
- [x] `shared/layouts/` — MainLayout (sidebar + header), AuthLayout
- [x] `shared/components/` — PageHeader, ConfirmDialog, LoadingSpinner
- [x] `shared/components/` — componentes DevExtreme wrappers si aplica

### 3.4 Módulos
- [x] `modules/user/` — formulario crear/editar usuario
- [x] `modules/project/` — formulario crear/editar proyecto, lista de miembros
- [x] `modules/task/` — formulario crear/editar tarea, cambio de estado
- [x] `modules/comment/` — lista de comentarios, formulario nuevo comentario

### 3.5 Páginas
- [x] `pages/login` — formulario login con JWT
- [x] `pages/dashboard` — resumen de proyectos y tareas
- [x] `pages/projects` — lista de proyectos (DxDataGrid)
- [x] `pages/projects/[id]` — detalle de proyecto + lista de tareas
- [x] `pages/projects/[id]/tasks/[taskId]` — detalle de tarea + comentarios
- [x] `pages/users` — lista y gestión de usuarios (solo admin)

---

## Fase 4 — CI/CD Azure DevOps

### 4.1 Backend pipeline (`azure-pipelines-backend.yml`)
- [x] Trigger en `main` cuando cambia `backend/**`
- [x] Stage Build: dotnet restore → build → test
- [x] Stage Docker: build imagen → push a Azure Container Registry
- [x] Stage Deploy: actualizar Azure App Service con nueva imagen

### 4.2 Frontend pipeline (`azure-pipelines-frontend.yml`)
- [x] Trigger en `main` cuando cambia `frontend/**`
- [x] Stage Build: npm ci → next build
- [x] Stage Docker: build imagen → push a Azure Container Registry
- [x] Stage Deploy: actualizar Azure App Service con nueva imagen

### 4.3 Variables y secretos
- [x] Variable group en Azure DevOps con: ACR credentials, App Service names, connection strings

---

## Fase 5 — Documentación
- [x] `README.md` — descripción, prerrequisitos, cómo levantar con docker-compose, estructura del proyecto
- [x] Swagger disponible en `/swagger` (dev y staging)
- [x] Comentarios en código solo donde la lógica no sea autoevidente

---

## Orden de ejecución

```
Fase 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7
     ↓
Fase 2.1 → 2.2
     ↓
Fase 3.1 → 3.2 → 3.3 → 3.4 → 3.5
     ↓
Fase 4.1 → 4.2 → 4.3
     ↓
Fase 5
```
