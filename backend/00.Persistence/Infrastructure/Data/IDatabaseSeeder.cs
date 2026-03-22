using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Infrastructure.Data;

public interface IDatabaseSeeder
{
    int Order { get; }
    Task SeedAsync(AppDbContext db, IConfiguration configuration, IHostEnvironment environment, CancellationToken cancellationToken);
}

