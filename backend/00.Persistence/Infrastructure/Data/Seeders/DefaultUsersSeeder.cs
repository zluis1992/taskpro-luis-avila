using Domain.Enums;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Infrastructure.Data.Seeders;

public class DefaultUsersSeeder : IDatabaseSeeder
{
    public int Order => 100;

    public async Task SeedAsync(AppDbContext db, IConfiguration configuration, IHostEnvironment environment, CancellationToken cancellationToken)
    {
        if (!environment.IsDevelopment())
            return;

        await AppDbSeeder.SeedUsersAsync(
            db,
            [
                new SeedUser("Administrador", "admin@taskpro.local", "TaskPro123!", UserRole.Admin),
                new SeedUser("Usuario", "user@taskpro.local", "TaskPro123!", UserRole.Member)
            ],
            cancellationToken);
    }
}
