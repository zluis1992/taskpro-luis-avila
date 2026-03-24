# TaskPro - By Luis Avila 🚀

Aplicación web SaaS para la gestión de tareas y proyectos. Construida con .NET 8, Next.js 16, SQL Server, MongoDB y Docker.

Accesos a recursos desplegados:
https://taskpro-webapp-fxdpfagsgzb9b8cg.canadacentral-01.azurewebsites.net

usar credenciales indicadas en la sección Credenciales por defecto (desarrollo)

---

## Tabla de Contenido

- [Descripción General](#descripción-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Instalación y Ejecución Local con Docker](#instalación-y-ejecución-local-con-docker)
- [Arquitectura Backend](#arquitectura-backend)
- [Arquitectura Frontend](#arquitectura-frontend)
- [Bases de Datos](#bases-de-datos)
- [Seguridad — Autenticación JWT](#seguridad--autenticación-jwt)
- [Principios y Patrones de Diseño](#principios-y-patrones-de-diseño)
- [CI/CD y Versionamiento](#cicd-y-versionamiento)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)

---

## Descripción General

TaskPro permite a los usuarios crear y gestionar proyectos, añadir tareas con diferentes estados y prioridades, asignar miembros del equipo a tareas individuales, y mantener comunicación mediante un sistema de comentarios por tarea. Incluye autenticación JWT, roles de usuario (Admin/Member), dashboard con gráficos de progreso, y un diseño responsive adaptable a cualquier dispositivo.

**Stack tecnológico:**

| Capa             | Tecnología                                    |
| ---------------- | --------------------------------------------- |
| Frontend         | Next.js 16 + React 19 + DevExtreme React 24.2 |
| Backend          | .NET 8, C#, Entity Framework 8, ASP.NET Core  |
| BD Relacional    | SQL Server 2022                               |
| BD No Relacional | MongoDB 7 (comentarios)                       |
| Autenticación    | JWT Bearer                                    |
| Contenedores     | Docker + docker-compose                       |
| CI/CD            | GitHub Actions + Azure DevOps Pipelines       |
| Versionamiento   | SemVer automático con Conventional Commits    |

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                           │
│  ci.yml → Build + Test    release.yml → SemVer + GH Release     │
│  build-images.yml → Docker build + push a GHCR                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       Azure DevOps                              │
│  backend-pipeline.yml   frontend-pipeline.yml                   │
│  Build → Docker (ACR) → Deploy (Azure App Service)              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────────────┐     ┌──────────────┐
│   Frontend   │────▶│     Backend API      │────▶│  SQL Server  │
│  Next.js 16  │     │  .NET 8 / ASP.NET    │     │  2022        │
│  Puerto 3000 │     │  Puerto 5000         │     │  Puerto 1433 │
└──────────────┘     └──────────┬───────────┘     └──────────────┘
                                │
                                ▼
                       ┌──────────────┐
                       │   MongoDB 7  │
                       │  Puerto 27017│
                       └──────────────┘
```

**Decisiones de diseño de persistencia:**

- **SQL Server** almacena datos relacionales con estructura definida: usuarios, proyectos, tareas y relaciones de membresía.
- **MongoDB** almacena comentarios de tareas, aprovechando su esquema flexible para un modelo con mayor variabilidad y crecimiento sin límite de profundidad.

---

## Instalación y Ejecución Local con Docker

### Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [.NET SDK 8](https://dotnet.microsoft.com/download) (solo para desarrollo local sin Docker)
- [Node.js 20](https://nodejs.org) (solo para desarrollo local sin Docker)

### Configuración del entorno

Copia el archvio `env.example` y crea un archivo `.env` para establecer los valores de datos sencibles y cambiantes de tu ambiente

### Levantar todos los servicios usando docker

```bash
docker-compose up --build
```

Esto inicia 4 contenedores aislados:

| Servicio    | URL / Puerto                  | Contenedor          |
| ----------- | ----------------------------- | ------------------- |
| Frontend    | http://localhost:3000         | `taskpro-frontend`  |
| Backend API | http://localhost:5000/api     | `taskpro-backend`   |
| Swagger UI  | http://localhost:5000/swagger | —                   |
| SQL Server  | localhost:1433                | `taskpro-sqlserver` |
| MongoDB     | localhost:27017               | `taskpro-mongodb`   |

### Desarrollo con hot reload

El `docker-compose.override.yml` monta los directorios fuente como volúmenes y ejecuta `dotnet watch` (backend) y `npm run dev` (frontend) para recarga automática:

```bash
docker-compose up --build   # Incluye override automáticamente
```

### Desarrollo local sin Docker

**Backend:**

```bash
cd backend
dotnet run --project 02.Service/API/API.csproj
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Credenciales por defecto (desarrollo)

Al iniciar el backend en modo `Development`, los seeders crean usuarios de prueba si la base de datos está vacía:

| Rol    | Email               | Contraseña  |
| ------ | ------------------- | ----------- |
| Admin  | admin@taskpro.local | TaskPro123! |
| Member | user@taskpro.local  | TaskPro123! |

---

## Arquitectura Backend

El backend sigue **Clean Architecture** con separación estricta de responsabilidades en 4 capas numeradas y 6 proyectos .NET.

### Estructura de capas

```
backend/
├── 00.Persistence/                    ← Capa de acceso a datos
│   ├── Infrastructure/                ← EF Core, MongoDB, Configuraciones, DTOs, Validadores, Mappers, Seeders
│   │   ├── Configuration/             ← Fluent API configurations
│   │   ├── Data/                      ← AppDbContext, DatabaseInitializationRunner, Seeders
│   │   ├── Mapper/                    ← AutoMapper MappingProfile
│   │   ├── Migrations/                ← EF Core migrations
│   │   ├── Mongo/                     ← MongoDbContext
│   │   ├── Validators/                ← FluentValidation validators
│   │   └── DTOs/                      ← Data Transfer Objects
│   └── Repository/                    ← Implementaciones de repositorios (adaptadores de persistencia)
│       ├── Base/                      ← GenericRepository<T>, UnitOfWork
│       ├── User/                      ← UserRepository
│       ├── Project/                   ← ProjectRepository
│       ├── Task/                      ← TaskRepository
│       └── Comment/                   ← CommentRepository (MongoDB)
├── 01.Logic/                          ← Capa de lógica de negocio
│   ├── Domain/                        ← Entidades, Interfaces (puertos), Excepciones, Enums
│   │   ├── Common/                    ← BaseEntity
│   │   ├── Entity/                    ← User, Project, ProjectMember, TaskItem, Comment
│   │   ├── Enum/                      ← UserRole, TaskStatus, TaskPriority
│   │   ├── Exceptions/                ← NotFoundException, UnauthorizedException, BusinessException
│   │   └── Interface/                 ← IGenericRepository<T>, IUnitOfWork, IUserRepository, IProjectRepository, etc.
│   └── BusinessLogic/                 ← Servicios de negocio (puertos + adaptadores)
│       ├── Ports/                     ← IAuthService, IUserService, IProjectService, ITaskService, ICommentService
│       └── Adapters/                  ← AuthService, UserService, ProjectService, TaskService, CommentService
├── 02.Service/                        ← Capa de presentación / API
│   └── API/
│       ├── Controllers/               ← AuthController, UsersController, ProjectsController, TasksController, CommentsController
│       ├── Extensions/                ← ServiceCollectionExtensions (registro DI)
│       ├── Middleware/                ← ErrorHandlingMiddleware
│       ├── Models/                    ← ApiResponse<T> (envelope)
│       ├── Program.cs                 ← Punto de entrada y configuración del pipeline
│       └── appsettings.json           ← Configuración de entorno
└── 03.Test/                           ← Capa de testing
    └── TaskPro.Tests/                 ← xUnit + Moq + FluentAssertions
```

### Grafo de dependencias entre proyectos

```
Domain (sin dependencias)
  ↑
Infrastructure (referencia Domain)
  ↑
Repository (referencia Infrastructure + Domain)
  ↑
BusinessLogic (referencia Domain + Infrastructure)
  ↑
API (referencia Domain + BusinessLogic + Infrastructure + Repository)
  ↑
TaskPro.Tests (referencia Domain + BusinessLogic + Repository + Infrastructure)
```

La dependencia **siempre apunta hacia capas inferiores**, cumpliendo la regla de Clean Architecture. La capa `Domain` no tiene dependencias externas de ningún tipo.

### Inyección de Dependencias (DI)

La configuración centralizada de DI reside en `ServiceCollectionExtensions.cs`. Cada grupo de servicios se registra mediante un método de extensión dedicado, invocado desde `Program.cs`:

```csharp
builder.Services.AddDatabase(builder.Configuration);        // EF Core + MongoDB
builder.Services.AddDatabaseInitialization();               // Seeders
builder.Services.AddRepositories();                         // Repositorios + UnitOfWork
builder.Services.AddBusinessServices();                     // Servicios de negocio
builder.Services.AddJwtAuthentication(builder.Configuration); // JWT
builder.Services.AddValidators();                           // FluentValidation
builder.Services.AddAutoMapperProfiles();                   // AutoMapper
```

Todos los repositorios y servicios se registran como `Scoped`, garantizando que cada request HTTP tenga su propia instancia del contexto de datos y servicios.

### Patrón Repository

Se implementa un **repositorio genérico** (`GenericRepository<T>`) que proporciona operaciones CRUD estándar (`GetByIdAsync`, `GetAllAsync`, `AddAsync`, `UpdateAsync`, `DeleteAsync`, `FindAsync`, `ExistsAsync`). Cada repositorio específico hereda de este y añade métodos especializados:

| Interfaz                | Implementación         | Métodos adicionales                                                                                     |
| ----------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `IGenericRepository<T>` | `GenericRepository<T>` | Base CRUD                                                                                               |
| `IUserRepository`       | `UserRepository`       | `GetByEmailAsync`, `EmailExistsAsync`                                                                   |
| `IProjectRepository`    | `ProjectRepository`    | `GetByIdWithDetailsAsync`, `GetByOwnerAsync`, `GetByMemberAsync`, `AddMemberAsync`, `RemoveMemberAsync` |
| `ITaskRepository`       | `TaskRepository`       | `GetByIdWithDetailsAsync`, `GetByProjectAsync`, `GetByAssignedUserAsync`, `GetByStatusAsync`            |
| `ICommentRepository`    | `CommentRepository`    | CRUD MongoDB directo con `IMongoCollection<Comment>`                                                    |

Los repositorios **no llaman `SaveChangesAsync` directamente**; solo modifican el `ChangeTracker` de EF Core. La persistencia recae en el Unit of Work.

### Patrón Unit of Work

Se implementa el patrón **Unit of Work** para centralizar la gestión de transacciones y garantizar la atomicidad de las operaciones. La interfaz `IUnitOfWork` y su implementación `UnitOfWork` viven en `Domain/Interface` y `Repository/Base` respectivamente.

**Interfaz `IUnitOfWork`:**

```csharp
public interface IUnitOfWork : IDisposable
{
    Task<int> CompleteAsync();              // Guarda cambios (SaveChangesAsync)
    Task BeginTransactionAsync();           // Inicia transacción explícita
    Task CommitTransactionAsync();          // Confirma transacción
    Task RollbackTransactionAsync();        // Revierte transacción
}
```

**Responsabilidades:**

| Método                       | Descripción                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `CompleteAsync()`            | Ejecuta `context.SaveChangesAsync()`, persistiendo todos los cambios pendientes |
| `BeginTransactionAsync()`    | Inicia una transacción de base de datos explícita                               |
| `CommitTransactionAsync()`   | Guarda cambios y confirma la transacción                                        |
| `RollbackTransactionAsync()` | Revierte la transacción en caso de error                                        |

**Flujo de uso en servicios:**

```csharp
public class ProjectService : IProjectService
{
    private readonly IProjectRepository _projectRepository;
    private readonly IUnitOfWork _unitOfWork;

    public async Task<ProjectDto> CreateAsync(CreateProjectRequest request, int ownerId)
    {
        var project = _mapper.Map<Project>(request);
        var created = await _projectRepository.AddAsync(project);          // Solo agrega al ChangeTracker
        await _projectRepository.AddMemberAsync(new ProjectMember { ... }); // Solo agrega al ChangeTracker
        await _unitOfWork.CompleteAsync();                                 // Persiste AMBOS cambios en una sola transacción
        return _mapper.Map<ProjectDto>(created);
    }
}
```

**Ventajas sobre el enfoque anterior:**

1. **Atomicidad**: Múltiples operaciones se persisten en una sola llamada a `SaveChangesAsync`, garantizando que todas se completen o ninguna.
2. **Control transaccional**: Operaciones críticas pueden usar `BeginTransactionAsync` / `CommitTransactionAsync` para rollback automático en caso de error.
3. **Separación de responsabilidades**: Los repositorios solo manejan lectura/escritura en memoria; el Unit of Work controla la persistencia.
4. **Testabilidad**: En tests unitarios, se puede mock `IUnitOfWork` sin necesidad de base de datos real.

**Excepción — MongoDB:** El `CommentRepository` persiste directamente porque MongoDB no usa el ChangeTracker de EF Core. Cada operación `InsertOneAsync`, `ReplaceOneAsync` o `UpdateManyAsync` se ejecuta inmediatamente.

### Soft Delete

Todas las entidades que heredan de `BaseEntity` implementan **soft delete**: en lugar de eliminar registros físicamente, se marca `IsDeleted = true` y se registra `DeletedAt`. El `GenericRepository<T>` detecta automáticamente si la entidad hereda de `BaseEntity` y ejecuta la lógica correspondiente. Un **Global Query Filter** en `AppDbContext.OnModelCreating()` filtra automáticamente los registros eliminados en todas las consultas:

```csharp
foreach (var entityType in modelBuilder.Model.GetEntityTypes())
{
    if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
    {
        modelBuilder.Entity(entityType.ClrType)
            .HasQueryFilter(e => EF.Property<bool>(e, "IsDeleted") == false);
    }
}
```

### AutoMapper

El `MappingProfile` define las conversiones entre entidades y DTOs:

- `User` ↔ `UserDto`, `CreateUserRequest`, `UpdateUserRequest`
- `Project` ↔ `ProjectDto`, `CreateProjectRequest`, `UpdateProjectRequest`
- `TaskItem` ↔ `TaskDto`, `CreateTaskRequest`, `UpdateTaskRequest`
- `Comment` ↔ `CommentDto`, `CreateCommentRequest`, `UpdateCommentRequest`

Los mapeos incluyen transformaciones personalizadas como `ForMember` para campos derivados (`OwnerName`, `AssignedUserName`).

### FluentValidation

Cada DTO de entrada tiene su validador dedicado, registrado automáticamente vía `AddValidatorsFromAssemblyContaining`:

| Validador                | Reglas principales                             |
| ------------------------ | ---------------------------------------------- |
| `LoginValidator`         | Email requerido, formato válido                |
| `CreateUserValidator`    | Nombre, email único, contraseña segura         |
| `CreateProjectValidator` | Nombre requerido, longitud máxima              |
| `CreateTaskValidator`    | Título requerido, prioridad 0-3, fecha >= hoy  |
| `UpdateTaskValidator`    | Todos los campos requeridos para actualización |

### Manejo de errores

Un `ErrorHandlingMiddleware` centraliza el manejo de excepciones no controladas, mapeando excepciones del dominio a códigos HTTP apropiados:

| Excepción del dominio   | HTTP Status |
| ----------------------- | ----------- |
| `NotFoundException`     | 404         |
| `UnauthorizedException` | 403         |
| `BusinessException`     | 400         |
| Cualquier otra          | 500         |

Todas las respuestas se envuelven en un envelope `ApiResponse<T>` con estructura `{ success, message, data, statusCode }`.

### Data Seeders

El sistema de seeders utiliza una interfaz `IDatabaseSeeder` con un campo `Order` para controlar la secuencia de ejecución. El `DatabaseInitializationRunner` ejecuta automáticamente al inicio de la aplicación:

1. Ejecuta migraciones pendientes de EF Core (`Database.MigrateAsync`)
2. Ejecuta seeders en orden ascendente

| Seeder                  | Order | Descripción                                                                              |
| ----------------------- | ----- | ---------------------------------------------------------------------------------------- |
| `DefaultUsersSeeder`    | 100   | Crea usuarios admin y member con contraseñas hasheadas (BCrypt, workFactor 12)           |
| `DefaultProjectsSeeder` | 200   | Crea 4 proyectos con miembros asignados y 16 tareas con diferentes estados y prioridades |

### Migraciones EF Core

| Migración       | Fecha      | Cambios                                                                     |
| --------------- | ---------- | --------------------------------------------------------------------------- |
| `InitialCreate` | 2026-03-21 | Crea tablas `Users`, `Projects`, `ProjectMembers`, `Tasks` con FK e índices |
| `AddSoftDelete` | 2026-03-22 | Añade columnas `IsDeleted` y `DeletedAt` a `Users`, `Tasks`, `Projects`     |

### Separación de capas y desacoplamiento

La arquitectura evita el acoplamiento mediante:

1. **Interfaces por capa**: Los controllers dependen de `IProjectService`, no de `ProjectService`. Los servicios dependen de `IProjectRepository`, no de `ProjectRepository`.
2. **Inversión de dependencias**: Las interfaces (puertos) viven en `Domain` y `BusinessLogic`, mientras que las implementaciones (adaptadores) viven en `Infrastructure` y `Repository`.
3. **DTOs como contrato**: Los controllers nunca exponen entidades directamente; siempre trabajan con DTOs mapeados vía AutoMapper.
4. **Excepciones del dominio**: Los servicios lanzan excepciones semánticas (`NotFoundException`, `BusinessException`) que el middleware traduce a HTTP, desacoplando la lógica de negocio del transporte.

---

## Arquitectura Frontend

El frontend utiliza **Next.js 16 con App Router** y **React 19**, aprovechando el Server Side Rendering (SSR) para mejorar el rendimiento inicial y la experiencia del usuario.

### Estructura del proyecto

```
frontend/src/app/
├── layout.tsx                    ← Root Layout (Server Component)
├── page.tsx                      ← Redirect SSR a /dashboard
├── (auth)/                       ← Route Group: rutas públicas
│   ├── layout.tsx                ← AuthLayout (centrado visual)
│   ├── login/page.tsx
│   └── register/page.tsx
├── (main)/                       ← Route Group: rutas protegidas
│   ├── layout.tsx                ← AuthGuard + MainLayout
│   ├── dashboard/                ← Dashboard con gráficos (PieChart, Chart)
│   │   ├── page.tsx
│   │   ├── hooks/useDashboard.ts
│   │   └── components/
│   ├── projects/                 ← CRUD de proyectos (DataGrid + Popup)
│   │   ├── page.tsx
│   │   ├── hooks/useProjects.ts
│   │   └── components/
│   ├── tasks/                    ← CRUD de tareas (DataGrid + Modal + Comments)
│   │   ├── page.tsx
│   │   ├── hooks/useTasks.ts
│   │   ├── types.ts, constants.ts
│   │   └── components/
│   └── users/                    ← CRUD de usuarios (DataGrid + Popup)
│       ├── page.tsx
│       ├── hooks/useUsers.ts
│       └── components/
├── core/                         ← Núcleo de la aplicación
│   ├── guards/AuthGuard.tsx      ← Protección de rutas
│   ├── models/                   ← Interfaces TypeScript (auth, user, project, task, comment)
│   ├── providers/                ← DevExtremeLicenseProvider
│   └── services/                 ← Servicios HTTP (api, auth, user, project, task, comment, version)
└── shared/                       ← Elementos compartidos
    ├── layouts/MainLayout.tsx    ← Layout principal con sidebar + toolbar
    └── components/               ← Badge, DxForm (wrapper dinámico de DevExtreme Form)
```

### Server Side Rendering (SSR)

El proyecto aprovecha SSR en múltiples niveles:

- **Root Layout**: Es un Server Component que renderiza el HTML base, metadata (title, description, icon) y carga CSS de DevExtreme en el servidor, reduciendo el tiempo hasta la primera pintura (FCP).
- **Redirect SSR**: La página raíz (`page.tsx`) ejecuta `redirect('/dashboard')` del lado del servidor, sin necesidad de JavaScript del cliente para la navegación inicial.
- **Compatibilidad con DevExtreme**: Los componentes DevExtreme que requieren APIs del navegador (DOM) se cargan mediante `next/dynamic` con `ssr: false`, evitando errores de hidratación:
  ```tsx
  const DxFormInner = dynamic(() => import("./dx-form-inner"), {ssr: false});
  ```
- **Output standalone**: `next.config.ts` configura `output: "standalone"`, generando un `server.js` autocontenido optimizado para Docker.

**Ventajas del SSR en este proyecto:**

1. El HTML inicial se genera en el servidor, mejorando SEO y tiempo de carga.
2. La autenticación se evalúa antes de enviar HTML al cliente (AuthGuard como componente cliente).
3. El CSS crítico se inyecta en el servidor, eliminando parpadeos visuales.

### Suite DevExtreme

El proyecto utiliza **DevExtreme 24.2** como suite de componentes UI enterprise. La localización está configurada en español.

**Componentes utilizados:**

| Categoría      | Componentes                                                                         | Uso                                                                             |
| -------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Data Grid**  | `DataGrid`, `Column`, `Paging`, `FilterRow`, `HeaderFilter`, `Scrolling`, `Toolbar` | CRUD de proyectos, tareas y usuarios con filtrado, paginación y acciones inline |
| **Charts**     | `PieChart`, `Chart`, `Series`, `Label`, `Legend`                                    | Dashboard: distribución de tareas por estado, tareas por proyecto               |
| **Forms**      | `Form`, `SimpleItem`, `ButtonItem`, `GroupItem`                                     | Formularios de login, registro, creación/edición de entidades                   |
| **Popups**     | `Popup`, `ScrollView`                                                               | Modales para crear/editar proyectos, tareas y usuarios                          |
| **Inputs**     | `TextBox`, `TextArea`, `SelectBox`, `DateBox`                                       | Campos de formulario con validación integrada                                   |
| **Navigation** | `TreeView`, `Toolbar`                                                               | Sidebar de navegación y barra superior                                          |
| **Feedback**   | `notify` (toast), `confirm` (dialog)                                                | Notificaciones de éxito/error, confirmaciones de eliminación                    |
| **Loading**    | `LoadPanel`                                                                         | Indicadores de carga durante peticiones asíncronas                              |

**Ventajas de DevExtreme:**

1. Componentes enterprise con funcionalidad avanzada out-of-the-box (sorting, filtering, paging, export).
2. DataGrid con rendimiento optimizado para grandes volúmenes de datos mediante virtualización.
3. Charts interactivos sin necesidad de librerías adicionales.
4. Localización integrada al español.
5. Tema consistente (`dx.light.css`) aplicado globalmente.
6. Formularios con validación declarativa integrada.

**Configuración Webpack:** Se configura `transpilePackages` para DevExtreme y un alias que redirige imports ESM a CJS, garantizando compatibilidad con SSR.

### Patrón arquitectónico del frontend

Cada módulo sigue un patrón consistente de 3 niveles:

1. **`page.tsx`** — Componente contenedor que orquesta hooks y componentes de presentación.
2. **`hooks/use*.ts`** — Custom hook que encapsula estado, lógica de negocio, y llamadas a servicios.
3. **`components/`** — Componentes de presentación (DataGrid, FormPopup) que reciben datos y callbacks via props.

```
page.tsx  →  useHook()  →  service  →  api.service.ts (Axios)
   ↓              ↓
   └─── components/ (DataGrid, Modal, Badge)
```

Este patrón logra:

- **Separación de preocupaciones**: La lógica de negocio está en hooks, la presentación en componentes.
- **Reutilización**: Los componentes de presentación son genéricos y pueden reutilizarse.
- **Testabilidad**: Los hooks y servicios se pueden testear independientemente de la UI.

### Capa de servicios

`api.service.ts` es el cliente HTTP centralizado con Axios:

- **Interceptor de request**: Inyecta automáticamente el token Bearer en cada petición.
- **Interceptor de response**: Muestra toasts de DevExtreme en mutaciones exitosas y redirige a `/login` en respuestas 401.
- **Wrapper genérico**: Funciones `get<T>`, `post<T>`, `put<T>`, `del` que extraen `data` del envelope `ApiResponse<T>`.

Los servicios por dominio (`auth.service`, `user.service`, `project.service`, `task.service`, `comment.service`) son wrappers sobre `api.service` con los endpoints específicos. El `auth.service` gestiona token y usuario en `localStorage` con guards de SSR (`typeof window !== 'undefined'`).

### Autenticación en frontend

- **AuthGuard**: Componente cliente que verifica `isAuthenticated()` en `useEffect` y redirige a `/login` si no hay token.
- Se aplica en el layout de `(main)/`, protegiendo todas las rutas internas.
- El interceptor de API redirige automáticamente si el backend responde 401.

---

## Bases de Datos

### SQL Server (datos relacionales)

Almacena la estructura core del sistema con relaciones definidas por Foreign Keys e índices optimizados.

**Modelo de datos:**

| Tabla            | Clave                             | Relaciones                                                                        |
| ---------------- | --------------------------------- | --------------------------------------------------------------------------------- |
| `Users`          | `Id` (int, PK)                    | Propietario de Projects, asignada a Tasks, miembro de Projects via ProjectMembers |
| `Projects`       | `Id` (int, PK)                    | FK → `Users.Id` (Owner, Restrict), contiene Tasks y ProjectMembers                |
| `ProjectMembers` | Composite (`ProjectId`, `UserId`) | FK → Projects (Cascade), FK → Users (Cascade)                                     |
| `Tasks`          | `Id` (int, PK)                    | FK → `Projects.Id` (Cascade), FK → `Users.Id` (AssignedUser, SetNull)             |

**Configuraciones Fluent API:**

- Índice único en `Users.Email`
- Cascada de eliminación en relaciones intermedias
- `SetNull` en la asignación de tareas (si se elimina un usuario, sus tareas quedan sin asignar)

### MongoDB (datos no relacionales)

Almacena comentarios de tareas, aprovechando el esquema flexible para un modelo de datos que puede crecer en complejidad sin migraciones.

**Colección:** `comments`

**Índice compuesto:** `TaskId` (ascendente) + `CreatedAt` (descendente) para consultas eficientes de comentarios por tarea ordenados cronológicamente.

**Estrategia de soft delete** aplicada también en MongoDB mediante `IsDeleted` y `DeletedAt`, con `UpdateManyAsync` para eliminar todos los comentarios de una tarea cuando esta se elimina.

---

## Seguridad — Autenticación JWT

La autenticación utiliza **JWT Bearer Tokens** con configuración estricta de validación:

| Parámetro              | Valor                                                           |
| ---------------------- | --------------------------------------------------------------- |
| Algoritmo              | HMAC-SHA256                                                     |
| Emisor (`Issuer`)      | `taskpro-api`                                                   |
| Audiencia (`Audience`) | `taskpro-client`                                                |
| Expiración             | 60 minutos (configurable)                                       |
| Claims                 | `sub` (userId), `email`, `name`, `role`, `jti` (token ID único) |

**Hashing de contraseñas:** BCrypt con workFactor 12. Incluye compatibilidad backward con SHA256 para migración automática de contraseñas legacy al hacer login.

**Protección de endpoints:**

- `/api/auth/login`, `/api/auth/register`, `/api/version` → Endpoints públicos
- Todos los demás → Requieren token JWT válido (`[Authorize]`)
- El `BaseController` extrae el `CurrentUserId` y `CurrentUserName` de los claims JWT para controlar acceso a recursos propios.

---

## Principios y Patrones de Diseño

### SOLID

| Principio                         | Aplicación                                                                                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S** — Responsabilidad Única     | Cada repositorio maneja una entidad. Cada servicio un área de negocio. Controllers delegan sin lógica. Middleware solo maneja errores.                                              |
| **O** — Abierto/Cerrado           | `IGenericRepository<T>` extensible sin modificar existentes. `IDatabaseSeeder` permite añadir seeders sin tocar el runner. AutoMapper extensible sin modificar profiles existentes. |
| **L** — Sustitución de Liskov     | Repositorios específicos sustituyen a `IGenericRepository<T>`. `CommentRepository` implementa su propia interfaz por la naturaleza diferente de MongoDB.                            |
| **I** — Segregación de Interfaces | Interfaces específicas por entidad (`IUserRepository`, `IProjectService`). `ICommentRepository` no hereda de `IGenericRepository` porque sus operaciones difieren (string IDs).     |
| **D** — Inversión de Dependencias | Controllers dependen de interfaces de servicio. Servicios dependen de interfaces de repositorio y `IUnitOfWork`. Todo registrado vía DI.                                            |

### KISS (Keep It Simple, Stupid)

- Código directo sin abstracciones innecesarias.
- No se usa MediatR, CQRS ni patrones adicionales cuando no se necesitan.
- Custom hooks en el frontend en lugar de stores globales complejos (Redux, Zustand).
- Respuestas API con envelope simple `{ success, message, data, statusCode }`.

### Clean Architecture

Las capas se comunican únicamente a través de interfaces (puertos) definidas en capas inferiores:

```
API (Controllers) → IPort (BusinessLogic) → IAdapter (Domain) → EF Core/MongoDB
     ↓                    ↓                        ↓
  DTOs               DTOs                    Entities
```

La regla de oro: **las dependencias siempre apuntan hacia adentro**. La capa `Domain` no conoce a ninguna otra capa.

---

## CI/CD y Versionamiento

### GitHub Actions

El proyecto utiliza 3 workflows que se ejecutan automáticamente en cada push a `main`:

#### `ci.yml` — Integración Continua

Trigger: push/PR a `main`. Ejecuta en paralelo:

- **Backend**: `dotnet restore` → `dotnet build -c Release` → `dotnet test` (logger TRX)
- **Frontend**: `npm ci` → `npm run build` → `npx jest --no-cache`

#### `release.yml` — Versionado Semántico Automático

Trigger: push a `main`. Analiza commits con **Conventional Commits** para determinar el bump de versión:

| Prefijo del commit           | Bump SemVer | Ejemplo       |
| ---------------------------- | ----------- | ------------- |
| `fix:`                       | **PATCH**   | 1.5.2 → 1.5.3 |
| `feat:`                      | **MINOR**   | 1.5.2 → 1.6.0 |
| `feat!:` o `BREAKING CHANGE` | **MAJOR**   | 1.5.2 → 2.0.0 |

El workflow:

1. Obtiene el último tag git
2. Analiza los mensajes de commit desde ese tag
3. Calcula la nueva versión SemVer
4. Genera un changelog categorizado (Nuevas funcionalidades, Correcciones, Otros)
5. Actualiza `version.json` con la nueva versión, fecha y hash de commit
6. Crea un commit `chore: bump version to vX.Y.Z`
7. Crea un tag `vX.Y.Z` y un GitHub Release con el changelog

#### `build-images.yml` — Construcción de imágenes Docker

Trigger: push a `main` o tags `v*`. Construye y publica imágenes en **GitHub Container Registry (GHCR)**:

| Imagen                             | Registry |
| ---------------------------------- | -------- |
| `ghcr.io/<owner>/taskpro-backend`  | GHCR     |
| `ghcr.io/<owner>/taskpro-frontend` | GHCR     |

Tags generados: SHA del commit, nombre de rama, versión SemVer, y `latest`.

### Azure DevOps Pipelines

Pipelines definidos en `.azure/` para despliegue en Azure:

| Pipeline                | Trigger                  | Stages                                             |
| ----------------------- | ------------------------ | -------------------------------------------------- |
| `backend-pipeline.yml`  | Cambios en `backend/**`  | Build → Test → Docker (ACR) → Deploy (App Service) |
| `frontend-pipeline.yml` | Cambios en `frontend/**` | Build → Docker (ACR) → Deploy (App Service)        |

Ambos pipelines despliegan imágenes Docker a **Azure App Service** vía **Azure Container Registry (ACR)**.

### Versionamiento

El archivo `version.json` en la raíz del proyecto contiene la versión actual y es actualizado automáticamente por `release.yml`:

```json
{
  "version": "1.5.2",
  "buildDate": "2026-03-23",
  "commitHash": "e7718f4"
}

El backend expone esta información via `GET /api/version` (leído del archivo `version.json`), y el frontend la muestra en el footer del `MainLayout`.

### Flujo CI/CD completo

```

Push a main
│
├── ci.yml ────────────── Build + Test (backend + frontend)
│
├── release.yml ──────── SemVer bump → Tag → GitHub Release
│ │
│ └─── Actualiza version.json
│
├── build-images.yml ─── Docker build + push → GHCR
│
├── Azure backend-pipeline.yml ── Build → Test → Docker (ACR) → Deploy App Service
│
└── Azure frontend-pipeline.yml ─ Build → Docker (ACR) → Deploy App Service

````

---

## API Endpoints

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | No | Autenticación, retorna JWT |
| `POST` | `/api/auth/register` | No | Registro de nuevo usuario |
| `GET` | `/api/users` | Sí | Listar usuarios |
| `GET` | `/api/users/{id}` | Sí | Detalle de usuario |
| `PUT` | `/api/users/{id}` | Sí | Actualizar usuario |
| `DELETE` | `/api/users/{id}` | Sí | Eliminar usuario (soft delete) |
| `GET` | `/api/projects` | Sí | Listar proyectos del usuario |
| `POST` | `/api/projects` | Sí | Crear proyecto |
| `GET` | `/api/projects/{id}` | Sí | Detalle de proyecto |
| `PUT` | `/api/projects/{id}` | Sí | Actualizar proyecto |
| `DELETE` | `/api/projects/{id}` | Sí | Eliminar proyecto (soft delete) |
| `POST` | `/api/projects/{id}/members/{userId}` | Sí | Añadir miembro al proyecto |
| `DELETE` | `/api/projects/{id}/members/{userId}` | Sí | Remover miembro del proyecto |
| `GET` | `/api/projects/{id}/tasks` | Sí | Listar tareas del proyecto |
| `POST` | `/api/projects/{id}/tasks` | Sí | Crear tarea |
| `GET` | `/api/projects/{id}/tasks/{taskId}` | Sí | Detalle de tarea |
| `PUT` | `/api/projects/{id}/tasks/{taskId}` | Sí | Actualizar tarea |
| `DELETE` | `/api/projects/{id}/tasks/{taskId}` | Sí | Eliminar tarea (soft delete) |
| `GET` | `/api/tasks/{taskId}/comments` | Sí | Listar comentarios de tarea |
| `POST` | `/api/tasks/{taskId}/comments` | Sí | Crear comentario |
| `PUT` | `/api/tasks/{taskId}/comments/{id}` | Sí | Actualizar comentario |
| `DELETE` | `/api/tasks/{taskId}/comments/{id}` | Sí | Eliminar comentario |
| `GET` | `/api/version` | No | Información de versión |

Documentación interactiva disponible en **Swagger UI**: http://localhost:5000/swagger

---

## Testing

### Backend — xUnit

| Suite | Framework | Herramientas | Ubicación |
|---|---|---|---|
| Tests unitarios de servicios | xUnit | Moq, FluentAssertions | `backend/03.Test/TaskPro.Tests/Services/` |
| Tests de repositorio | xUnit | EF Core InMemory | `backend/03.Test/TaskPro.Tests/Repositories/` |
| Tests de seeders | xUnit | EF Core InMemory | `backend/03.Test/TaskPro.Tests/Services/` |

Patrón **AAA** (Arrange-Act-Assert) en todos los tests. Mocking de repositorios en tests de servicios, base de datos InMemory para tests de integración.

Ejecutar:
```bash
cd backend
dotnet test
````

### Frontend — Jest

| Suite                       | Framework | Herramientas             | Ubicación                                   |
| --------------------------- | --------- | ------------------------ | ------------------------------------------- |
| Tests de servicios          | Jest 30   | ts-jest, Testing Library | `frontend/src/app/core/services/__tests__/` |
| Tests de tipos y constantes | Jest 30   | ts-jest                  | `frontend/src/app/(main)/tasks/__tests__/`  |

Ejecutar:

```bash
cd frontend
npm test
```

---

## Observaciones sobre el despliegue en Azure

> **Nota sobre rendimiento en Azure:** El entorno de producción desplegado en Azure utiliza recursos del **plan gratuito (Free Tier)** de Azure App Service. Este plan tiene limitaciones significativas que afectan el rendimiento de la aplicación:
>
> - **CPU y memoria limitados**: 1 GB de RAM compartida y 60 minutos de CPU diarios por plan. Una vez agotada la cuota de CPU, las respuestas del backend pueden tardar varios segundos o fallar.
> - **Cold start**: Las aplicaciones en tier gratuito se suspenden tras 20 minutos de inactividad. El primer request después de la suspensión puede tardar entre 15-30 segundos mientras el contenedor se reinicia.
> - **Sin escalado horizontal**: Solo se ejecuta una instancia, sin posibilidad de auto-scaling bajo carga.
> - **Conexiones concurrentes limitadas**: El número máximo de conexiones simultáneas es inferior al de un plan de producción.
> - **Ancho de banda**: 165 MB de transferencia de datos gratuita al mes.
>
> Estas limitaciones **no reflejan el rendimiento real** de la arquitectura. En un plan de producción (Basic, Standard o Premium), la aplicación ofrece tiempos de respuesta sub-segundo y alta disponibilidad.
>
> De igual forma, el **Azure SQL Database** y **CosmosDB - para MongoDB** utilizan tiers gratuitos con restricciones de almacenamiento (250 MB para SQL) y conexiones, lo cual puede generar latencia adicional en operaciones de base de datos.
