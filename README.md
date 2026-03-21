# TaskPro

Aplicación web SaaS para gestión de tareas y proyectos — Evaluación Técnica Seven Suite.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 + React + DevExtreme React |
| Backend | .NET 8, C#, Entity Framework 8, ASP.NET Core |
| BD Relacional | SQL Server 2022 |
| BD No Relacional | MongoDB 7 (comentarios) |
| Auth | JWT Bearer (interno) |
| Contenedores | Docker + docker-compose |
| CI/CD | Azure DevOps Pipelines → Azure Container Registry → Azure App Service |

## Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [.NET SDK 8](https://dotnet.microsoft.com/download) *(solo para desarrollo local sin Docker)*
- [Node.js 20](https://nodejs.org) *(solo para desarrollo local sin Docker)*

## Levantar en local (docker-compose)

```bash
docker-compose up --build
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Swagger | http://localhost:5000/swagger |
| SQL Server | localhost:1433 |
| MongoDB | localhost:27017 |

## Desarrollo local sin Docker

**Backend:**
```bash
cd backend
# Ajustar connection strings en appsettings.Development.json
dotnet run --project 02.Service/API/API.csproj
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Arquitectura Backend (Clean Architecture)

```
backend/
├── 00.Persistence/
│   ├── Infrastructure/   ← EF Core, AppDbContext, Migrations, AutoMapper, FluentValidation, MongoDB
│   └── Repository/       ← Implementaciones de repositorios
├── 01.Logic/
│   ├── Domain/           ← Entidades, Interfaces, Excepciones, Enums
│   └── BusinessLogic/    ← Ports (interfaces de servicios) + Adapters (implementaciones)
├── 02.Service/
│   └── API/              ← Controllers, Middleware, Program.cs, appsettings
└── 03.Test/
    └── TaskPro.Tests/    ← Tests unitarios (xUnit + Moq + FluentAssertions)
```

## Arquitectura Frontend

```
frontend/src/app/
├── core/
│   ├── models/     ← Interfaces TypeScript
│   ├── services/   ← auth, api, project, task, comment, user
│   └── guards/     ← AuthGuard
├── modules/        ← Componentes por feature
├── pages/          ← Rutas Next.js App Router
│   ├── (auth)/login
│   ├── (auth)/register
│   ├── (main)/dashboard
│   ├── (main)/projects/[id]
│   ├── (main)/projects/[id]/tasks/[taskId]
│   └── (main)/users
└── shared/
    ├── layouts/    ← MainLayout, AuthLayout
    └── components/ ← Componentes reutilizables
```

## API Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| POST | /api/auth/login | Autenticación JWT |
| POST | /api/auth/register | Registro de usuario |
| GET/PUT/DELETE | /api/users/{id} | Gestión de usuarios |
| GET/POST | /api/projects | Listar / crear proyectos |
| GET/PUT/DELETE | /api/projects/{id} | Detalle / editar / eliminar |
| GET/POST/DELETE | /api/projects/{id}/members/{userId} | Gestión de miembros |
| GET/POST | /api/projects/{id}/tasks | Tareas del proyecto |
| GET/PUT/DELETE | /api/projects/{id}/tasks/{taskId} | Gestión de tareas |
| GET/POST | /api/tasks/{taskId}/comments | Comentarios (MongoDB) |
| PUT/DELETE | /api/tasks/{taskId}/comments/{id} | Editar / eliminar comentario |

## CI/CD Azure DevOps

Los pipelines se encuentran en `.azure/`:
- `backend-pipeline.yml` — trigger en `backend/**`, build → test → Docker → deploy
- `frontend-pipeline.yml` — trigger en `frontend/**`, build → Docker → deploy

**Variable group `taskpro-secrets` requerido en Azure DevOps:**
- `ACR_SERVICE_CONNECTION` — Service connection al ACR
- `ACR_LOGIN_SERVER` — ej. `taskpro.azurecr.io`
- `AZURE_SUBSCRIPTION` — Service connection a la suscripción
- `BACKEND_APP_SERVICE_NAME` — nombre del App Service del backend
- `FRONTEND_APP_SERVICE_NAME` — nombre del App Service del frontend
- `NEXT_PUBLIC_API_URL` — URL pública del API

## Principios aplicados

- **KISS** — código directo, sin abstracciones innecesarias
- **SOLID** — inyección de dependencias, interfaces por capa, responsabilidad única
- **Clean Architecture** — capas desacopladas: Domain → BusinessLogic → Infrastructure → API
