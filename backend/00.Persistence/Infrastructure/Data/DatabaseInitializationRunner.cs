using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Data;

public class DatabaseInitializationRunner
{
    private readonly AppDbContext _db;
    private readonly IEnumerable<IDatabaseSeeder> _seeders;
    private readonly IConfiguration _configuration;
    private readonly IHostEnvironment _environment;
    private readonly ILogger<DatabaseInitializationRunner> _logger;

    public DatabaseInitializationRunner(
        AppDbContext db,
        IEnumerable<IDatabaseSeeder> seeders,
        IConfiguration configuration,
        IHostEnvironment environment,
        ILogger<DatabaseInitializationRunner> logger)
    {
        _db = db;
        _seeders = seeders;
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    public async Task RunAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Aplicando migraciones EF Core...");
        await _db.Database.MigrateAsync(cancellationToken);
        _logger.LogInformation("Migraciones aplicadas.");

        var orderedSeeders = _seeders.OrderBy(s => s.Order).ToList();
        if (orderedSeeders.Count == 0)
            return;

        _logger.LogInformation("Ejecutando seeders (count={SeederCount})...", orderedSeeders.Count);
        foreach (var seeder in orderedSeeders)
        {
            await seeder.SeedAsync(_db, _configuration, _environment, cancellationToken);
        }
        _logger.LogInformation("Seeders ejecutados.");
    }
}
