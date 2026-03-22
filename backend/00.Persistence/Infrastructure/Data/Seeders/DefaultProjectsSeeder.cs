using Domain.Entity;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using TaskStatus = Domain.Enums.TaskStatus;

namespace Infrastructure.Data.Seeders;

public class DefaultProjectsSeeder : IDatabaseSeeder
{
    public int Order => 200;

    public async Task SeedAsync(AppDbContext db, IConfiguration configuration, IHostEnvironment environment, CancellationToken cancellationToken)
    {
        if (!environment.IsDevelopment())
            return;

        if (await db.Projects.AnyAsync(cancellationToken))
            return;

        var admin = await db.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Admin, cancellationToken);
        var member = await db.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Member, cancellationToken);

        if (admin is null)
            return;

        var now = DateTime.UtcNow;

        // ── Proyecto 1: Rediseño de Plataforma Web ──────────────────────────
        var project1 = new Project
        {
            Name = "Rediseño de Plataforma Web",
            Description = "Modernización completa del sitio web corporativo con nuevo stack tecnológico.",
            OwnerId = admin.Id,
            CreatedAt = now.AddDays(-60),
            UpdatedAt = now.AddDays(-60),
        };

        // ── Proyecto 2: App Móvil de Inventarios ────────────────────────────
        var project2 = new Project
        {
            Name = "App Móvil de Inventarios",
            Description = "Aplicación móvil para gestión de inventario en tiempo real con escáner QR.",
            OwnerId = admin.Id,
            CreatedAt = now.AddDays(-45),
            UpdatedAt = now.AddDays(-45),
        };

        // ── Proyecto 3: Integración ERP ─────────────────────────────────────
        var project3 = new Project
        {
            Name = "Integración con ERP",
            Description = "Conexión bidireccional entre el sistema de ventas y el ERP corporativo.",
            OwnerId = member is not null ? member.Id : admin.Id,
            CreatedAt = now.AddDays(-30),
            UpdatedAt = now.AddDays(-30),
        };

        // ── Proyecto 4: Portal de Clientes ──────────────────────────────────
        var project4 = new Project
        {
            Name = "Portal de Clientes",
            Description = "Plataforma self-service para que los clientes consulten pedidos y facturas.",
            OwnerId = admin.Id,
            CreatedAt = now.AddDays(-15),
            UpdatedAt = now.AddDays(-15),
        };

        db.Projects.AddRange(project1, project2, project3, project4);
        await db.SaveChangesAsync(cancellationToken);

        // ── Miembros de proyecto ─────────────────────────────────────────────
        var members = new List<ProjectMember>();

        members.Add(new ProjectMember { ProjectId = project1.Id, UserId = admin.Id, JoinedAt = project1.CreatedAt });
        members.Add(new ProjectMember { ProjectId = project2.Id, UserId = admin.Id, JoinedAt = project2.CreatedAt });
        members.Add(new ProjectMember { ProjectId = project3.Id, UserId = member is not null ? member.Id : admin.Id, JoinedAt = project3.CreatedAt });
        members.Add(new ProjectMember { ProjectId = project4.Id, UserId = admin.Id, JoinedAt = project4.CreatedAt });

        if (member is not null)
        {
            members.Add(new ProjectMember { ProjectId = project1.Id, UserId = member.Id, JoinedAt = project1.CreatedAt });
            members.Add(new ProjectMember { ProjectId = project2.Id, UserId = member.Id, JoinedAt = project2.CreatedAt });
            members.Add(new ProjectMember { ProjectId = project4.Id, UserId = member.Id, JoinedAt = project4.CreatedAt });
        }

        db.ProjectMembers.AddRange(members);
        await db.SaveChangesAsync(cancellationToken);

        // ── Tareas ───────────────────────────────────────────────────────────
        var tasks = new List<TaskItem>
        {
            // Proyecto 1 – Rediseño Web
            new() { Title = "Análisis de requerimientos UX", Description = "Entrevistar stakeholders y documentar necesidades del usuario.", ProjectId = project1.Id, AssignedUserId = admin.Id, Priority = TaskPriority.High, Status = TaskStatus.Completed, DueDate = now.AddDays(-40), CreatedAt = project1.CreatedAt, UpdatedAt = now.AddDays(-40) },
            new() { Title = "Diseño de wireframes", Description = "Crear wireframes de alta fidelidad para las pantallas principales.", ProjectId = project1.Id, AssignedUserId = member?.Id, Priority = TaskPriority.High, Status = TaskStatus.Completed, DueDate = now.AddDays(-30), CreatedAt = project1.CreatedAt, UpdatedAt = now.AddDays(-30) },
            new() { Title = "Desarrollo frontend (React)", Description = "Implementar las vistas en React según los diseños aprobados.", ProjectId = project1.Id, AssignedUserId = member?.Id, Priority = TaskPriority.Critical, Status = TaskStatus.InProgress, DueDate = now.AddDays(10), CreatedAt = project1.CreatedAt.AddDays(5), UpdatedAt = now.AddDays(-5) },
            new() { Title = "Integración con API REST", Description = "Conectar el frontend con los endpoints del backend.", ProjectId = project1.Id, AssignedUserId = admin.Id, Priority = TaskPriority.High, Status = TaskStatus.Pending, DueDate = now.AddDays(20), CreatedAt = project1.CreatedAt.AddDays(10), UpdatedAt = project1.CreatedAt.AddDays(10) },
            new() { Title = "Pruebas de usabilidad", Description = "Sesiones de prueba con usuarios reales y documentación de hallazgos.", ProjectId = project1.Id, AssignedUserId = null, Priority = TaskPriority.Medium, Status = TaskStatus.Pending, DueDate = now.AddDays(30), CreatedAt = project1.CreatedAt.AddDays(15), UpdatedAt = project1.CreatedAt.AddDays(15) },

            // Proyecto 2 – App Móvil
            new() { Title = "Configuración del entorno React Native", Description = "Instalar y configurar el entorno de desarrollo móvil.", ProjectId = project2.Id, AssignedUserId = admin.Id, Priority = TaskPriority.High, Status = TaskStatus.Completed, DueDate = now.AddDays(-35), CreatedAt = project2.CreatedAt, UpdatedAt = now.AddDays(-35) },
            new() { Title = "Módulo de autenticación", Description = "Login con biometría y gestión de sesiones.", ProjectId = project2.Id, AssignedUserId = member?.Id, Priority = TaskPriority.Critical, Status = TaskStatus.InProgress, DueDate = now.AddDays(-5), CreatedAt = project2.CreatedAt.AddDays(3), UpdatedAt = now.AddDays(-10) },
            new() { Title = "Escáner de códigos QR", Description = "Integrar cámara para lectura de QR y códigos de barras.", ProjectId = project2.Id, AssignedUserId = admin.Id, Priority = TaskPriority.High, Status = TaskStatus.Pending, DueDate = now.AddDays(15), CreatedAt = project2.CreatedAt.AddDays(7), UpdatedAt = project2.CreatedAt.AddDays(7) },
            new() { Title = "Sincronización offline", Description = "Implementar caché local con sincronización al reconectarse.", ProjectId = project2.Id, AssignedUserId = null, Priority = TaskPriority.Medium, Status = TaskStatus.Pending, DueDate = now.AddDays(25), CreatedAt = project2.CreatedAt.AddDays(10), UpdatedAt = project2.CreatedAt.AddDays(10) },

            // Proyecto 3 – Integración ERP
            new() { Title = "Mapeo de entidades y campos", Description = "Documentar correspondencia entre entidades del sistema y el ERP.", ProjectId = project3.Id, AssignedUserId = member?.Id ?? admin.Id, Priority = TaskPriority.High, Status = TaskStatus.Completed, DueDate = now.AddDays(-20), CreatedAt = project3.CreatedAt, UpdatedAt = now.AddDays(-20) },
            new() { Title = "Desarrollo del conector ETL", Description = "Crear procesos de extracción, transformación y carga de datos.", ProjectId = project3.Id, AssignedUserId = admin.Id, Priority = TaskPriority.Critical, Status = TaskStatus.InProgress, DueDate = now.AddDays(5), CreatedAt = project3.CreatedAt.AddDays(5), UpdatedAt = now.AddDays(-3) },
            new() { Title = "Pruebas de integridad de datos", Description = "Verificar que los datos migrados son correctos en ambos sistemas.", ProjectId = project3.Id, AssignedUserId = null, Priority = TaskPriority.High, Status = TaskStatus.Pending, DueDate = now.AddDays(20), CreatedAt = project3.CreatedAt.AddDays(10), UpdatedAt = project3.CreatedAt.AddDays(10) },

            // Proyecto 4 – Portal de Clientes
            new() { Title = "Definir arquitectura del portal", Description = "Decidir stack tecnológico y estructura de la aplicación.", ProjectId = project4.Id, AssignedUserId = admin.Id, Priority = TaskPriority.Medium, Status = TaskStatus.Completed, DueDate = now.AddDays(-10), CreatedAt = project4.CreatedAt, UpdatedAt = now.AddDays(-10) },
            new() { Title = "Módulo de consulta de pedidos", Description = "Pantalla donde el cliente puede ver el estado de sus órdenes.", ProjectId = project4.Id, AssignedUserId = member?.Id, Priority = TaskPriority.High, Status = TaskStatus.InProgress, DueDate = now.AddDays(14), CreatedAt = project4.CreatedAt.AddDays(2), UpdatedAt = now.AddDays(-2) },
            new() { Title = "Módulo de descarga de facturas", Description = "Generación y descarga de PDF de facturas históricas.", ProjectId = project4.Id, AssignedUserId = null, Priority = TaskPriority.Medium, Status = TaskStatus.Pending, DueDate = now.AddDays(28), CreatedAt = project4.CreatedAt.AddDays(5), UpdatedAt = project4.CreatedAt.AddDays(5) },
        };

        db.Tasks.AddRange(tasks);
        await db.SaveChangesAsync(cancellationToken);
    }
}
